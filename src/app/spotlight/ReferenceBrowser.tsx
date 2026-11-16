'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReferenceTile from './ReferenceTile';
import {
  REFERENCES_API_URL, ReferenceIndex, ReferencePage, ShowcaseItem, referencePath,
} from './constants';

/** Pages that arrive by scrolling before the reader has to ask, the same
    cap as the gallery and for the same reasons. */
const AUTO_LOADS = 4;

type Props = {
  index: ReferenceIndex | null;
  data: ReferencePage | null;
  slug: string;
  style: string;
};

/** The reference library: search and subject chips, a style row, and a
    masonry grid of confirmed creations. Chips are links, so a crawler and
    a reader take the same route; search only filters the chip row. */
export default function ReferenceBrowser({ index, data, slug, style }: Props) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ShowcaseItem[]>(data?.items ?? []);
  const [page, setPage] = useState(data?.page ?? 1);
  const [loading, setLoading] = useState(false);
  const [autoLoads, setAutoLoads] = useState(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const pages = data?.pages ?? 1;
  const more = page < pages;

  const loadNext = useCallback(async (auto: boolean) => {
    if (loading || page >= pages) return;
    setLoading(true);
    const q = new URLSearchParams({ page: String(page + 1) });
    if (style) q.set('style', style);
    try {
      const res = await fetch(`${REFERENCES_API_URL}/${encodeURIComponent(slug)}?${q}`);
      if (res.ok) {
        const next: ReferencePage = await res.json();
        setItems((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          return [...prev, ...next.items.filter((i) => !seen.has(i.id))];
        });
        setPage(next.page);
        setAutoLoads((n) => (auto ? n + 1 : 0));
      }
    } finally {
      setLoading(false);
    }
  }, [loading, page, pages, slug, style]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more || autoLoads >= AUTO_LOADS) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) loadNext(true);
    }, { rootMargin: '800px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [more, autoLoads, loadNext]);

  const q = query.trim().toLowerCase();
  const subjects = (index?.subjects ?? []).filter((t) => !q || t.label.toLowerCase().startsWith(q)
    || t.slug.startsWith(q.replace(/\s+/g, '-')));
  const label = data?.tag.label ?? '';
  const isAll = slug === 'all';

  return (
    <main className="rf">
      <header className="rf-head">
        <a className="rf-back" href="/spotlight/gallery">← THE GALLERY</a>
        <h1 className="rf-title">{isAll ? 'References' : `${label} references`}</h1>
        <p className="rf-sub">
          {data ? (
            <>
              <b>{data.tag.count.toLocaleString('en-US')}</b>
              {isAll ? ' Roblox creations' : ` Roblox ${label.toLowerCase()} creations`}
              {' '}made by creators across the Spotlight network. Find something like what you are
              making, then see who made it.
            </>
          ) : 'The reference library is momentarily offline, check back shortly.'}
        </p>
        <input
          className="rf-search"
          type="search"
          placeholder="Search subjects: tree, sword, shop UI…"
          aria-label="Search subjects"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <nav className="rf-chips" aria-label="Subjects">
        <a className={`rf-chip ${isAll ? 'rf-chip-on' : ''}`} href={referencePath('all', style)}>All</a>
        {subjects.map((t) => (
          <a
            key={t.slug}
            className={`rf-chip ${t.slug === slug ? 'rf-chip-on' : ''}`}
            href={referencePath(t.slug, style)}
          >
            {t.label}<small>{t.count}</small>
          </a>
        ))}
        {q && subjects.length === 0 && <span className="rf-none">No subject starts with “{query}”.</span>}
      </nav>

      {(index?.styles.length ?? 0) > 0 && (
        <nav className="rf-chips rf-styles" aria-label="Styles">
          <span className="rf-style-label">STYLE</span>
          <a className={`rf-chip ${!style ? 'rf-chip-on' : ''}`} href={referencePath(slug)}>Any</a>
          {index!.styles.map((t) => (
            <a
              key={t.slug}
              className={`rf-chip ${t.slug === style ? 'rf-chip-on' : ''}`}
              href={referencePath(slug, t.slug)}
            >
              {t.label}
            </a>
          ))}
        </nav>
      )}

      {items.length > 0 ? (
        <div className="rf-grid">
          {items.map((it) => <ReferenceTile key={it.id} item={it} />)}
        </div>
      ) : (
        data && <p className="rf-none">Nothing here yet. <a href={referencePath('all')}>See every reference</a></p>
      )}

      {more && <div ref={sentinel} aria-hidden />}
      {more && (
        <div className="rf-more">
          <a
            href={`${referencePath(slug, style)}${style ? '&' : '?'}page=${page + 1}`}
            aria-disabled={loading}
            onClick={(e) => { e.preventDefault(); loadNext(false); }}
          >
            {loading ? 'Loading…' : 'Show more'}
          </a>
        </div>
      )}
      {!more && items.length > 0 && (
        <p className="rf-end">
          That is every {isAll ? '' : `${label.toLowerCase()} `}reference so far.
          {' '}<a href="/spotlight/creators">Browse the creators →</a>
        </p>
      )}

      {(data?.related.length ?? 0) > 0 && (
        <section className="rf-related">
          <h2>Related</h2>
          <nav className="rf-chips">
            {data!.related.map((r) => (
              <a key={r.slug} className="rf-chip" href={referencePath(r.slug)}>{r.label}</a>
            ))}
          </nav>
        </section>
      )}
    </main>
  );
}
