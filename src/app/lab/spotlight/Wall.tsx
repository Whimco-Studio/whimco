'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CATEGORY_LABELS, INVITE_URL, SHOWCASE_API_URL,
  ShowcaseData, ShowcaseItem, SortMode, cleanCaption,
} from '../../spotlight/constants';
import VerifiedSeal from '../../spotlight/VerifiedSeal';

/* A proposal for /spotlight in ArtStation's structural language.
 *
 * The reference is not a palette, it is an argument: on a site whose
 * entire proof is other people's work, the work is the landing page.
 * ArtStation gives browsing two thin bars and the whole rest of the
 * viewport. Everything the current /spotlight puts above the fold, the
 * wordmark reveal, the headline, the stat row, either moves into 52px
 * of chrome or moves below the wall.
 *
 * Read against the live API so the crops are real. Half the value of
 * this page is finding out what a uniform 4:3 crop does to a portrait
 * phone screenshot, and stand-in art cannot answer that. */

type Shape = 'crop' | 'masonry';
/* Where the week's reel sits: a featured slot in the wall the way ArtStation
   runs one, a band under the masthead, or nowhere. */
type ReelMode = 'tile' | 'banner' | 'none';
// Served from Spotlight's static host rather than this repo: the cut has
// creator names burned into it, and this repository is public.
const REEL = {
  // A date range, not an ISO week number: a tester read "Week 36. 487"
  // as a decimal, and nobody outside a calendar spec knows what week 36 is.
  dates: '31 Aug to 6 Sep',
  src: 'https://spotlight.whimco.com/static/lab/reel-2026-W36.mp4',
  poster: 'https://spotlight.whimco.com/static/lab/reel-poster.jpg',
  creations: 487, creators: 322,
} as const;

/** ArtStation's blue is here to be rejected on sight. Wearing it would
    make this a clone and would spend the one piece of visual identity
    Spotlight already owns, but the comparison is worth one click. */
const ACCENTS = { gold: '#ffd98a', artstation: '#13aff0' } as const;
type AccentKey = keyof typeof ACCENTS;

/* Where the automatic scroll stops.
 *
 * The reference runs an endless wall and pays for it by having no
 * footer at all on its browse page: nothing below an infinite list is
 * ever reachable. Spotlight cannot make that trade, because the install
 * button is the only reason this page exists commercially. So the wall
 * loads five pages on its own, which is enough to read it as endless,
 * and then asks. The button is also the floor of the page, so the pitch
 * underneath it can actually be arrived at. */
const AUTO_PAGES = 5;

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'new', label: 'Latest' },
  { key: 'top', label: 'Most hearted' },
];

function ago(iso: string): string {
  const secs = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (secs < 90) return 'just now';
  if (secs < 3600) return `${Math.round(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)}h ago`;
  return `${Math.round(secs / 86400)}d ago`;
}

/** The still a tile shows. A clip's poster frame is already an image, so
    video and image tiles paint identically and the wall never has a
    black rectangle waiting on a network fetch. */
function still(item: ShowcaseItem) {
  const m = item.media?.[0];
  if (!m) return null;
  const video = m.content_type.startsWith('video/');
  const src = video ? m.thumbnail : (m.thumbnail || m.url);
  return src ? { src, video, url: m.url } : null;
}

function ReelVideo({ className }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Ambient motion is the reel's whole point, but not for someone who asked
  // their OS for less of it: they get the poster and a play control.
  useEffect(() => {
    const el = ref.current;
    if (el && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.pause(); el.controls = true;
    }
  }, []);
  return (
    <video ref={ref} className={className} src={REEL.src} poster={REEL.poster}
      autoPlay muted loop playsInline preload="metadata" />
  );
}

function Tile({ item, shape }: { item: ShowcaseItem; shape: Shape }) {
  const [dead, setDead] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  const media = still(item);

  // Same guard the portfolio avatar needs: this list is server-rendered
  // on first paint, so a 404 can resolve before React attaches onError
  // and the event fires into nothing.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setDead(true);
  }, [media?.src]);

  const label = CATEGORY_LABELS[item.category] ?? item.category;
  const caption = cleanCaption(item.content || '');
  const extra = (item.media?.length ?? 0) - 1;

  return (
    <a
      className="asw-tile"
      href={`/spotlight/p/${item.id}`}
      title={caption || `${item.author_name}, ${ago(item.created_at)}`}
    >
      {media && !dead ? (
        <img
          ref={img}
          className="asw-shot"
          src={media.src}
          alt={caption || `Creation by ${item.author_name}`}
          loading="lazy"
          decoding="async"
          onError={() => setDead(true)}
          style={shape === 'masonry' ? { height: 'auto' } : undefined}
        />
      ) : (
        <div className="asw-gone">{label || 'Creation'}</div>
      )}

      {media?.video && <span className="asw-kind asw-mono">Clip</span>}
      {!media?.video && extra > 0 && <span className="asw-kind asw-mono">+{extra}</span>}
      {label && <span className="asw-cat asw-mono">{label}</span>}

      <div className="asw-veil">
        <div className="asw-meta">
          <span className="asw-who">{item.author_name}</span>
          {item.author_claimed && <VerifiedSeal className="asw-seal" />}
          {item.hearts > 0 && (
            <span className="asw-hearts">
              <span aria-hidden>♥</span>{item.hearts}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default function Wall({ initial }: { initial: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initial?.items ?? []);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [pages, setPages] = useState(initial?.pages ?? 1);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [sort, setSort] = useState<SortMode>('new');
  const [cat, setCat] = useState('');
  const [busy, setBusy] = useState(false);

  const [accent, setAccent] = useState<AccentKey>('gold');
  const [cols, setCols] = useState(6);
  const [shape, setShape] = useState<Shape>('crop');
  const [strip, setStrip] = useState(true);
  const [shut, setShut] = useState(false);
  const [reel, setReel] = useState<ReelMode>('tile');

  const cats = initial?.categories ?? [];
  const stats = initial?.stats;

  const load = useCallback(async (next: number, mode: SortMode, category: string) => {
    setBusy(true);
    try {
      const p = new URLSearchParams({ page: String(next) });
      if (category) p.set('category', category);
      if (mode !== 'new') p.set('sort', mode);
      const res = await fetch(`${SHOWCASE_API_URL}?${p}`);
      if (!res.ok) return;
      const data: ShowcaseData = await res.json();
      setItems((prev) => (next === 1 ? data.items : [...prev, ...data.items]));
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch {
      // Leave the wall as it stands. A half-loaded page of somebody
      // else's art is a better failure than an error banner over it.
    } finally {
      setBusy(false);
    }
  }, []);

  const pick = (mode: SortMode, category: string) => {
    setSort(mode);
    setCat(category);
    window.scrollTo({ top: 0 });
    load(1, mode, category);
  };

  // Infinite scroll, because pagination controls are chrome and the
  // reference has none.
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = end.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !busy && page < pages && page < AUTO_PAGES) {
        load(page + 1, sort, cat);
      }
    }, { rootMargin: '900px' });
    io.observe(el);
    return () => io.disconnect();
  }, [busy, page, pages, sort, cat, load]);

  const newest = useMemo(
    () => (items.length ? ago(items[0].created_at) : ''),
    [items],
  );

  return (
    <div
      className="asw"
      style={{ '--accent': ACCENTS[accent], '--cols-pick': cols } as React.CSSProperties}
    >
      <header className="asw-bar">
        <a className="asw-mark" href="/spotlight">
          <img src="/spotlight-logo.png" alt="Spotlight" />
        </a>
        <nav className="asw-nav">
          <a href="/spotlight" aria-current="page">Explore</a>
          <a href="/spotlight/creators">Creators</a>
          <a href="/spotlight/feed">Live feed</a>
          <a href="/spotlight/network">Network</a>
        </nav>
        <div className="asw-bar-end">
          {newest && (
            <span className="asw-live asw-mono"><i aria-hidden />Newest {newest}</span>
          )}
          <a className="asw-cta" href={INVITE_URL}>Add to Discord</a>
        </div>
      </header>

      {/* The site's masthead, scaled to one line: its mono eyebrow with
          the live dot, then a Bricolage sentence. The only place the
          landing page's voice appears above the wall. */}
      {strip && (
        <div className="asw-strip">
          <div className="asw-strip-text">
            <p className="asw-eyebrow asw-mono"><i aria-hidden />Live from the network</p>
            <h1>
              Posted once in Discord.{' '}
              <span className="asw-beamed">
                Seen in {stats?.server_count ?? 80} servers.
              </span>
            </h1>
          </div>
        </div>
      )}

      {reel === 'banner' && (
        <a className="asw-reelband" href="/spotlight/reel">
          <ReelVideo className="asw-reelband-video" />
          <div className="asw-reelband-text">
            <p className="asw-eyebrow asw-mono"><i aria-hidden />This week on Spotlight, {REEL.dates}</p>
            <h2><span className="asw-beamed">{REEL.creations} creations</span> from {REEL.creators} creators, in 48 seconds.</h2>
            <p>Every Monday. Everyone who posted is on the page.</p>
            <span className="asw-reelband-cta">Watch the reel</span>
          </div>
        </a>
      )}

      <div className="asw-filters">
        <div className="asw-sort">
          {SORTS.map((s) => (
            <button
              key={s.key}
              data-on={sort === s.key || undefined}
              onClick={() => pick(s.key, cat)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="asw-rule" />
        <button className="asw-chip" data-on={!cat || undefined} onClick={() => pick(sort, '')}>
          Everything
        </button>
        {cats.map((c) => (
          <button
            key={c.category}
            className="asw-chip"
            data-on={cat === c.category || undefined}
            onClick={() => pick(sort, c.category)}
          >
            {CATEGORY_LABELS[c.category] ?? c.category}<b>{c.count}</b>
          </button>
        ))}
        <span className="asw-count asw-mono">{total.toLocaleString('en-US')} pieces</span>
      </div>

      <div className="asw-wall">
        <div className="asw-grid" data-shape={shape}>
          {reel === 'tile' && (
            <a className="asw-tile asw-reel" href="/spotlight/reel" aria-label="This week's reel">
              <ReelVideo className="asw-shot asw-reel-video" />
              <div className="asw-reel-veil">
                <p className="asw-eyebrow asw-mono"><i aria-hidden />This week on Spotlight, {REEL.dates}</p>
                <h2>{REEL.creations} creations from {REEL.creators} creators</h2>
              </div>
            </a>
          )}
          {items.map((item) => (
            <Tile key={item.id} item={item} shape={shape} />
          ))}
        </div>
        <div className="asw-more" ref={end}>
          {busy && 'Loading'}
          {!busy && page >= pages && 'That is everything.'}
          {!busy && page < pages && page >= AUTO_PAGES && (
            <button className="asw-showmore" onClick={() => load(page + 1, sort, cat)}>
              Show more
            </button>
          )}
        </div>
      </div>

      <footer className="asw-foot">
        <div>
          <h2>Your work, <span className="asw-beamed">in {stats?.server_count ?? 80} servers</span> at once.</h2>
          <p>
            Spotlight carries a creation from one #creations channel to showcase
            channels across every connected Discord server. Everything above was
            posted once, by somebody who was not thinking about this page.
          </p>
          <a className="asw-cta" href={INVITE_URL}>Add Spotlight to Discord</a>
        </div>
        {stats && (
          <div className="asw-stats">
            <div className="asw-stat">
              <strong>{stats.member_reach.toLocaleString('en-US')}</strong>
              <span className="asw-mono">members reached</span>
            </div>
            <div className="asw-stat">
              <strong>{stats.server_count}</strong>
              <span className="asw-mono">servers connected</span>
            </div>
            <div className="asw-stat">
              <strong>{stats.creations.toLocaleString('en-US')}</strong>
              <span className="asw-mono">creations broadcast</span>
            </div>
          </div>
        )}
      </footer>

      <aside className="asw-panel" data-shut={shut || undefined}>
        <header>
          Preview controls
          <button onClick={() => setShut(!shut)} aria-expanded={!shut}>
            {shut ? 'Show' : 'Hide'}
          </button>
        </header>
        <div className="asw-panel-body">
          <div className="asw-row">
            <span>Accent</span>
            <div className="asw-seg">
              <button data-on={accent === 'gold' || undefined} onClick={() => setAccent('gold')}>
                Spotlight gold
              </button>
              <button data-on={accent === 'artstation' || undefined} onClick={() => setAccent('artstation')}>
                ArtStation blue
              </button>
            </div>
          </div>
          <div className="asw-row">
            <span>Columns</span>
            <div className="asw-seg">
              {[4, 5, 6, 7].map((n) => (
                <button key={n} data-on={cols === n || undefined} onClick={() => setCols(n)}>{n}</button>
              ))}
            </div>
          </div>
          <div className="asw-row">
            <span>Tiles</span>
            <div className="asw-seg">
              <button data-on={shape === 'crop' || undefined} onClick={() => setShape('crop')}>
                Crop to 4:3
              </button>
              <button data-on={shape === 'masonry' || undefined} onClick={() => setShape('masonry')}>
                Full art
              </button>
            </div>
          </div>
          <div className="asw-row">
            <span>Masthead above the wall</span>
            <div className="asw-seg">
              <button data-on={!strip || undefined} onClick={() => setStrip(false)}>None</button>
              <button data-on={strip || undefined} onClick={() => setStrip(true)}>One line</button>
            </div>
          </div>
          <div className="asw-row">
            <span>Weekly reel</span>
            <div className="asw-seg">
              <button data-on={reel === 'tile' || undefined} onClick={() => setReel('tile')}>Tile</button>
              <button data-on={reel === 'banner' || undefined} onClick={() => setReel('banner')}>Banner</button>
              <button data-on={reel === 'none' || undefined} onClick={() => setReel('none')}>None</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
