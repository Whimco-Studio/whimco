'use client';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Image from 'next/image';
import GalleryGrid from './Gallery';
import ShowcaseStyles from './styles';
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

  const statsRef = useRef<HTMLDivElement>(null);

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

        <GalleryGrid
          items={items}
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
