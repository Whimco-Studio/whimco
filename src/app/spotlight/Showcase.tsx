'use client';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Image from 'next/image';
import GalleryGrid from './Gallery';
import ShowcaseStyles from './styles';
import useLikes from './useLikes';
import useInviteUrl from './useInviteUrl';
import {
  CATEGORY_LABELS, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem,
  SortMode, creationsIn,
} from './constants';

/** A count stated as a floor that stays true as it grows: 6,996 reads
    "6,900+" and 101 reads "100+". Plain text in the server render, so
    crawlers, link previews and slow connections see the real number
    instead of a counter animating up from zero. */
function atLeast(n: number): string {
  const step = n >= 1000 ? 100 : n >= 100 ? 100 : 10;
  return `${(Math.floor(n / step) * step).toLocaleString('en-US')}+`;
}

export default function Showcase({ initialData }: { initialData: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  // How many creations exist in the current view, which is the number the
  // link through to /spotlight/gallery promises. This page shows one page
  // and stops, so it holds no page counter of its own any more.
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [activeCategory, setActiveCategory] = useState('');
  // 'new' is the default the API also defaults to, so the server-rendered
  // first paint and this initial state always agree.
  const [sort, setSort] = useState<SortMode>('new');
  const [loading, setLoading] = useState(false);
  const likes = useLikes();
  const inviteUrl = useInviteUrl();

  // Mirrors activeCategory for the curator retry loop further down, which
  // spans multiple renders and needs whatever category is current at the
  // moment each retry fires, not whatever was current when the loop
  // started. Kept in sync inline in pickCategory, the only setter.
  const activeCategoryRef = useRef(activeCategory);
  // Same reason as activeCategoryRef: the curator retry loop below spans
  // renders and must re-read whichever tab is current when each retry
  // fires, or a retry can land a "new" page over a "top" one the visitor
  // switched to while it was in flight.
  const sortRef = useRef(sort);

  const stats = initialData?.stats;
  const categories = initialData?.categories ?? [];

  // Request generation, guarding loadView the same way useLikes.ts's
  // categoryGen guards recategorize. Two calls can be in flight together,
  // a chip click while the curator's mount refetch is still out, and
  // without this whichever response lands last wins regardless of which
  // was requested last: a filtered click could be overwritten by a
  // slower, larger unfiltered response that was already stale by the time
  // it landed. Bump on entry, capture the value, and only apply a
  // response while it is still the newest request. setLoading(false)
  // stays unconditional in finally, so a superseded request cannot strand
  // the loading state on true.
  //
  // The return value tells a caller what happened, not just whether the
  // network call succeeded. 'applied' means this response is on screen
  // now. 'superseded' means a newer call already won before this one
  // landed, its data may be perfectly fine, it was simply too late.
  // 'failed' means the request itself errored. Only the curator mount
  // refetch below reads this, to tell a loss worth trying again
  // (superseded) apart from a loss that should not retry itself
  // (failed).
  //
  // Always page one, and always a replacement. Depth belongs to
  // /spotlight/gallery now: this section is a fixed-length slab of proof
  // at the foot of the landing page, and it used to be able to grow to
  // eighty screens. How it works has its own page now.
  const fetchGen = useRef(0);
  const loadView = useCallback(async (
    category: string, mode: SortMode, silent = false,
  ): Promise<'applied' | 'superseded' | 'failed'> => {
    const gen = ++fetchGen.current;
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      // Only sent when it is not the default, so the common request keeps
      // one cache key on the API side rather than splitting it in two.
      if (mode !== 'new') params.set('sort', mode);
      const query = params.toString();
      const res = await fetch(query ? `${SHOWCASE_API_URL}?${query}` : SHOWCASE_API_URL);
      if (!res.ok) throw new Error(`showcase fetch ${res.status}`);
      const data: ShowcaseData = await res.json();
      // A newer call already owns what's on screen; applying this reply
      // now would replace it with a stale, possibly mismatched answer.
      if (fetchGen.current !== gen) return 'superseded';
      setItems(data.items);
      setTotal(data.total);
      return 'applied';
    } catch {
      // Leave current items in place; the chips stay available to retry.
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
    // loadView for a live page one exactly like every other filter does.
    loadView(category, sortRef.current);
  }, [loadView]);

  const pickSort = useCallback((mode: SortMode, updateUrl = true) => {
    sortRef.current = mode;
    setSort(mode);
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (mode !== 'new') url.searchParams.set('sort', mode);
      else url.searchParams.delete('sort');
      window.history.replaceState(null, '', url);
    }
    loadView(activeCategoryRef.current, mode);
  }, [loadView]);

  // Shareable filtered views: /spotlight?category=ui&sort=top applies both
  // on load (and the controls keep the URL in sync above).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('category');
    const sortFromUrl = params.get('sort');
    // One fetch, not two. Setting both through their own pickers would
    // fire a request each, and the second would race the first.
    if (sortFromUrl === 'top') {
      sortRef.current = 'top';
      setSort('top');
    }
    if (fromUrl) {
      activeCategoryRef.current = fromUrl;
      setActiveCategory(fromUrl);
    }
    if (fromUrl || sortFromUrl === 'top') {
      loadView(activeCategoryRef.current, sortRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A curator can retag an item from this gallery and the write lands in
  // Postgres instantly, but the page they're looking at can still be up to
  // ten minutes stale: five from the API cache, five more from ISR on top
  // of it. isCurator itself is only known once the credentialed /me call
  // resolves, so once it does, page one is pulled straight from the API
  // (the same uncached path loadView already uses for filters) and
  // swapped in for whatever the server rendered. A non-curator, or a
  // curator whose /me call hasn't resolved yet, triggers nothing here.
  // silent so this background swap can't put the section in a busy state
  // for a request nobody asked for.
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
    // effect above, through the same uncached loadView. A second request
    // here would be identical, just a wasted round trip, so skip it.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('category') || urlParams.get('sort')) return;
    let cancelled = false;
    // A silent call here can lose the race to a chip or sort click firing
    // while it's in flight, both bump the same fetchGen. Losing does not
    // mean the data was wrong, it means a different call for a different
    // view won and applied first, and left alone, page one would stay on
    // the stale snapshot for the rest of the visit with no error and no
    // second chance. So a superseded attempt just asks again immediately,
    // reading activeCategoryRef fresh each time in case the curator has
    // since switched filters, so a retry can never land a stale,
    // unfiltered answer over a filter they've since chosen. A genuine
    // fetch failure does not retry: loadView's own catch block already
    // has a contract for that, stale items stay up and the surface that
    // failed stays available to retry by hand, and retrying it again here
    // would just be a second, undeclared version of the same policy.
    const attempt = async () => {
      const outcome = await loadView(
        activeCategoryRef.current, sortRef.current, true,
      );
      if (!cancelled && outcome === 'superseded') attempt();
    };
    attempt();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likes.ready, likes.isCurator]);

  // The hop to /spotlight/gallery carries whatever is on screen, so a
  // visitor who filtered to VFX and then asked for more arrives in VFX
  // rather than back at the top of everything.
  const galleryHref = (() => {
    const p = new URLSearchParams();
    if (activeCategory) p.set('category', activeCategory);
    if (sort !== 'new') p.set('sort', sort);
    const q = p.toString();
    return q ? `/spotlight/gallery?${q}` : '/spotlight/gallery';
  })();

  const galleryLabel = (() => {
    const phrase = `${total.toLocaleString('en-US')} ${creationsIn(total, activeCategory)}`;
    // "all" would be a lie under Top this week, where the total counts a
    // seven-day window rather than the whole gallery.
    return sort === 'top'
      ? `Browse this week’s ${phrase} →`
      : `Browse all ${phrase} →`;
  })();

  return (
    <div className="showcase">
      <section className="hero">
        <p className="eyebrow"><span className="live-dot" aria-hidden />LIVE FROM THE NETWORK</p>
        <Image src="/spotlight-logo.png" alt="Spotlight" width={340} height={114} priority className="hero-logo" />
        {/* One line on wide screens so the first row of work shows on
            load: the work is the proof, and the hero used to fill the
            whole first screen (2026-11-07). Two lines again on phones. */}
        <h1 className="headline">
          <span className="headline-line">Post once.</span>{' '}
          <span className="headline-line beamed">Seen everywhere.</span>
        </h1>
        <p className="sub">
          Real work from Roblox dev servers, carried to every connected server.
        </p>
        {stats && stats.creations > 0 && (
          <p className="fact-line">
            <strong>{atLeast(stats.creations)}</strong> creations from{' '}
            <strong>{atLeast(stats.server_count)}</strong> servers
          </p>
        )}
        <div className="cta-row">
          <a
            className="cta-primary"
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Add Spotlight to Discord
          </a>
          {/* Hirers are the scarce side of the network (hiring scan,
              2026-11-06), and until this the page had nothing for them. */}
          <a className="cta-ghost" href="/spotlight/creators">Hiring? Find a creator →</a>
        </div>
        <a className="how-link" href="/spotlight/how-it-works">How it works</a>
      </section>

      {/* aria-busy is the only report of a filter fetch now that the load
          more button is gone: chips replace the grid in place, and a
          screen reader otherwise gets no signal that anything is
          happening between the click and the new cards. */}
      <section
        className="gallery-section"
        aria-label="Creations broadcast by Spotlight"
        aria-busy={loading}
      >
        <div className="gallery-head">
          <h2 className="gallery-title">The showcase</h2>
          <span className="gallery-head-right">
            {/* Same destination as the link under the grid, for a visitor
                who came to browse rather than to be convinced and should
                not have to scroll a slab of proof to find the door. */}
            <a className="gallery-link" href={galleryHref}>ALL CREATIONS →</a>
            {/* The same creations ordered by arrival rather than by
                category, for a visitor who wants to watch the network
                work instead of search it. */}
            <a className="gallery-link" href="/spotlight/feed">LIVE FEED →</a>
            <a className="gallery-link" href="/spotlight/creators">BROWSE CREATORS →</a>
            {/* The two halves of the same broadcast: who sends it, and
                where it lands. The servers connected stat above counts
                exactly what this page lists. */}
            <a className="gallery-link" href="/spotlight/network">VIEW THE NETWORK →</a>
            <span className="gallery-note">refreshes every 5 minutes</span>
          </span>
        </div>

        <div className="sort-tabs" role="tablist" aria-label="Sort creations">
          <button
            type="button"
            role="tab"
            className={`sort-tab ${sort === 'new' ? 'sort-tab-on' : ''}`}
            aria-selected={sort === 'new'}
            onClick={() => pickSort('new')}
          >
            New
          </button>
          <button
            type="button"
            role="tab"
            className={`sort-tab ${sort === 'top' ? 'sort-tab-on' : ''}`}
            aria-selected={sort === 'top'}
            onClick={() => pickSort('top')}
          >
            Top this week
          </button>
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
        />

        {/* Where "Show more creations" used to be, and the reason this
            section stopped growing. How it works and the invite used to sit
            below it, and every press of that button pushed both further out
            of reach: at 24 a page across 1,911 creations there were
            seventy-nine presses available. Browsing and converting want
            opposite page shapes, so they are two pages now. The count is
            the honest version of "more", and it carries whatever filter
            and ordering are on screen so nothing is lost in the hop. */}
        {total > 0 && (
          <div className="more-row">
            <a className="cta-ghost more-btn" href={galleryHref}>
              {galleryLabel}
            </a>
          </div>
        )}
      </section>

      <ShowcaseStyles />
    </div>
  );
}
