'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import FeedStyles from './feedStyles';
import VerifiedSeal from './VerifiedSeal';
import {
  CATEGORY_LABELS, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem, ShowcaseMedia,
  cleanCaption, xLink,
} from './constants';

type Sort = 'new' | 'top';

const POLL_MS = 30000;

/** Avatar tints drawn from the Spotlight palette rather than a rainbow:
    a column of initials should still read as one system. Hashed on the
    name so a creator keeps the same colour between visits. */
const TINTS = [
  '#ffd98a', '#5865f2', '#d9a94f', '#8f9bff',
  '#f0c674', '#7d8bf5', '#ffe3ad', '#a58cff',
];
function tint(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Cell({ item, onOpen }: { item: ShowcaseMedia; onOpen: (url: string) => void }) {
  const [dead, setDead] = useState(false);

  if (item.content_type?.startsWith('video')) {
    return (
      <div className="cell">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video controls preload="none" playsInline poster={item.thumbnail}>
          <source src={item.url} type="video/mp4" />
        </video>
        <span className="badge">video</span>
      </div>
    );
  }
  if (dead) {
    return <div className="cell"><span className="dead">image unavailable</span></div>;
  }
  return (
    <button type="button" className="cell" onClick={() => onOpen(item.url)}>
      <img src={item.url} alt="" loading="lazy" onError={() => setDead(true)} />
    </button>
  );
}

function Post({ item, fresh, onOpen }: {
  item: ShowcaseItem; fresh: boolean; onOpen: (url: string) => void;
}) {
  const name = item.author_name || 'unknown';
  const caption = cleanCaption(item.content || '');
  const x = xLink(item.content || '');
  const shown = (item.media || []).slice(0, 4);
  const extra = (item.media || []).length - shown.length;

  return (
    <article className={`post${fresh ? ' fresh' : ''}`}>
      <a
        className="av"
        href={`/spotlight/@${encodeURIComponent(name)}`}
        style={{ background: tint(name) }}
        aria-label={name}
      >
        {name.charAt(0).toUpperCase()}
      </a>
      <div className="body">
        <div className="line">
          <a className="name" href={`/spotlight/@${encodeURIComponent(name)}`}>{name}</a>
          {item.author_claimed && <VerifiedSeal />}
          <span className="handle">@{name}</span>
          <span className="time">· {ago(item.created_at)}</span>
        </div>

        {caption && <p className="caption">{caption}</p>}

        {shown.length > 0 && (
          <div className={`media n${shown.length}`}>
            {shown.map((m, i) => <Cell key={`${item.id}-${i}`} item={m} onOpen={onOpen} />)}
            {extra > 0 && <span className="badge">+{extra}</span>}
          </div>
        )}

        <div className="foot">
          {item.hearts > 0 && <span className="hearts">♥ {item.hearts}</span>}
          <span className="tag">#{item.tag}</span>
          {x && (
            <a className="xlink" href={x} target="_blank" rel="noopener noreferrer">
              view on X ↗
            </a>
          )}
          {item.category && (
            <span className="cat">{CATEGORY_LABELS[item.category] ?? item.category}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function FeedStream({ initialData }: { initialData: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>('new');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [auto, setAuto] = useState(true);
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());

  // Ids already on screen. A ref, not state: the poller reads it on a
  // timer and must not be the reason the timer is torn down and rebuilt.
  const seen = useRef<Set<number>>(new Set((initialData?.items ?? []).map((i) => i.id)));

  const fetchPage = useCallback(async (nextPage: number, nextSort: Sort, replace: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`${SHOWCASE_API_URL}?sort=${nextSort}&page=${nextPage}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: ShowcaseData = await res.json();
      setPages(data.pages ?? 1);
      setLive(true);
      if (replace) {
        seen.current = new Set(data.items.map((i) => i.id));
        setItems(data.items);
      } else {
        const add = data.items.filter((i) => !seen.current.has(i.id));
        add.forEach((i) => seen.current.add(i.id));
        setItems((prev) => [...prev, ...add]);
      }
    } catch {
      // Spotlight unreachable: keep what is on screen and mark the dot,
      // the same way the showcase and the directory degrade.
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // New posts arrive at the top, but only on the Latest tab: dropping
  // them into "Top this week" would put an unranked post above ranked
  // ones and quietly break the ordering the tab promises.
  useEffect(() => {
    if (!auto || sort !== 'new') return undefined;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${SHOWCASE_API_URL}?sort=new&page=1`);
        if (!res.ok) throw new Error(String(res.status));
        const data: ShowcaseData = await res.json();
        const add = data.items.filter((i) => !seen.current.has(i.id));
        setLive(true);
        if (!add.length) return;
        add.forEach((i) => seen.current.add(i.id));
        setItems((prev) => [...add, ...prev]);
        setFreshIds(new Set(add.map((i) => i.id)));
      } catch {
        setLive(false);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [auto, sort]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const pick = (next: Sort) => {
    if (next === sort) return;
    setSort(next);
    setPage(1);
    fetchPage(1, next, true);
  };

  const q = query.trim().toLowerCase();
  const shown = items.filter((it) => {
    if (category && it.category !== category) return false;
    if (!q) return true;
    const hay = [
      it.author_name, it.content, it.category,
      ...(it.media || []).map((m) => m.url),
    ].join(' ').toLowerCase();
    return hay.includes(q);
  });

  const filtered = Boolean(q || category);

  return (
    <div className="feedpage">
      <FeedStyles />
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">
            <span className={`live-dot${live ? '' : ' stale'}`} />
            {live ? 'live' : 'reconnecting'}
          </p>
          <h1><span className="beamed">The Feed</span></h1>
          <p className="sub">
            Every creation the network broadcasts, newest first, as it lands.
            For browsing by category or digging through the archive, use{' '}
            <a href="/spotlight/gallery">the gallery</a>.
          </p>
        </header>

        <div className="bar">
          <div className="controls">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter loaded posts by creator or caption"
              aria-label="Filter posts"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">all categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              type="button"
              className={`chip${auto ? ' chip-on' : ''}`}
              onClick={() => setAuto((v) => !v)}
              aria-pressed={auto}
            >
              {auto ? 'auto' : 'paused'}
            </button>
          </div>
          <div className="tabs" role="tablist" aria-label="Sort posts">
            <button
              type="button" role="tab" aria-selected={sort === 'new'}
              className={`tab${sort === 'new' ? ' tab-on' : ''}`}
              onClick={() => pick('new')}
            >
              Latest
            </button>
            <button
              type="button" role="tab" aria-selected={sort === 'top'}
              className={`tab${sort === 'top' ? ' tab-on' : ''}`}
              onClick={() => pick('top')}
            >
              Top this week
            </button>
            <span className="count">
              {filtered ? `${shown.length} of ${items.length}` : `${items.length} posts`}
            </span>
          </div>
        </div>

        <div className="stream">
          {shown.map((it) => (
            <Post
              key={it.id}
              item={it}
              fresh={freshIds.has(it.id)}
              onOpen={setLightbox}
            />
          ))}
        </div>

        {shown.length === 0 && (
          <p className="note">
            {items.length === 0
              ? 'Nothing to show yet. Spotlight may be unreachable.'
              : 'Nothing matches that filter.'}
          </p>
        )}

        {page < pages && (
          <button
            type="button"
            className="more"
            disabled={loading}
            onClick={() => { const n = page + 1; setPage(n); fetchPage(n, sort, false); }}
          >
            {loading ? 'loading…' : 'show more'}
          </button>
        )}
      </div>

      {lightbox && (
        <button
          type="button"
          className="lightbox"
          onClick={() => setLightbox(null)}
          aria-label="Close image"
        >
          <img src={lightbox} alt="" />
        </button>
      )}
    </div>
  );
}
