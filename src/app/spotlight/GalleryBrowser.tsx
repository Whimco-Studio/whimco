'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import GalleryGrid from './Gallery';
import ShowcaseStyles from './styles';
import BrowseStyles from './browseStyles';
import useLikes from './useLikes';
import {
  CATEGORY_LABELS, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem, SortMode,
  creationsIn,
} from './constants';

/** How many pages arrive by scrolling before the reader has to ask.

    Uncapped infinite scroll has two costs that only appear deep in a
    session. Everything scrolled past stays mounted, so the DOM and its
    media grow without limit; and anything after the grid becomes
    unreachable, which for a keyboard or screen reader user means the end
    of the page never arrives. Four pages is 96 creations on top of the 24
    the server already rendered, a long browse, and then a control appears
    and the reader is back in charge. Clicking it resets the allowance, so
    asking again is one click rather than a wall. */
const AUTO_LOADS = 4;

/** One place that builds a link to this page, so the continue control,
    the crawler's route and the "start from the newest" escape can never
    disagree about what a view is called. */
function viewHref(category: string, sort: SortMode, page = 1): string {
  const p = new URLSearchParams();
  if (page > 1) p.set('page', String(page));
  if (category) p.set('category', category);
  if (sort !== 'new') p.set('sort', sort);
  const q = p.toString();
  return q ? `/spotlight/gallery?${q}` : '/spotlight/gallery';
}

export default function GalleryBrowser({
  initialData, initialPage, initialCategory, initialSort,
}: {
  initialData: ShowcaseData | null;
  initialPage: number;
  initialCategory: string;
  initialSort: SortMode;
}) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? initialPage);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SortMode>(initialSort);
  const [loading, setLoading] = useState(false);
  const [autoLoads, setAutoLoads] = useState(0);
  // Whether this visit began partway into the set. State, not a read of
  // initialPage: once the reader picks a filter they are at the top of a
  // fresh view, and scrolling back down to page five later must not make
  // a notice about how they arrived reappear.
  const [deepEntry, setDeepEntry] = useState(initialPage > 1);
  const likes = useLikes();

  // Facets are counted across the whole network rather than the filtered
  // set, so the row reads the same whichever chip is lit. Held from the
  // first response that carried them, which keeps it from flickering
  // between fetches.
  const [facets, setFacets] = useState(initialData?.categories ?? []);

  const headRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // The observer callback outlives the render that created it and must
  // read whatever is current when it fires, not what was current when it
  // was registered. Assigned during render rather than in an effect: an
  // effect runs after paint, and the sentinel can be crossed before that.
  const stateRef = useRef({ page, pages, category, sort, autoLoads });
  stateRef.current = { page, pages, category, sort, autoLoads };

  // Counts requests the reader can see, so a scroll cannot start an
  // append while one is already out. A counter rather than a boolean
  // because a filter click deliberately ignores this and starts its own
  // fetch, and two overlapping settles must not leave the flag cleared
  // while a request is still in flight.
  const inflight = useRef(0);

  // Same guard as the showcase, the portfolio and the creator directory: a
  // chip click and a scroll-triggered append can be out together, and
  // without this whichever lands last wins regardless of which was asked
  // for last, so a filtered click can be overwritten by a slower
  // unfiltered reply that was already stale when it landed.
  const fetchGen = useRef(0);

  const fetchPage = useCallback(async (
    next: number, cat: string, mode: SortMode, append: boolean, silent = false,
  ): Promise<'applied' | 'superseded' | 'failed'> => {
    const gen = ++fetchGen.current;
    if (!silent) {
      inflight.current += 1;
      setLoading(true);
    }
    try {
      const params = new URLSearchParams({ page: String(next) });
      if (cat) params.set('category', cat);
      // Only sent when it is not the default, so the common request keeps
      // one cache key on the API side rather than splitting it in two.
      if (mode !== 'new') params.set('sort', mode);
      const res = await fetch(`${SHOWCASE_API_URL}?${params}`);
      if (!res.ok) throw new Error(`gallery fetch ${res.status}`);
      const data: ShowcaseData = await res.json();
      if (fetchGen.current !== gen) return 'superseded';
      setItems((prev) => {
        if (!append) return data.items;
        // An item can arrive twice when a heart, a retag or a withdrawal
        // shifts the ordering between two page fetches. React would warn
        // on the duplicate key, and the reader would see the same
        // creation twice for no reason they could work out.
        const seen = new Set(prev.map((i) => i.id));
        return [...prev, ...data.items.filter((i) => !seen.has(i.id))];
      });
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
      if (data.categories?.length) setFacets(data.categories);
      return 'applied';
    } catch {
      // Leave what is on screen; the continue control stays available.
      return 'failed';
    } finally {
      if (!silent) {
        inflight.current -= 1;
        if (inflight.current === 0) setLoading(false);
      }
    }
  }, []);

  /** A filter or ordering change: back to page one of the new view.

      Only category and sort go in the URL, never the page. This is the
      page people share, and "all the VFX, top this week" is what they
      mean to send. A page number captured at whatever depth they happened
      to stop scrolling would open the link partway into a run with
      nothing above it, which reads as a fault. ?page= is still honoured
      on arrival, for the crawler walk at the foot of the page and for
      anyone who builds one by hand. */
  const reset = useCallback((cat: string, mode: SortMode) => {
    setCategory(cat);
    setSort(mode);
    setAutoLoads(0);
    setDeepEntry(false);
    window.history.replaceState(null, '', viewHref(cat, mode));
    // The reader may be hundreds of cards down. Leaving them there after
    // the grid under them was replaced drops them at an arbitrary point
    // in a set whose beginning they have not seen.
    headRef.current?.scrollIntoView({ block: 'start' });
    fetchPage(1, cat, mode, false);
  }, [fetchPage]);

  const loadNext = useCallback((auto: boolean) => {
    const s = stateRef.current;
    if (inflight.current > 0 || s.page >= s.pages) return;
    // A deliberate click buys a fresh allowance; scrolling spends it.
    setAutoLoads(auto ? s.autoLoads + 1 : 0);
    fetchPage(s.page + 1, s.category, s.sort, true);
  }, [fetchPage]);

  // Auto-load while the allowance lasts. rootMargin trips this before the
  // reader reaches the bottom, so the next page is usually already in
  // place and the control below is never reached; once the allowance runs
  // out they arrive at it instead.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      if (stateRef.current.autoLoads >= AUTO_LOADS) return;
      loadNext(true);
    }, { rootMargin: '700px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadNext]);

  // A curator retags from this grid and the write lands in Postgres at
  // once, but the fetch that rendered this page is cached for five
  // minutes. Once the credentialed /me call resolves and says curator,
  // page one is pulled from the API and swapped in. Same shape and same
  // reasoning as the refetch in Showcase.tsx, including asking again when
  // a click supersedes it, since losing that race would otherwise strand
  // the stale copy for the whole visit.
  const curatorRefetchStarted = useRef(false);
  useEffect(() => {
    if (!likes.ready || !likes.isCurator || curatorRefetchStarted.current) return;
    curatorRefetchStarted.current = true;
    // Only worth doing on an untouched first page. Anything appended
    // after it already came from the uncached path this would use.
    if (stateRef.current.page !== 1) return;
    let cancelled = false;
    const attempt = async () => {
      const s = stateRef.current;
      const outcome = await fetchPage(1, s.category, s.sort, false, true);
      if (!cancelled && outcome === 'superseded') attempt();
    };
    attempt();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likes.ready, likes.isCurator]);

  const noun = creationsIn(total, category);
  const more = page < pages;

  return (
    <div className="showcase">
      <ShowcaseStyles />
      <BrowseStyles />

      <header className="br-head" ref={headRef}>
        <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
        <h1 className="br-title">THE GALLERY</h1>
        <p className="br-sub">
          {initialData ? (
            <>
              <b>{total.toLocaleString('en-US')}</b>
              {' '}
              {noun}
              {/* Under a filter the phrase already names the discipline,
                  so appending "broadcast by the network" would just be
                  length. The seven-day window is not optional: a count
                  that means something different under Top than under New
                  has to say so. */}
              {sort === 'top'
                ? `${category ? ',' : ''} hearted this week`
                : (category ? '' : ' broadcast by the network')}
            </>
          ) : (
            'The gallery is momentarily offline, check back shortly.'
          )}
        </p>
      </header>

      <section
        className="gallery-section br-section"
        aria-label="Creations broadcast by Spotlight"
        aria-busy={loading}
      >
        <div className="sort-tabs" role="tablist" aria-label="Sort creations">
          <button
            type="button"
            role="tab"
            className={`sort-tab ${sort === 'new' ? 'sort-tab-on' : ''}`}
            aria-selected={sort === 'new'}
            onClick={() => reset(category, 'new')}
          >
            New
          </button>
          <button
            type="button"
            role="tab"
            className={`sort-tab ${sort === 'top' ? 'sort-tab-on' : ''}`}
            aria-selected={sort === 'top'}
            onClick={() => reset(category, 'top')}
          >
            Top this week
          </button>
        </div>

        {facets.length > 0 && (
          <div className="chips" role="group" aria-label="Filter by category">
            <button
              type="button"
              className={`chip ${category === '' ? 'chip-on' : ''}`}
              aria-pressed={category === ''}
              onClick={() => reset('', sort)}
            >
              All
            </button>
            {facets.map((c) => (
              <button
                key={c.category}
                type="button"
                className={`chip ${category === c.category ? 'chip-on' : ''}`}
                aria-pressed={category === c.category}
                onClick={() => reset(c.category, sort)}
              >
                {CATEGORY_LABELS[c.category] ?? c.category}
                {' '}
                <span className="chip-count">{c.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Somebody who opened a ?page= link is looking at a slice with
            nothing above it. Say so and offer the top, rather than leave
            them to wonder what they missed. */}
        {deepEntry && (
          <p className="br-deep">
            Opened at page {initialPage}.
            {' '}
            <a href={viewHref(category, sort)}>Start from the newest</a>
          </p>
        )}

        <GalleryGrid
          items={items}
          likes={likes}
          showAuthor
          deep
          emptyText={initialData
            ? 'Nothing here yet — creations appear the moment they’re broadcast.'
            : 'The gallery is momentarily offline. The network is still broadcasting — check back shortly.'}
        />

        {/* Above the control on purpose: it trips while the control is
            still off screen, so during the allowance the reader never has
            to look at a button they are not being asked to press. */}
        {more && <div ref={sentinelRef} className="br-sentinel" aria-hidden />}

        {more && (
          <div className="more-row">
            {/* A real link to a real server-rendered page, so this works
                with no JavaScript and a crawler can walk the whole
                gallery through it. The handler intercepts the click and
                appends inline instead. One control for both, rather than
                a button for people plus a hidden link for robots, which
                is the arrangement that quietly goes stale. */}
            <a
              className="cta-ghost more-btn br-more"
              href={viewHref(category, sort, page + 1)}
              aria-disabled={loading}
              onClick={(e) => { e.preventDefault(); loadNext(false); }}
            >
              {loading ? 'Loading…' : 'Show more creations'}
            </a>
          </div>
        )}

        {!more && items.length > 0 && (
          <p className="br-end">
            {sort === 'top' ? 'That is every' : 'That is all'}
            {' '}
            {total.toLocaleString('en-US')} {noun}
            {sort === 'top' ? ' hearted this week' : ''}.
            {' '}
            <a href="/spotlight/creators">Browse the creators →</a>
          </p>
        )}
      </section>
    </div>
  );
}
