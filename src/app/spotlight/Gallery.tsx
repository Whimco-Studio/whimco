'use client';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  ShowcaseItem, ShowcaseMedia, cleanCaption, xLink,
} from './constants';
import VerifiedSeal from './VerifiedSeal';
import CategoryTag from './CategoryTag';
import type { Likes } from './useLikes';

/** Lightbox video: starts on open (the click is the gesture); if the
    browser still refuses sound-on autoplay, retries muted. */
function LightboxVideo({ media, auto }: { media: ShowcaseMedia; auto: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !auto) return;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, [auto]);
  return (
    <video
      ref={ref}
      src={media.url}
      poster={media.thumbnail || undefined}
      controls
      playsInline
      autoPlay={auto}
    />
  );
}

function HeartButton({ item, likes }: { item: ShowcaseItem; likes?: Likes }) {
  if (!likes) {
    return <span className="card-hearts">♥ {item.hearts.toLocaleString('en-US')}</span>;
  }
  const on = likes.isLiked(item.id);
  return (
    <button
      type="button"
      className={`card-hearts heart-btn ${on ? 'heart-on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Remove your heart' : 'Heart this creation'}
      title={likes.signedIn ? undefined : 'Sign in with Discord to heart'}
      onClick={(e) => { e.stopPropagation(); likes.toggle(item); }}
    >
      {on ? '♥' : '♡'} {likes.hearts(item).toLocaleString('en-US')}
    </button>
  );
}

/** Remove control, shown only on your own creations.

    Two presses, not a modal or a confirm(): the first arms it and the
    second commits, and it disarms itself after a few seconds or when
    focus leaves. Same guard shape as /flagged. That suits an action this
    reversible, and it keeps a mis-aimed click on a dense card grid from
    being the whole interaction.

    Removal is whimco.com only. The copy says so, because a creator who
    reads "remove" as "unsend across 60 servers" would be wrong in a way
    they might not discover for days. */
function RemoveButton({
  item, likes, onRemoved,
}: { item: ShowcaseItem; likes?: Likes; onRemoved?: (id: number) => void }) {
  const [armed, setArmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (!likes?.isMine(item.id)) return null;

  const disarm = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setArmed(false);
  };

  const press = async () => {
    if (busy) return;
    if (!armed) {
      setFailed(false);
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    disarm();
    setBusy(true);
    const ok = await likes.setRemoved(item, true);
    setBusy(false);
    if (ok) onRemoved?.(item.id); else setFailed(true);
  };

  return (
    <span className="card-remove-wrap">
      <button
        type="button"
        className={`card-remove ${armed ? 'card-remove-armed' : ''}`}
        // The card behind this is a click target that opens the lightbox.
        onClick={(e) => { e.stopPropagation(); press(); }}
        onBlur={disarm}
        disabled={busy}
        title={armed
          ? 'Press again to take this off whimco.com'
          : 'Remove this from whimco.com. Copies already shared in Discord stay.'}
      >
        {armed ? 'Remove?' : '✕'}
      </button>
      {failed && <span className="tag-failed" role="alert">not removed</span>}
    </span>
  );
}

function CardMedia({ item, deep }: { item: ShowcaseItem; deep: boolean }) {
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
          // metadata opens a request per card the moment it mounts, which
          // is fine for one page of 24 and not fine on a grid that keeps
          // everything already scrolled past mounted. Images next to
          // these carry loading="lazy" and cost nothing offscreen; only
          // video needed telling. The poster still paints either way.
          preload={deep ? 'none' : 'metadata'}
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
        <img
          src={media.url}
          referrerPolicy="no-referrer"
          alt={cleanCaption(item.content).slice(0, 80) || `Creation by ${item.author_name}`}
          loading="lazy"
          // X-hosted media is linked, not mirrored, so it 404s the moment
          // the creator deletes their post. The liveness sweep retires
          // those items, but it needs two sightings hours apart, and in
          // that window an unhandled failure paints the alt text across
          // the card at full size, which reads as a broken site rather
          // than a withdrawn creation.
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        />
        {item.media.length > 1 && (
          <span className="count-badge">+{item.media.length - 1}</span>
        )}
      </div>
    );
  }
  return null;
}

function GalleryCard({
  item, onOpen, showAuthor, likes, onRemoved, deep,
}: {
  item: ShowcaseItem; onOpen: () => void; showAuthor: boolean;
  likes?: Likes; onRemoved?: (id: number) => void; deep: boolean;
}) {
  const caption = cleanCaption(item.content);
  return (
    <article className="card">
      <button
        type="button"
        className="card-hit"
        onClick={onOpen}
        aria-label={`Open creation by ${item.author_name}`}
      >
        <CardMedia item={item} deep={deep} />
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
            {item.author_claimed && <VerifiedSeal className="card-seal" />}
          </a>
        ) : (
          <span className="card-author">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        )}
        <HeartButton item={item} likes={likes} />
        <CategoryTag item={item} likes={likes} />
        <RemoveButton item={item} likes={likes} onRemoved={onRemoved} />
      </div>
    </article>
  );
}

function Lightbox({
  item, onClose, likes, onRemoved,
}: {
  item: ShowcaseItem; onClose: () => void;
  likes?: Likes; onRemoved?: (id: number) => void;
}) {
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
          {item.media.map((m, i) => (
            m.content_type.startsWith('video/')
              ? <LightboxVideo key={m.url} media={m} auto={i === 0} />
              : (
                <img
                  key={m.url}
                  src={m.url}
                  referrerPolicy="no-referrer"
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )
          ))}
        </div>
        {cleanCaption(item.content) && <p className="lightbox-caption">{cleanCaption(item.content)}</p>}
        <div className="lightbox-meta">
          <a className="card-author" href={`/spotlight/@${encodeURIComponent(item.author_name)}`}>
            by {item.author_name}
            {item.author_claimed && <VerifiedSeal className="card-seal" />}
          </a>
          <HeartButton item={item} likes={likes} />
          <CategoryTag item={item} likes={likes} />
          <RemoveButton item={item} likes={likes} onRemoved={onRemoved} />
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
  items, emptyText, showAuthor = true, canLoadMore = false, loading = false,
  onLoadMore, likes, onRemoved, deep = false,
}: {
  items: ShowcaseItem[];
  emptyText: string;
  showAuthor?: boolean;
  canLoadMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  likes?: Likes;
  /** Called with the id after one of the viewer's own creations is
      removed, so the parent that owns the list can drop the card. */
  onRemoved?: (id: number) => void;
  /** This grid can grow past one page and keeps everything mounted, so
      cards must not each hold a network connection open. Set by
      /spotlight/gallery, left off for the fixed-length grids. */
  deep?: boolean;
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
                      likes={likes}
                      onRemoved={onRemoved}
                      deep={deep}
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

      {selected && (
        <Lightbox
          item={selected}
          likes={likes}
          onClose={() => setSelected(null)}
          // Closing first: leaving the lightbox open over a creation that
          // is no longer in the grid behind it reads as the removal
          // having failed.
          onRemoved={(id) => { setSelected(null); onRemoved?.(id); }}
        />
      )}
    </>
  );
}
