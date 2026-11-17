'use client';

import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  CATEGORY_LABELS, ShowcaseItem, ShowcaseMedia, cleanCaption, postPath, xLink, mediaKind, mediaPath
} from './constants';
import ShareButton from './ShareButton';
import VerifiedSeal from './VerifiedSeal';
import AudioTile from './AudioTile';
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

/** A zero is not a score, it is the absence of one, and a grid where every
    card reads "0" says the network ignored all of it. So the glyph carries
    the invitation on its own until there is a real number to show, and the
    count appears the moment the first heart lands. The button stays a
    button at zero: that is the state where being able to press it matters
    most. Without a count to read, the aria-label is the whole label, which
    is why it names the action rather than the total. */
function HeartButton({ item, likes }: { item: ShowcaseItem; likes?: Likes }) {
  if (!likes) {
    // Read-only (the removed drawer). A bare heart with no number and no
    // press is just decoration, so at zero there is nothing worth drawing.
    if (item.hearts < 1) return null;
    return <span className="card-hearts">♥ {item.hearts.toLocaleString('en-US')}</span>;
  }
  const on = likes.isLiked(item.id);
  const count = likes.hearts(item);
  return (
    <button
      type="button"
      className={`card-hearts heart-btn ${on ? 'heart-on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Remove your heart' : 'Heart this creation'}
      title={likes.signedIn ? undefined : 'Sign in with Discord to heart'}
      onClick={(e) => { e.stopPropagation(); likes.toggle(item); }}
    >
      {on ? '♥' : '♡'}
      {count > 0 ? ` ${count.toLocaleString('en-US')}` : ''}
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

/** Lightbox audio: the tile above a native player, which starts on open
    since the click is the gesture. */
function LightboxAudio({ media, auto }: { media: ShowcaseMedia; auto: boolean }) {
  return (
    <div className="lightbox-audio">
      <AudioTile seed={mediaPath(media.url)} />
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio src={media.url} controls preload="metadata" autoPlay={auto} />
    </div>
  );
}

function CardMedia({ item, deep }: { item: ShowcaseItem; deep: boolean }) {
  const media = item.media[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  if (!media) return null;
  const kind = mediaKind(media);
  if (kind === 'audio') {
    return (
      <div className="card-media">
        <AudioTile seed={mediaPath(media.url)} />
        <span className="video-badge" aria-hidden>♪</span>
      </div>
    );
  }
  if (kind === 'video') {
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
  if (kind === 'image') {
    return (
      <div className="card-media">
        {/* Presigned S3 URLs rotate every revalidate — plain img, not
            next/image, so the optimizer cache never 403s on expiry. */}
        <img
          src={media.url}
          referrerPolicy="no-referrer"
          alt={cleanCaption(item.content).slice(0, 80)
            || `${item.category && CATEGORY_LABELS[item.category] ? `Roblox ${CATEGORY_LABELS[item.category]}` : 'Roblox creation'} by ${item.author_name}`}
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
      {/* A real link to the creation's own page, so a crawler can walk
          from any grid to every permalink. A plain click still opens the
          lightbox in place; a modified click (new tab, copy link) gets
          the page, which is what those gestures mean. */}
      <a
        href={postPath(item.id)}
        className="card-hit"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen();
        }}
        aria-label={`Open creation by ${item.author_name}`}
      >
        <CardMedia item={item} deep={deep} />
        {caption && (
          <p className={`card-caption ${item.media.length === 0 ? 'card-caption-only' : ''}`}>
            {caption}
          </p>
        )}
      </a>
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

/** The tile for the Pinterest-shaped layout: the work and nothing else
    until the pointer arrives. No panel, no border, no caption, so the
    grid reads as one wall of images. The creator's name stays under every
    tile, because a wall that loses who made what has stopped being
    Spotlight. Retagging and removal live in the lightbox in this layout;
    on a tile this small they are clutter at best and a misclick at worst. */
function PinCard({
  item, onOpen, likes, deep,
}: {
  item: ShowcaseItem; onOpen: () => void; likes?: Likes; deep: boolean;
}) {
  const caption = cleanCaption(item.content);
  return (
    <article className={`pin ${likes?.isLiked(item.id) ? 'pin-liked' : ''}`}>
      <a
        href={postPath(item.id)}
        className="pin-hit"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen();
        }}
        aria-label={`Open creation by ${item.author_name}`}
      >
        {item.media.length > 0
          ? <CardMedia item={item} deep={deep} />
          : <p className="pin-text">{caption}</p>}
        <span className="pin-shade" aria-hidden />
      </a>
      <HeartButton item={item} likes={likes} />
      <a
        className="pin-author"
        href={`/spotlight/@${encodeURIComponent(item.author_name)}`}
        title={`View ${item.author_name}'s portfolio`}
      >
        {item.author_name}
        {item.author_claimed && <VerifiedSeal className="card-seal" />}
      </a>
    </article>
  );
}

/** Height over width for each tile in the pins layout, learned before the
    tile is placed. The API rarely knows a size, so images (and video
    posters) are fetched off-screen just to read their dimensions; the
    browser cache means the real <img> then costs nothing extra. Anything
    still unknown after a couple of seconds is treated as square, so one
    slow or dead URL cannot hold the rest of the wall back. */
function usePinRatios(items: ShowcaseItem[], on: boolean) {
  const [ratios, setRatios] = useState<Map<number, number>>(() => new Map());
  const asked = useRef(new Set<number>());

  useEffect(() => {
    if (!on) return;
    const learned = new Map<number, number>();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const flush = () => {
      timer = null;
      if (learned.size === 0) return;
      const batch = new Map(learned);
      learned.clear();
      setRatios((prev) => {
        const next = new Map(prev);
        batch.forEach((r, id) => next.set(id, r));
        return next;
      });
    };
    // Batched, so 24 images arriving in a burst cost one re-layout, not 24.
    const learn = (id: number, r: number) => {
      learned.set(id, Number.isFinite(r) && r > 0 ? Math.min(Math.max(r, 0.4), 2.6) : 1);
      if (!timer) timer = setTimeout(flush, 60);
    };
    for (const item of items) {
      if (asked.current.has(item.id)) continue;
      asked.current.add(item.id);
      const m = item.media[0];
      if (!m) { learn(item.id, 0.75); continue; } // caption-only text tile
      if (m.w && m.h) { learn(item.id, m.h / m.w); continue; }
      const kind = mediaKind(m);
      if (kind === 'audio') { learn(item.id, 9 / 16); continue; }
      const src = kind === 'image' ? m.url : (kind === 'video' ? m.thumbnail : undefined);
      if (!src) { learn(item.id, 9 / 16); continue; }
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      const give = setTimeout(() => learn(item.id, 1), 2500);
      img.onload = () => { clearTimeout(give); learn(item.id, img.naturalHeight / img.naturalWidth); };
      img.onerror = () => { clearTimeout(give); learn(item.id, 1); };
      img.src = src;
    }
    return () => { if (timer) { clearTimeout(timer); flush(); } };
  }, [items, on]);

  return ratios;
}

/** Pins placement: each batch of 24 (one API page) is sorted tallest
    first and then dealt into the columns in turn. Dealing in turn, rather
    than filling the shortest column, keeps the ragged staggered edge
    Trendon liked; tallest first puts the portrait work, which reads best
    in a narrow column, at the top of every batch instead of scattered
    among wide Studio screenshots. A batch appears only once all its sizes
    are known, so nothing already on screen moves. Within a batch, "New"
    gives way to shape; across batches the feed order holds. */
const PIN_BATCH = 24;
function usePinColumns(items: ShowcaseItem[], cols: number, ratios: Map<number, number>) {
  const out: ShowcaseItem[][] = Array.from({ length: cols }, () => []);
  let dealt = 0;
  for (let start = 0; start < items.length; start += PIN_BATCH) {
    const batch = items.slice(start, start + PIN_BATCH);
    if (batch.some((i) => !ratios.has(i.id))) break;
    const sorted = batch
      .map((item, k) => ({ item, k, r: ratios.get(item.id) as number }))
      // Stable on ties, so equal shapes keep their feed order.
      .sort((x, y) => (y.r - x.r) || (x.k - y.k));
    for (const { item } of sorted) {
      out[dealt % cols].push(item);
      dealt += 1;
    }
  }
  return out;
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
          {item.media.map((m, i) => {
            const kind = mediaKind(m);
            if (kind === 'video') return <LightboxVideo key={m.url} media={m} auto={i === 0} />;
            if (kind === 'audio') return <LightboxAudio key={m.url} media={m} auto={i === 0} />;
            return (
              <img
                key={m.url}
                src={m.url}
                referrerPolicy="no-referrer"
                alt=""
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            );
          })}
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
          <ShareButton id={item.id} authorName={item.author_name} />
        </div>
      </div>
    </div>
  );
}

/** Round-robin masonry + beam overlay + lightbox. Presentational: the
    parent owns items/pagination state. */
export default function GalleryGrid({
  items, emptyText, showAuthor = true, canLoadMore = false, loading = false,
  onLoadMore, likes, onRemoved, deep = false, arrangement = 'masonry', variant = 'cards',
  maxCols = 4,
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
  /** 'masonry' is the default everywhere and is what the feed, the
      gallery and the creators page all render. 'squares' is the contact
      sheet the Sheet portfolio layout asks for: uniform cells in reading
      order rather than dealt round-robin into columns, because a sheet
      whose order runs down each column instead of across is not a sheet.
      Both arrangements share every card, so hearts, the lightbox and the
      owner's remove button work the same in either. */
  arrangement?: 'masonry' | 'squares';
  /** Ceiling on the masonry column count. The count is derived from the
      window, which is right for a grid that spans the page and wrong for
      one inside a narrow column: the Card portfolio layout is 34rem wide
      on any monitor, and four columns in it made thumbnails so small the
      date elided to "A...". */
  maxCols?: number;
  /** 'cards' is the live look. 'pins' is the image-only wall on
      /lab/gallery: more, narrower columns and a bare tile. */
  variant?: 'cards' | 'pins';
}) {
  const [selected, setSelected] = useState<ShowcaseItem | null>(null);
  const [cols, setCols] = useState(4);
  const galleryRef = useRef<HTMLDivElement>(null);
  // Until every tile on screen has a size, the pins layout deals
  // round-robin like the cards: the server's HTML and a reader without
  // JavaScript get a full grid, and nobody sees it empty while sizes
  // arrive. It switches once and stays switched; tiles appended later
  // simply wait for their size before appearing.
  const pinRatios = usePinRatios(items, variant === 'pins');
  const pinCols = usePinColumns(items, cols, pinRatios);
  const [pinReady, setPinReady] = useState(false);
  const pinPlaced = pinCols.reduce((n, col) => n + col.length, 0);
  useEffect(() => {
    if (!pinReady && variant === 'pins' && items.length > 0 && pinPlaced >= items.length) setPinReady(true);
  }, [pinReady, variant, items.length, pinPlaced]);
  const columnItems = (c: number) => (variant === 'pins' && pinReady
    ? pinCols[c] ?? []
    : items.filter((_, i) => i % cols === c));

  /* An open creation gets a URL, which is what makes the address bar a
     share link and the back button a close button. Raw history rather
     than the Next router on purpose: this is the same page under another
     name, and routing to it would unmount the grid and refetch
     everything behind the lightbox. */
  const openItem = useCallback((item: ShowcaseItem) => {
    setSelected(item);
    window.history.pushState({ spotlightLightbox: true }, '', postPath(item.id));
  }, []);

  const closeItem = useCallback(() => {
    setSelected(null);
    // Only unwind an entry this component pushed. Someone who arrived
    // with the lightbox already open would otherwise be walked off the
    // gallery entirely by pressing close.
    if (window.history.state?.spotlightLightbox) window.history.back();
  }, []);

  useEffect(() => {
    const onPop = () => setSelected(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Rank must read left-to-right: items are dealt round-robin into real
  // columns instead of CSS `columns`, which re-balances on every append.
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      // Pins are narrow by design: two across even on a phone, up to
      // seven on a wide monitor, about 236px each like the reference.
      const n = variant === 'pins'
        ? (w < 760 ? 2 : w < 1020 ? 3 : w < 1280 ? 4 : w < 1540 ? 5 : w < 1800 ? 6 : 7)
        : (w < 640 ? 1 : w < 900 ? 2 : w < 1200 ? 3 : 4);
      setCols(variant === 'pins' ? n : Math.min(maxCols, n));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [maxCols, variant]);

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
          {variant !== 'pins' && <div className="beam-overlay" aria-hidden />}
          {arrangement === 'squares' ? (
            /* One flat container, so the cards keep document order. The
               masonry below deals them round-robin into real columns,
               which is right when heights vary and wrong here: uniform
               cells dealt that way read top-to-bottom down each column
               while the eye reads across. */
            <div className="sheetgrid">
              {items.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  showAuthor={showAuthor}
                  likes={likes}
                  onRemoved={onRemoved}
                  deep={deep}
                  onOpen={() => openItem(item)}
                />
              ))}
            </div>
          ) : (
            <div className={`masonry ${variant === 'pins' ? 'masonry-pins' : ''}`}>
              {Array.from({ length: cols }, (_, c) => (
                <div className="masonry-col" key={c}>
                  {columnItems(c)
                    .map((item) => (variant === 'pins' ? (
                      <PinCard
                        key={item.id}
                        item={item}
                        likes={likes}
                        deep={deep}
                        onOpen={() => openItem(item)}
                      />
                    ) : (
                      <GalleryCard
                        key={item.id}
                        item={item}
                        showAuthor={showAuthor}
                        likes={likes}
                        onRemoved={onRemoved}
                        deep={deep}
                        onOpen={() => openItem(item)}
                      />
                    )))}
                </div>
              ))}
            </div>
          )}
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
          onClose={closeItem}
          // Closing first: leaving the lightbox open over a creation that
          // is no longer in the grid behind it reads as the removal
          // having failed.
          onRemoved={(id) => { closeItem(); onRemoved?.(id); }}
        />
      )}
    </>
  );
}
