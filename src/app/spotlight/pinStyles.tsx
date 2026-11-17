/** Styles for the Pinterest-shaped gallery demo at /lab/gallery. Loaded
    only by that page, after ShowcaseStyles and BrowseStyles, so these win
    where they overlap and the live gallery never ships them. */
export default function PinStyles() {
  return (
    <style jsx global>{`
      /* The demo's top bar carries the site: the wordmark, the search,
         and GlassNav's pill made compact. Same frosted glass as
         GlassNav, so it reads as whimco.com rather than a new app. */
      .showcase .pn-bar {
        position: sticky;
        top: 0;
        z-index: 40;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1.25rem;
        background: rgba(10, 10, 15, 0.72);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-bottom: 1px solid var(--edge);
      }
      /* The wordmark is about 2.8 to 1; drawn at its own shape, never
         squeezed into a square. */
      .showcase .pn-home { display: flex; flex-shrink: 0; padding: 0.25rem; border-radius: 8px; }
      .showcase .pn-home:focus-visible { outline: 2px solid var(--beam); }
      .showcase .pn-home img { display: block; height: 30px; width: auto; }
      .showcase .pn-search {
        position: relative;
        flex: 1;
        max-width: 34rem;
        margin: 0 auto;
      }
      .showcase .pn-search-icon {
        position: absolute;
        left: 1.05rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--stext-dim);
        font-size: 1.15rem;
        pointer-events: none;
      }
      .showcase .pn-search-input {
        width: 100%;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 999px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        color: var(--stext);
        font-size: 0.95rem;
        padding: 0.68rem 1.1rem 0.68rem 2.6rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .showcase .pn-search-input::placeholder { color: var(--stext-dim); }
      .showcase .pn-search-input:focus {
        outline: none;
        border-color: rgba(255, 217, 138, 0.55);
        box-shadow: 0 0 0 3px var(--beam-dim);
      }

      /* GlassNav's pill, one size down. */
      .showcase .pn-site {
        display: flex;
        flex-shrink: 0;
        gap: 0.2rem;
        padding: 0.3rem;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 999px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
      .showcase .pn-site-link {
        padding: 0.42rem 0.95rem;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.82rem;
        font-weight: 500;
        text-decoration: none;
        border-radius: 999px;
        white-space: nowrap;
        transition: background 0.2s ease, color 0.2s ease;
      }
      .showcase .pn-site-link:hover { color: #fff; background: rgba(255, 255, 255, 0.1); }
      .showcase .pn-site-link:focus-visible { outline: 2px solid var(--beam); }
      .showcase .pn-site-link.pn-site-on {
        color: #fff;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      }

      /* Narrow screens: the same links behind one pill. */
      .showcase .pn-menu { display: none; position: relative; flex-shrink: 0; }
      .showcase .pn-menu summary {
        list-style: none;
        cursor: pointer;
        padding: 0.5rem 0.95rem;
        font-size: 0.82rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.85);
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 999px;
      }
      .showcase .pn-menu summary::-webkit-details-marker { display: none; }
      .showcase .pn-menu summary:focus-visible { outline: 2px solid var(--beam); }
      .showcase .pn-menu-list {
        position: absolute;
        right: 0;
        top: calc(100% + 0.5rem);
        display: flex;
        flex-direction: column;
        min-width: 11rem;
        padding: 0.4rem;
        background: rgba(20, 20, 29, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
      }
      .showcase .pn-menu-list a {
        padding: 0.6rem 0.8rem;
        color: rgba(255, 255, 255, 0.85);
        text-decoration: none;
        font-size: 0.9rem;
        border-radius: 10px;
      }
      .showcase .pn-menu-list a:hover { background: rgba(255, 255, 255, 0.08); }
      .showcase .pn-menu-list a.pn-site-on { color: var(--beam); }

      /* One row of words in the site's mono, scrolling sideways when it
         runs out of room, never wrapping. The chosen one lights in the
         beam gold the live gallery uses for its chosen chip. */
      .showcase .pn-cats {
        display: flex;
        align-items: center;
        gap: 0.15rem;
        overflow-x: auto;
        scrollbar-width: none;
        padding: 0.85rem 1.25rem 1rem;
      }
      .showcase .pn-cats::-webkit-scrollbar { display: none; }
      .showcase .pn-cat {
        position: relative;
        flex-shrink: 0;
        background: none;
        border: none;
        color: var(--stext-dim);
        font-family: var(--font-mono), monospace;
        font-size: 0.8rem;
        letter-spacing: 0.04em;
        padding: 0.45rem 0.7rem;
        border-radius: 999px;
        cursor: pointer;
        white-space: nowrap;
        transition: color 0.15s ease, background 0.15s ease;
      }
      .showcase .pn-cat:hover { color: var(--stext); background: rgba(255, 255, 255, 0.06); }
      .showcase .pn-cat:focus-visible { outline: 2px solid var(--beam); outline-offset: 1px; }
      .showcase .pn-cat-on,
      .showcase .pn-cat-on:hover {
        color: #14110a;
        background: var(--beam);
        font-weight: 700;
        box-shadow: 0 0 14px rgba(255, 217, 138, 0.28);
      }
      .showcase .pn-gap { flex: 1; min-width: 1.5rem; }
      .showcase .pn-sr {
        position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
      }
      .showcase .pn-ref {
        flex-shrink: 0;
        font-family: var(--font-mono), monospace;
        font-size: 0.74rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
        text-decoration: none;
        margin-right: 1rem;
        white-space: nowrap;
      }
      .showcase .pn-ref:hover { color: var(--beam); }
      .showcase .pn-ref:focus-visible { outline: 2px solid var(--beam); outline-offset: 2px; }
      /* While the wall is loading by itself the link is only a fallback,
         so it sits small and dim rather than as a button to press. */
      .showcase .pn-more-quiet .more-btn {
        background: none;
        border-color: transparent;
        color: var(--stext-dim);
        font-size: 0.8rem;
      }
      .showcase .pn-count {
        flex-shrink: 0;
        font-family: var(--font-mono), monospace;
        font-size: 0.74rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
        margin-right: 0.6rem;
        white-space: nowrap;
      }
      .showcase .pn-count b { color: var(--beam); }
      /* The sort reads as tabs, the way the live gallery's New / Top this
         week do: gold text and a gold rule, no filled pill. */
      .showcase .pn-sort { border-radius: 0; padding-bottom: 0.5rem; }
      .showcase .pn-sort.pn-cat-on,
      .showcase .pn-sort.pn-cat-on:hover {
        color: var(--beam);
        background: none;
        box-shadow: inset 0 -2px 0 var(--beam);
      }

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
      .showcase .pin-hit::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
        transition: box-shadow 0.2s ease;
        pointer-events: none;
      }
      .showcase .pin:hover .pin-hit::after { box-shadow: inset 0 0 0 1px rgba(255, 217, 138, 0.45); }
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

      @media (max-width: 1100px) {
        .showcase .pn-site { display: none; }
        .showcase .pn-menu { display: block; }
      }
      /* Thirteen category words plus References, the count and two tabs
         overflow a 1440px window; the count goes first. */
      @media (max-width: 1600px) {
        .showcase .pn-count { display: none; }
      }
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
