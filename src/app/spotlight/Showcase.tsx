'use client';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Image from 'next/image';
import {
  CATEGORY_LABELS, INVITE_URL, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem,
  cleanCaption, xLink,
} from './constants';

/* ------------------------------------------------------------------ */
/* Count-up stat                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

function CardMedia({ item }: { item: ShowcaseItem }) {
  const media = item.media[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  if (!media) return null;
  if (media.content_type.startsWith('video/')) {
    return (
      <div className="card-media">
        <video
          ref={videoRef}
          src={media.url}
          poster={media.thumbnail || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          onMouseEnter={() => videoRef.current?.play().catch(() => {})}
          onMouseLeave={() => videoRef.current?.pause()}
        />
        <span className="video-badge" aria-hidden>▶</span>
      </div>
    );
  }
  if (media.content_type.startsWith('image/')) {
    return (
      <div className="card-media">
        {/* Presigned S3 URLs rotate every revalidate — plain img, not
            next/image, so the optimizer cache never 403s on expiry. */}
        <img src={media.url} alt={cleanCaption(item.content).slice(0, 80) || `Creation by ${item.author_name}`} loading="lazy" />
        {item.media.length > 1 && (
          <span className="count-badge">+{item.media.length - 1}</span>
        )}
      </div>
    );
  }
  return null;
}

function GalleryCard({ item, onOpen }: { item: ShowcaseItem; onOpen: () => void }) {
  const caption = cleanCaption(item.content);
  return (
    <article className="card">
      <button
        type="button"
        className="card-hit"
        onClick={onOpen}
        aria-label={`Open creation by ${item.author_name}`}
      >
        <CardMedia item={item} />
        {caption && (
          <p className={`card-caption ${item.media.length === 0 ? 'card-caption-only' : ''}`}>
            {caption}
          </p>
        )}
        <div className="card-meta">
          <span className="card-author">by {item.author_name}</span>
          <span className="card-hearts">♥ {item.hearts.toLocaleString('en-US')}</span>
          {item.category && (
            <span className="card-tag">{CATEGORY_LABELS[item.category] ?? item.category}</span>
          )}
        </div>
      </button>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Lightbox                                                            */
/* ------------------------------------------------------------------ */

function Lightbox({ item, onClose }: { item: ShowcaseItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Creation by ${item.author_name}`} onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="lightbox-media">
          {item.media.map((m) => (
            m.content_type.startsWith('video/')
              ? <video key={m.url} src={m.url} controls playsInline />
              : <img key={m.url} src={m.url} alt="" />
          ))}
        </div>
        {cleanCaption(item.content) && <p className="lightbox-caption">{cleanCaption(item.content)}</p>}
        <div className="lightbox-meta">
          <span className="card-author">by {item.author_name}</span>
          <span className="card-hearts" aria-label={`${item.hearts} hearts`}>♥ {item.hearts.toLocaleString('en-US')}</span>
          {item.category && (
            <span className="card-tag">{CATEGORY_LABELS[item.category] ?? item.category}</span>
          )}
          {xLink(item.content) && (
            <a
              className="lightbox-source"
              href={xLink(item.content) as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              View original post ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Showcase                                                            */
/* ------------------------------------------------------------------ */

export default function Showcase({ initialData }: { initialData: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ShowcaseItem | null>(null);
  const [statsStarted, setStatsStarted] = useState(false);
  const [cols, setCols] = useState(4);

  // Rank must read left-to-right, so items are dealt round-robin into
  // real columns instead of CSS `columns` (which re-balances the whole
  // set on every "load more" and pushes low-ranked items to the top of
  // later columns).
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 1 : w < 900 ? 2 : w < 1200 ? 3 : 4);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const statsRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const stats = initialData?.stats;
  const categories = initialData?.categories ?? [];

  // Start count-up when the stat strip is on screen.
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

  // The beam: warm light follows the cursor across the gallery.
  const onGalleryMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const fetchPage = useCallback(async (nextPage: number, category: string, replace: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage) });
      if (category) params.set('category', category);
      const res = await fetch(`${SHOWCASE_API_URL}?${params}`);
      if (!res.ok) throw new Error(`showcase fetch ${res.status}`);
      const data: ShowcaseData = await res.json();
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      setPage(data.page);
      setPages(data.pages);
    } catch {
      // Leave current items in place; the button stays available to retry.
    } finally {
      setLoading(false);
    }
  }, []);

  const pickCategory = useCallback((category: string) => {
    setActiveCategory(category);
    if (category === '' && initialData) {
      setItems(initialData.items);
      setPage(initialData.page);
      setPages(initialData.pages);
      return;
    }
    fetchPage(1, category, true);
  }, [fetchPage, initialData]);

  return (
    <div className="showcase">
      {/* ------------------------------ hero ------------------------ */}
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

      {/* ---------------------------- gallery ----------------------- */}
      <section className="gallery-section" aria-label="Creations broadcast by Spotlight">
        <div className="gallery-head">
          <h2 className="gallery-title">The showcase</h2>
          <span className="gallery-note">refreshes every 5 minutes</span>
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

        {items.length === 0 ? (
          <div className="empty">
            {initialData
              ? 'Nothing in the beam yet — creations appear here the moment they’re broadcast.'
              : 'The showcase is momentarily offline. The network is still broadcasting — check back shortly.'}
          </div>
        ) : (
          <div className="masonry-wrap" ref={galleryRef} onMouseMove={onGalleryMove}>
            <div className="beam-overlay" aria-hidden />
            <div className="masonry">
              {Array.from({ length: cols }, (_, c) => (
                <div className="masonry-col" key={c}>
                  {items
                    .filter((_, i) => i % cols === c)
                    .map((item) => (
                      <GalleryCard key={item.id} item={item} onOpen={() => setSelected(item)} />
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {page < pages && (
          <div className="more-row">
            <button
              type="button"
              className="cta-ghost more-btn"
              disabled={loading}
              onClick={() => fetchPage(page + 1, activeCategory, false)}
            >
              {loading ? 'Loading…' : 'Show more creations'}
            </button>
          </div>
        )}
      </section>

      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}

      {/* Global (not scoped) because Stat/CardMedia/Lightbox render their
          own DOM — everything is namespaced under .showcase instead. */}
      <style jsx global>{`
        .showcase {
          --stage: #0a0a0f;
          --panel: #14141d;
          --edge: rgba(255, 255, 255, 0.07);
          --blurple: #5865f2;
          --beam: #ffd98a;
          --beam-dim: rgba(255, 217, 138, 0.14);
          --stext: #f4f5fa;
          --stext-dim: #9ba0b4;
          --heart: #ed4245;
          background:
            radial-gradient(ellipse 90% 45% at 50% 0%, rgba(88, 101, 242, 0.10) 0%, transparent 60%),
            var(--stage);
          color: var(--stext);
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* ------------------------------ hero --------------------- */
        .showcase .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 8.5rem 1.5rem 4rem;
          gap: 1.4rem;
        }
        .showcase .eyebrow {
          font-family: var(--font-mono), monospace;
          font-size: 0.72rem;
          letter-spacing: 0.28em;
          color: var(--beam);
          display: flex;
          align-items: center;
          gap: 0.6em;
          margin: 0;
        }
        .showcase .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--beam);
          box-shadow: 0 0 8px var(--beam);
          animation: showcasePulse 2.4s ease-in-out infinite;
        }
        @keyframes showcasePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .showcase .live-dot { animation: none; }
        }
        .showcase .hero-logo {
          width: clamp(220px, 30vw, 340px);
          height: auto;
        }
        .showcase .headline {
          font-family: var(--font-display), 'Inter', sans-serif;
          font-weight: 800;
          font-size: clamp(2.6rem, 7vw, 5.2rem);
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin: 0;
        }
        .showcase .beamed {
          background: linear-gradient(100deg, #fff2d4 0%, var(--beam) 45%, #d9a94f 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .showcase .sub {
          max-width: 42rem;
          color: var(--stext-dim);
          font-size: clamp(0.95rem, 1.4vw, 1.08rem);
          line-height: 1.65;
          margin: 0;
        }
        .showcase .cta-row {
          display: flex;
          gap: 0.9rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.4rem;
        }
        .showcase .cta-primary {
          background: var(--blurple);
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.85rem 1.7rem;
          border-radius: 12px;
          text-decoration: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 24px rgba(88, 101, 242, 0.35);
        }
        .showcase .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(88, 101, 242, 0.5);
        }
        .showcase .cta-ghost {
          color: var(--stext-dim);
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.85rem 1.4rem;
          border: 1px solid var(--edge);
          border-radius: 12px;
          text-decoration: none;
          background: transparent;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .showcase .cta-ghost:hover {
          color: var(--stext);
          border-color: rgba(255, 217, 138, 0.4);
        }

        /* --------------------------- stat strip ------------------ */
        .showcase .stat-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1px;
          background: var(--edge);
          border: 1px solid var(--edge);
          border-radius: 16px;
          overflow: hidden;
          margin-top: 2.2rem;
          width: min(58rem, 100%);
        }
        .showcase .stat {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          padding: 1.5rem 1rem;
          background: rgba(20, 20, 29, 0.85);
        }
        .showcase .stat-number {
          font-family: var(--font-display), 'Inter', sans-serif;
          font-weight: 700;
          font-size: clamp(1.5rem, 3.2vw, 2.3rem);
          color: var(--beam);
          text-shadow: 0 0 24px rgba(255, 217, 138, 0.25);
          font-variant-numeric: tabular-nums;
        }
        .showcase .stat-label {
          font-family: var(--font-mono), monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: var(--stext-dim);
        }
        @media (max-width: 720px) {
          .showcase .stat-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        /* ---------------------------- gallery --------------------- */
        .showcase .gallery-section {
          max-width: 78rem;
          margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
        }
        .showcase .gallery-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.2rem;
        }
        .showcase .gallery-title {
          font-family: var(--font-display), 'Inter', sans-serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 2.6vw, 2rem);
          margin: 0;
        }
        .showcase .gallery-note {
          font-family: var(--font-mono), monospace;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          color: var(--stext-dim);
          white-space: nowrap;
        }
        .showcase .chips {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.8rem;
          margin-bottom: 1.2rem;
          scrollbar-width: none;
        }
        .showcase .chips::-webkit-scrollbar { display: none; }
        .showcase .chip {
          font-family: var(--font-mono), monospace;
          font-size: 0.75rem;
          color: var(--stext-dim);
          background: var(--panel);
          border: 1px solid var(--edge);
          border-radius: 999px;
          padding: 0.42rem 0.9rem;
          cursor: pointer;
          white-space: nowrap;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .showcase .chip:hover { color: var(--stext); }
        .showcase .chip-on {
          color: #1a1204;
          background: var(--beam);
          border-color: var(--beam);
          font-weight: 700;
        }
        .showcase .chip-count { opacity: 0.65; margin-left: 0.15rem; }

        /* the beam — warm light that follows the cursor */
        .showcase .masonry-wrap { position: relative; }
        .showcase .beam-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: radial-gradient(
            580px circle at var(--mx, 50%) var(--my, 20%),
            var(--beam-dim) 0%,
            transparent 65%
          );
          mix-blend-mode: screen;
        }
        @media (hover: none) {
          .showcase .beam-overlay { display: none; }
        }

        .showcase .masonry {
          display: flex;
          gap: 0.9rem;
          align-items: flex-start;
        }
        .showcase .masonry-col {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .showcase .card-hit {
          display: block;
          width: 100%;
          text-align: left;
          background: var(--panel);
          border: 1px solid var(--edge);
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          color: inherit;
          font: inherit;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .showcase .card-hit:hover, .showcase .card-hit:focus-visible {
          transform: translateY(-3px);
          border-color: rgba(255, 217, 138, 0.35);
          box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5), 0 0 22px rgba(255, 217, 138, 0.08);
        }
        .showcase .card-hit:focus-visible {
          outline: 2px solid var(--beam);
          outline-offset: 2px;
        }
        .showcase .card-media { position: relative; display: block; }
        .showcase .card-media img,
        .showcase .card-media video {
          width: 100%;
          display: block;
          filter: brightness(0.94);
          transition: filter 0.18s ease;
        }
        .showcase .card-hit:hover .card-media img,
        .showcase .card-hit:hover .card-media video {
          filter: brightness(1.04);
        }
        .showcase .video-badge,
        .showcase .count-badge {
          position: absolute;
          right: 8px;
          bottom: 8px;
          font-size: 0.65rem;
          font-family: var(--font-mono), monospace;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          border-radius: 6px;
          padding: 3px 7px;
        }
        .showcase .card-caption {
          font-size: 0.82rem;
          line-height: 1.5;
          color: var(--stext);
          padding: 0.7rem 0.8rem 0;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .showcase .card-caption-only {
          -webkit-line-clamp: 6;
          font-size: 0.95rem;
          padding-top: 1rem;
          border-left: 3px solid var(--beam-dim);
        }
        .showcase .card-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 0.8rem 0.75rem;
          font-size: 0.72rem;
          color: var(--stext-dim);
          min-width: 0;
        }
        .showcase .card-author {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
        }
        .showcase .card-hearts {
          color: var(--heart);
          font-weight: 600;
          flex-shrink: 0;
        }
        .showcase .card-tag {
          font-family: var(--font-mono), monospace;
          font-size: 0.65rem;
          color: var(--beam);
          flex-shrink: 0;
          margin-left: auto;
        }
        .showcase .empty {
          border: 1px dashed var(--edge);
          border-radius: 14px;
          padding: 3.5rem 2rem;
          text-align: center;
          color: var(--stext-dim);
          font-size: 0.95rem;
        }
        .showcase .more-row {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }
        .showcase .more-btn {
          cursor: pointer;
          font-family: inherit;
        }
        .showcase .more-btn:disabled { opacity: 0.5; cursor: default; }

        /* ---------------------------- lightbox -------------------- */
        .showcase .lightbox {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(5, 5, 8, 0.88);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .showcase .lightbox-inner {
          position: relative;
          background: var(--panel);
          border: 1px solid var(--edge);
          border-radius: 16px;
          max-width: min(60rem, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 1.2rem;
        }
        .showcase .lightbox-close {
          position: absolute;
          top: 0.7rem;
          right: 0.7rem;
          z-index: 2;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          border: none;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .showcase .lightbox-media img,
        .showcase .lightbox-media video {
          width: 100%;
          border-radius: 10px;
          display: block;
          margin-bottom: 0.8rem;
        }
        .showcase .lightbox-caption {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--stext);
          margin: 0.2rem 0 0.8rem;
          white-space: pre-wrap;
        }
        .showcase .lightbox-meta {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.8rem;
          color: var(--stext-dim);
          flex-wrap: wrap;
        }
        .showcase .lightbox-source {
          margin-left: auto;
          color: var(--beam);
          text-decoration: none;
          font-family: var(--font-mono), monospace;
          font-size: 0.72rem;
        }
        .showcase .lightbox-source:hover { text-decoration: underline; }

        @media (max-width: 640px) {
          .showcase .hero { padding-top: 7rem; }
          .showcase .gallery-head { flex-direction: column; gap: 0.2rem; }
        }
      `}</style>
    </div>
  );
}
