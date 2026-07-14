'use client';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  CATEGORY_LABELS, ShowcaseItem, cleanCaption, xLink,
} from './constants';

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

function GalleryCard({
  item, onOpen, showAuthor,
}: { item: ShowcaseItem; onOpen: () => void; showAuthor: boolean }) {
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
      </button>
      <div className="card-meta">
        {showAuthor ? (
          <a
            className="card-author"
            href={`/spotlight/@${encodeURIComponent(item.author_name)}`}
            title={`View ${item.author_name}'s portfolio`}
          >
            by {item.author_name}
          </a>
        ) : (
          <span className="card-author">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        )}
        <span className="card-hearts">♥ {item.hearts.toLocaleString('en-US')}</span>
        {item.category && (
          <span className="card-tag">{CATEGORY_LABELS[item.category] ?? item.category}</span>
        )}
      </div>
    </article>
  );
}

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
              ? <video key={m.url} src={m.url} poster={m.thumbnail || undefined} controls playsInline />
              : <img key={m.url} src={m.url} alt="" />
          ))}
        </div>
        {cleanCaption(item.content) && <p className="lightbox-caption">{cleanCaption(item.content)}</p>}
        <div className="lightbox-meta">
          <a className="card-author" href={`/spotlight/@${encodeURIComponent(item.author_name)}`}>
            by {item.author_name}
          </a>
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

/** Round-robin masonry + beam overlay + lightbox. Presentational: the
    parent owns items/pagination state. */
export default function GalleryGrid({
  items, emptyText, showAuthor = true, canLoadMore = false, loading = false, onLoadMore,
}: {
  items: ShowcaseItem[];
  emptyText: string;
  showAuthor?: boolean;
  canLoadMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
}) {
  const [selected, setSelected] = useState<ShowcaseItem | null>(null);
  const [cols, setCols] = useState(4);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Rank must read left-to-right: items are dealt round-robin into real
  // columns instead of CSS `columns`, which re-balances on every append.
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 1 : w < 900 ? 2 : w < 1200 ? 3 : 4);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // The beam: warm light follows the cursor across the gallery.
  const onGalleryMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <>
      {items.length === 0 ? (
        <div className="empty">{emptyText}</div>
      ) : (
        <div className="masonry-wrap" ref={galleryRef} onMouseMove={onGalleryMove}>
          <div className="beam-overlay" aria-hidden />
          <div className="masonry">
            {Array.from({ length: cols }, (_, c) => (
              <div className="masonry-col" key={c}>
                {items
                  .filter((_, i) => i % cols === c)
                  .map((item) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      showAuthor={showAuthor}
                      onOpen={() => setSelected(item)}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {canLoadMore && (
        <div className="more-row">
          <button
            type="button"
            className="cta-ghost more-btn"
            disabled={loading}
            onClick={onLoadMore}
          >
            {loading ? 'Loading…' : 'Show more creations'}
          </button>
        </div>
      )}

      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
