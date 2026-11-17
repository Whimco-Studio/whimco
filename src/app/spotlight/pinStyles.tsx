/** Styles for the Pinterest-shaped gallery demo at /lab/gallery. Loaded
    only by that page, after ShowcaseStyles and BrowseStyles, so these win
    where they overlap and the live gallery never ships them. */
export default function PinStyles() {
  return (
    <style jsx global>{`
      /* No GlassNav on the demo: the search bar is the top of the page,
         and it stays there while the wall scrolls under it. */
      .showcase .pn-bar {
        position: sticky;
        top: 0;
        z-index: 40;
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 0.7rem 1.25rem;
        background: rgba(10, 10, 15, 0.92);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }
      /* The wordmark is about 2.8 to 1; drawn at its own shape, never
         squeezed into a square. */
      .showcase .pn-home { display: flex; flex-shrink: 0; padding: 0.25rem; border-radius: 8px; }
      .showcase .pn-home:focus-visible { outline: 2px solid var(--beam); }
      .showcase .pn-home img { display: block; height: 30px; width: auto; }
      .showcase .pn-search {
        position: relative;
        flex: 1;
        max-width: 36rem;
        margin: 0 auto;
      }
      .showcase .pn-search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--stext-dim);
        font-size: 1.15rem;
        pointer-events: none;
      }
      .showcase .pn-search-input {
        width: 100%;
        background: #1b1b24;
        border: 1px solid #2a2a36;
        border-radius: 14px;
        color: var(--stext);
        font-size: 0.95rem;
        padding: 0.72rem 1rem 0.72rem 2.5rem;
      }
      .showcase .pn-search-input::placeholder { color: var(--stext-dim); }
      .showcase .pn-search-input:focus { outline: none; border-color: var(--beam); }

      /* One row of words, scrolling sideways when it runs out of room,
         never wrapping into a second row of buttons. */
      .showcase .pn-cats {
        display: flex;
        align-items: center;
        gap: 0.2rem;
        overflow-x: auto;
        scrollbar-width: none;
        padding: 0.2rem 1.25rem 1rem;
      }
      .showcase .pn-cats::-webkit-scrollbar { display: none; }
      .showcase .pn-cat {
        flex-shrink: 0;
        background: none;
        border: none;
        color: var(--stext);
        font: inherit;
        font-size: 0.95rem;
        padding: 0.45rem 0.7rem;
        border-radius: 10px;
        cursor: pointer;
        white-space: nowrap;
      }
      .showcase .pn-cat:hover { background: rgba(255, 255, 255, 0.07); }
      .showcase .pn-cat:focus-visible { outline: 2px solid var(--beam); outline-offset: 1px; }
      .showcase .pn-cat-on {
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 0.45rem;
        text-decoration-thickness: 2px;
      }
      .showcase .pn-gap { flex: 1; min-width: 1.5rem; }
      .showcase .pn-sort { color: var(--stext-dim); font-size: 0.85rem; }
      .showcase .pn-sort.pn-cat-on { color: var(--stext); }

      /* Edge to edge, the way the reference fills the window. */
      .showcase .pn-section { max-width: none; padding: 0 1rem 5rem; }

      .showcase .masonry-pins { gap: 1rem; }
      .showcase .masonry-pins .masonry-col { gap: 1.1rem; }

      .showcase .pin { position: relative; }
      .showcase .pin-hit {
        position: relative;
        display: block;
        border-radius: 16px;
        overflow: hidden;
        background: #17171f;
        text-decoration: none;
      }
      .showcase .pin-hit:focus-visible { outline: 2px solid var(--beam); outline-offset: 2px; }
      .showcase .pin .card-media img,
      .showcase .pin .card-media video { width: 100%; display: block; }
      .showcase .pin-frame[style] .card-media,
      .showcase .pin-frame[style] .card-media img { height: 100%; }
      .showcase .pin-frame[style] .card-media img { object-fit: cover; }
      /* A clip with no poster and preload="none" has no frame to size
         itself by and collapses to nothing; hold a 16:9 shape instead. */
      .showcase .pin .card-media video:not([poster]) {
        aspect-ratio: 16 / 9;
        object-fit: cover;
        background: #1c1c25;
      }
      .showcase .pin-shade {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.32);
        opacity: 0;
        transition: opacity 0.15s ease;
        pointer-events: none;
      }
      .showcase .pin:hover .pin-shade,
      .showcase .pin:focus-within .pin-shade { opacity: 1; }

      /* A caption-only creation gets a quiet text tile rather than a gap. */
      .showcase .pin-text {
        margin: 0;
        padding: 1.1rem 1rem;
        color: var(--stext);
        font-size: 0.9rem;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 9;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* The heart sits on the image and appears with the pointer, the way
         the reference's Save button does. Once hearted it stays. */
      .showcase .pin button.heart-btn {
        position: absolute;
        top: 0.6rem;
        right: 0.6rem;
        z-index: 3;
        background: rgba(10, 10, 15, 0.72);
        color: #fff;
        border-radius: 999px;
        padding: 0.35rem 0.7rem;
        font-size: 0.85rem;
        opacity: 0;
        transition: opacity 0.15s ease, transform 0.12s ease;
      }
      .showcase .pin:hover button.heart-btn,
      .showcase .pin:focus-within button.heart-btn,
      .showcase .pin-liked button.heart-btn { opacity: 1; }
      .showcase .pin button.heart-btn.heart-on { color: var(--heart); }
      .showcase .pin span.card-hearts { display: none; }
      @media (hover: none) {
        .showcase .pin button.heart-btn { opacity: 1; }
      }

      .showcase .pin-skeleton {
        border-radius: 16px;
        background: #1c1c25;
        animation: pin-pulse 1.4s ease-in-out infinite;
      }
      .showcase .masonry-col .pin-skeleton:nth-of-type(2) { animation-delay: 0.2s; }
      @keyframes pin-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.55; }
      }
      @media (prefers-reduced-motion: reduce) {
        .showcase .pin-skeleton { animation: none; }
      }

      .showcase .pin-author {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.45rem 0.35rem 0;
        color: var(--stext-dim);
        font-size: 0.78rem;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .showcase .pin-author:hover { color: var(--stext); }

      .showcase .pn-section .more-row,
      .showcase .pn-section .br-end,
      .showcase .pn-section .br-deep { text-align: center; }

      @media (max-width: 640px) {
        .showcase .pn-bar { padding: 0.6rem 0.75rem; gap: 0.6rem; }
        .showcase .pn-home img { height: 24px; }
        .showcase .pn-cats { padding: 0.2rem 0.5rem 0.8rem; }
        .showcase .pn-section { padding: 0 0.5rem 4rem; }
        .showcase .masonry-pins { gap: 0.6rem; }
        .showcase .masonry-pins .masonry-col { gap: 0.8rem; }
      }
    `}</style>
  );
}
