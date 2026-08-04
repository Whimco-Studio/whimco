'use client';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Image from 'next/image';
import GalleryGrid from './Gallery';
import ShowcaseStyles from './styles';
import useLikes from './useLikes';
import {
  CATEGORY_LABELS, INVITE_URL, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem,
} from './constants';

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return value;
}

function Stat({ label, value, started }: { label: string; value: number; started: boolean }) {
  const n = useCountUp(value, started);
  return (
    <div className="stat">
      <span className="stat-number">{n.toLocaleString('en-US')}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Showcase({ initialData }: { initialData: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const likes = useLikes();

  const statsRef = useRef<HTMLDivElement>(null);
  // Mirrors activeCategory for the curator retry loop further down, which
  // spans multiple renders and needs whatever category is current at the
  // moment each retry fires, not whatever was current when the loop
  // started. Kept in sync inline in pickCategory, the only setter.
  const activeCategoryRef = useRef(activeCategory);

  const stats = initialData?.stats;
  const categories = initialData?.categories ?? [];

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setStatsStarted(true); }),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Request generation, guarding fetchPage the same way useLikes.ts's
  // categoryGen guards recategorize. Two calls can be in flight together,
  // a chip click while the curator's mount refetch is still out, "load
  // more" fired twice, and without this whichever response lands last
  // wins regardless of which was requested last: a filtered click could
  // be overwritten by a slower, larger unfiltered response that was
  // already stale by the time it landed. Bump on entry, capture the
  // value, and only apply a response while it is still the newest
  // request. setLoading(false) stays unconditional in finally, so a
  // superseded request cannot strand the loading state on true.
  //
  // The return value tells a caller what happened, not just whether the
  // network call succeeded. 'applied' means this response is on screen
  // now. 'superseded' means a newer call already won before this one
  // landed, its data may be perfectly fine, it was simply too late.
  // 'failed' means the request itself errored. Only the curator mount
  // refetch below reads this, to tell a loss worth trying again
  // (superseded) apart from a loss that should not retry itself
  // (failed).
  const fetchGen = useRef(0);
  const fetchPage = useCallback(async (
    nextPage: number, category: string, replace: boolean, silent = false,
  ): Promise<'applied' | 'superseded' | 'failed'> => {
    const gen = ++fetchGen.current;
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage) });
      if (category) params.set('category', category);
      const res = await fetch(`${SHOWCASE_API_URL}?${params}`);
      if (!res.ok) throw new Error(`showcase fetch ${res.status}`);
      const data: ShowcaseData = await res.json();
      // A newer call already owns what's on screen; applying this reply
      // now would replace it with a stale, possibly mismatched answer.
      if (fetchGen.current !== gen) return 'superseded';
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      setPage(data.page);
      setPages(data.pages);
      return 'applied';
    } catch {
      // Leave current items in place; the button stays available to retry.
      return 'failed';
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const pickCategory = useCallback((category: string, updateUrl = true) => {
    activeCategoryRef.current = category;
    setActiveCategory(category);
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (category) url.searchParams.set('category', category);
      else url.searchParams.delete('category');
      window.history.replaceState(null, '', url);
    }
    // initialData is a snapshot from the moment the server rendered the
    // page. Painting it straight back in on a reset to All used to skip
    // the network, but that snapshot only gets staler the longer the tab
    // stays open, for every visitor, not only curators, so All now asks
    // fetchPage for a live page one exactly like every other filter does.
    fetchPage(1, category, true);
  }, [fetchPage]);

  // Shareable filtered views: /spotlight?category=ui applies the filter
  // on load (and chip clicks keep the URL in sync above).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (fromUrl) pickCategory(fromUrl, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A curator can retag an item from this gallery and the write lands in
  // Postgres instantly, but the page they're looking at can still be up to
  // ten minutes stale: five from the API cache, five more from ISR on top
  // of it. isCurator itself is only known once the credentialed /me call
  // resolves, so once it does, page one is pulled straight from the API
  // (the same uncached path fetchPage already uses for filters and load
  // more) and swapped in for whatever the server rendered. A non-curator,
  // or a curator whose /me call hasn't resolved yet, triggers nothing
  // here. silent so this background swap can't flash "Loading…" on the
  // load more button for a request nobody clicked.
  //
  // The ref guards against starting a second attempt chain, not against
  // retrying within the one chain it starts: it is set the moment a chain
  // begins, not once that chain finally lands, since ready/isCurator only
  // ever flip true once and the thing worth preventing is two concurrent
  // chains, not a chain that takes more than one try.
  const curatorRefetchStarted = useRef(false);
  useEffect(() => {
    if (!likes.ready || !likes.isCurator || curatorRefetchStarted.current) return;
    curatorRefetchStarted.current = true;
    // A URL-driven filter (?category=) already gets a fresh fetch from the
    // effect above, through the same uncached fetchPage. A second request
    // here would be identical, just a wasted round trip, so skip it.
    if (new URLSearchParams(window.location.search).get('category')) return;
    let cancelled = false;
    // A silent call here can lose the race to a chip click or "Show more"
    // firing while it's in flight, both bump the same fetchGen. Losing
    // does not mean the data was wrong, it means a different call for a
    // different view won and applied first, and left alone, page one
    // would stay on the stale snapshot for the rest of the visit with no
    // error and no second chance. So a superseded attempt just asks
    // again immediately, reading activeCategoryRef fresh each time in
    // case the curator has since switched filters, so a retry can never
    // land a stale, unfiltered answer over a filter they've since chosen.
    // A genuine fetch failure does not retry: fetchPage's own catch block
    // already has a contract for that, stale items stay up and the
    // surface that failed stays available to retry by hand, and retrying
    // it again here would just be a second, undeclared version of the
    // same policy.
    const attempt = async () => {
      const outcome = await fetchPage(1, activeCategoryRef.current, true, true);
      if (!cancelled && outcome === 'superseded') attempt();
    };
    attempt();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likes.ready, likes.isCurator]);

  return (
    <div className="showcase">
      <section className="hero">
        <p className="eyebrow"><span className="live-dot" aria-hidden />LIVE FROM THE NETWORK</p>
        <Image src="/spotlight-logo.png" alt="Spotlight" width={340} height={114} priority className="hero-logo" />
        <h1 className="headline">
          Post once.<br />
          <span className="beamed">Seen everywhere.</span>
        </h1>
        <p className="sub">
          Spotlight carries creators&apos; posts from any #creations channel to showcase
          channels across every connected server. Everything below is real work,
          shared by the network and ranked by hearts.
        </p>
        <div className="cta-row">
          <a className="cta-primary" href={INVITE_URL} target="_blank" rel="noopener noreferrer">
            Add Spotlight to Discord
          </a>
          <a className="cta-ghost" href="#how-it-works">See how it works ↓</a>
        </div>

        {stats && (
          <div className="stat-strip" ref={statsRef}>
            <Stat label="members reached" value={stats.member_reach} started={statsStarted} />
            <Stat label="servers connected" value={stats.server_count} started={statsStarted} />
            <Stat label="creations broadcast" value={stats.creations} started={statsStarted} />
            <Stat label="hearts given" value={stats.hearts_given} started={statsStarted} />
          </div>
        )}
      </section>

      <section className="gallery-section" aria-label="Creations broadcast by Spotlight">
        <div className="gallery-head">
          <h2 className="gallery-title">The showcase</h2>
          <span className="gallery-head-right">
            <a className="gallery-link" href="/spotlight/creators">BROWSE CREATORS →</a>
            {/* The two halves of the same broadcast: who sends it, and
                where it lands. The servers connected stat above counts
                exactly what this page lists. */}
            <a className="gallery-link" href="/spotlight/network">VIEW THE NETWORK →</a>
            <span className="gallery-note">refreshes every 5 minutes</span>
          </span>
        </div>

        {categories.length > 0 && (
          <div className="chips" role="group" aria-label="Filter by category">
            <button
              type="button"
              className={`chip ${activeCategory === '' ? 'chip-on' : ''}`}
              aria-pressed={activeCategory === ''}
              onClick={() => pickCategory('')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.category}
                type="button"
                className={`chip ${activeCategory === c.category ? 'chip-on' : ''}`}
                aria-pressed={activeCategory === c.category}
                onClick={() => pickCategory(c.category)}
              >
                {CATEGORY_LABELS[c.category] ?? c.category} <span className="chip-count">{c.count}</span>
              </button>
            ))}
          </div>
        )}

        <GalleryGrid
          items={items}
          likes={likes}
          showAuthor
          emptyText={initialData
            ? 'Nothing in the beam yet — creations appear here the moment they’re broadcast.'
            : 'The showcase is momentarily offline. The network is still broadcasting — check back shortly.'}
          canLoadMore={page < pages}
          loading={loading}
          onLoadMore={() => fetchPage(page + 1, activeCategory, false)}
        />
      </section>

      <ShowcaseStyles />
    </div>
  );
}
