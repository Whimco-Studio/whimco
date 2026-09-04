'use client';

/* Portfolio layouts a verified creator can choose between.
 *
 * Loaded only when a layout other than classic is in play, so a portfolio
 * that never chose ships none of this and cannot be moved by it. Every
 * rule is scoped under .showcase.pl-<layout>, which means classic is
 * defined entirely by the absence of this file and can never be broken
 * from here.
 *
 * These override the shared .pf-* header rules rather than replacing
 * them: the header markup is the same in every layout, so a change to
 * what a portfolio header says lands once instead of five times. */
export default function PortfolioLayoutStyles() {
  return (
    <style jsx global>{`
      .showcase .pl-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        justify-content: center;
        margin: 0;
      }
      .showcase .pl-chip {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        letter-spacing: 0.06em;
        padding: 0.25rem 0.55rem 0.3rem;
        border: 1px solid var(--edge);
        border-radius: 3px;
        color: var(--stext-dim);
      }

      /* ---------------- sheet ----------------
         Details down the side, work edge to edge. The rail sticks so the
         contact route stays on screen through a long body of work, which
         is the whole reason someone scrolls one of these. */
      /* The page is the grid, not the gallery section. The header is a
         sibling of that section, so a grid declared on the section could
         never place the rail: it laid out an empty first column and left
         the header stacked full width above it. */
      .showcase.pl-sheet {
        display: grid;
        grid-template-columns: 20rem 1fr;
        align-items: start;
      }
      .showcase.pl-sheet .gallery-section {
        max-width: none;
        /* The nav is fixed over the top of the page, and this column has
           no header of its own to hold it clear. Matches the rail's own
           top padding so the first row lines up with the name. */
        padding: 7rem 0 5rem;
      }
      .showcase.pl-sheet .pl-rail {
        position: sticky;
        top: 0;
        align-items: flex-start;
        text-align: left;
        gap: 0.85rem;
        padding: 7rem 2rem 2.5rem;
        max-height: 100vh;
        overflow-y: auto;
        border-right: 1px solid var(--edge);
      }
      .showcase.pl-sheet .pl-rail .pf-name { font-size: clamp(1.6rem, 2.4vw, 2.3rem); }
      .showcase.pl-sheet .pl-rail .pf-name-row {
        justify-content: flex-start;
        flex-wrap: wrap;
      }
      .showcase.pl-sheet .pl-rail .pl-chips,
      .showcase.pl-sheet .pl-rail .pf-links { justify-content: flex-start; }
      .showcase.pl-sheet .pl-rail .pf-bio,
      .showcase.pl-sheet .pl-rail .pf-sub,
      .showcase.pl-sheet .pl-rail .pf-contact { text-align: left; }
      .showcase.pl-sheet .pl-rail-links { flex-direction: column; gap: 0.55rem; }
      /* Uniform cells in reading order. Squares crop, which is the trade
         a contact sheet makes: comparable cells beat whole images when
         the question is what this person's work looks like as a body. */
      .showcase .sheetgrid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
        gap: 2px;
      }
      .showcase .sheetgrid .card { border-radius: 0; border: 0; }
      .showcase .sheetgrid .card-media {
        aspect-ratio: 1;
        height: auto;
      }
      .showcase .sheetgrid .card-media img,
      .showcase .sheetgrid .card-media video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* ---------------- feature ----------------
         One piece behind the name. Pixel stops on the veil, not
         percentages: the text block is a fixed height and the hero is
         not, so a percentage scrim thins out exactly where the name sits
         on a tall viewport. */
      .showcase.pl-feature .pl-hero {
        position: relative;
        min-height: 68vh;
        justify-content: flex-end;
        padding: 8.5rem 1.5rem 3rem;
        overflow: hidden;
      }
      .showcase .pl-hero-shot {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
      }
      .showcase .pl-hero-veil {
        position: absolute;
        inset: 0;
        z-index: 1;
        background: linear-gradient(
          to top,
          rgba(10, 10, 15, 0.97) 0px,
          rgba(10, 10, 15, 0.9) 200px,
          rgba(10, 10, 15, 0.6) 340px,
          rgba(10, 10, 15, 0.2) 100%
        );
      }
      .showcase .pl-hero-body {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        width: 100%;
      }
      .showcase .pl-hero-name {
        text-shadow: 0 2px 30px rgba(10, 10, 15, 0.65);
      }
      /* Three classes deep on purpose. .showcase .pf-name and
         .showcase .pl-hero-name are the same specificity, and the shared
         stylesheet renders after this one, so a tie went to the smaller
         size every time. Feature gives the name a whole screen to sit on,
         and what reads as a title on a dark page reads as a subtitle on a
         photograph. */
      .showcase.pl-feature .pl-hero .pl-hero-name {
        font-size: clamp(2.6rem, 6.6vw, 5.8rem);
        letter-spacing: -0.045em;
        line-height: 0.92;
      }

      /* Left, not centred. A centred block floating in the middle of a
         full-bleed hero reads as a caption on somebody else's picture;
         anchored to the corner it reads as a title over your own. This is
         the single biggest difference between the layout as drawn and the
         layout as first shipped. */
      .showcase.pl-feature .pl-hero {
        align-items: flex-start;
        text-align: left;
        padding-left: max(1.5rem, calc((100vw - 78rem) / 2));
        padding-right: max(1.5rem, calc((100vw - 78rem) / 2));
      }
      .showcase.pl-feature .pl-hero-body { align-items: flex-start; }
      .showcase.pl-feature .pl-hero .pf-name-row { justify-content: flex-start; }
      .showcase.pl-feature .pl-hero .pl-chips,
      .showcase.pl-feature .pl-hero .pf-links { justify-content: flex-start; }
      .showcase.pl-feature .pl-hero .pf-sub,
      .showcase.pl-feature .pl-hero .pf-bio,
      .showcase.pl-feature .pl-hero .pf-contact { text-align: left; }

      /* Reaching this person is most of what the page is for, and a row
         of 0.78rem monospace text is not a target. The hero has room. */
      .showcase.pl-feature .pl-hero .pf-links {
        gap: 0.5rem;
        font-family: 'Inter', -apple-system, sans-serif;
        font-size: 0.85rem;
        letter-spacing: 0;
      }
      .showcase.pl-feature .pl-hero .pf-links a,
      .showcase.pl-feature .pl-hero .pf-copy {
        padding: 0.6rem 1rem;
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 6px;
        color: var(--stext);
        font-weight: 600;
      }
      .showcase.pl-feature .pl-hero .pf-links a:hover,
      .showcase.pl-feature .pl-hero .pf-copy:hover {
        text-decoration: none;
        border-color: var(--beam);
        color: var(--beam);
      }
      /* The creator's first link is the one they put first. Four
         identical outlines make somebody read all four to find where to
         go; one filled button answers it before they read anything. */
      .showcase.pl-feature .pl-hero .pf-links a:first-child {
        background: var(--stext);
        border-color: var(--stext);
        color: var(--ink, #0a0a0f);
      }
      .showcase.pl-feature .pl-hero .pf-links a:first-child:hover {
        background: var(--beam);
        border-color: var(--beam);
        color: #0a0a0f;
      }

      /* The hero is one composition, so its parts sit closer together
         than the stacked header they inherit from. */
      .showcase.pl-feature .pl-hero { gap: 0.65rem; }
      .showcase.pl-feature .pl-hero-body { gap: 0.65rem; }
      .showcase.pl-feature .pl-hero .pf-links { margin-top: 0.35rem; }

      /* 78rem with a gutter is right for a mixed feed, where the column
         width is a reading measure and the page has other things on it.
         A creator who chose one of these layouts is saying the work is
         the page, and their wall was sitting in a box with 132px of
         nothing down each side of a laptop screen. */
      .showcase.pl-feature .gallery-section,
      .showcase.pl-discipline .gallery-section {
        max-width: none;
        padding: 1.5rem clamp(10px, 1.4vw, 26px) 5rem;
      }

      /* A chosen layout is a creator saying the work should carry the
         page. The card's panel, border, radius and lift are right on a
         mixed feed where each tile is by a different person; on one
         creator's own wall they put a frame around every piece and turn a
         portfolio into a list. The meta row stays, holding the hearts and
         the owner's controls, but it sits on the image instead of adding
         a bar under it. */
      .showcase.pl-feature .card,
      .showcase.pl-sheet .card,
      .showcase.pl-discipline .card {
        background: none;
        border: 0;
        border-radius: 0;
      }
      .showcase.pl-feature .card:hover,
      .showcase.pl-sheet .card:hover,
      .showcase.pl-discipline .card:hover,
      .showcase.pl-feature .card:focus-within,
      .showcase.pl-sheet .card:focus-within,
      .showcase.pl-discipline .card:focus-within {
        transform: none;
        border-color: transparent;
        box-shadow: none;
      }
      .showcase.pl-feature .card-hit,
      .showcase.pl-sheet .card-hit,
      .showcase.pl-discipline .card-hit { border-radius: 0; }

      .showcase.pl-feature .card,
      .showcase.pl-sheet .card,
      .showcase.pl-discipline .card { position: relative; }
      .showcase.pl-feature .card-meta,
      .showcase.pl-sheet .card-meta,
      .showcase.pl-discipline .card-meta {
        position: absolute;
        inset: auto 0 0 0;
        padding: 1.6rem 0.7rem 0.6rem;
        background: linear-gradient(
          to top,
          rgba(6, 6, 10, 0.92) 0px,
          rgba(6, 6, 10, 0.5) 30px,
          transparent 70px
        );
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .showcase.pl-feature .card:hover .card-meta,
      .showcase.pl-sheet .card:hover .card-meta,
      .showcase.pl-discipline .card:hover .card-meta,
      .showcase.pl-feature .card:focus-within .card-meta,
      .showcase.pl-sheet .card:focus-within .card-meta,
      .showcase.pl-discipline .card:focus-within .card-meta { opacity: 1; }

      /* Tighter gutters, now that nothing has a frame to keep apart. */
      .showcase.pl-feature .masonry,
      .showcase.pl-discipline .masonry { gap: 6px; }
      .showcase.pl-feature .masonry-col,
      .showcase.pl-discipline .masonry-col { gap: 6px; }

      /* ---------------- card ----------------
         A single column, because most of these URLs are opened from a
         Discord message on a phone. On a desktop it stays narrow rather
         than stretching: the layout is the creator saying this is a
         calling card, not a wall. */
      .showcase.pl-card .pl-card { padding-bottom: 1.5rem; }
      .showcase.pl-card .pl-card-avatar { width: 96px; height: 96px; border-width: 3px; }
      .showcase.pl-card .gallery-section { max-width: 34rem; }
      .showcase.pl-card .pl-card-links {
        flex-direction: column;
        align-self: stretch;
        gap: 0.5rem;
        max-width: 26rem;
        margin: 0 auto;
        width: 100%;
      }
      .showcase.pl-card .pl-card-links a,
      .showcase.pl-card .pl-card-links .pf-copy {
        display: block;
        width: 100%;
        text-align: center;
        padding: 0.85rem 1rem;
        border: 1px solid var(--edge);
        border-radius: 6px;
        background: var(--panel);
      }
      .showcase.pl-card .pl-card-links a:hover,
      .showcase.pl-card .pl-card-links .pf-copy:hover {
        border-color: var(--beam);
      }

      /* ---------------- discipline ----------------
         Grouped by what it is. Every creation has carried a category
         since the taxonomy shipped, and this is the only layout that
         reads it, which is also the question people arrive with. */
      .showcase.pl-discipline .pl-compact {
        align-items: stretch;
        text-align: left;
        padding-bottom: 1.5rem;
      }
      .showcase .pl-compact-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1.1rem;
      }
      .showcase .pl-compact-id { flex: 1 1 18rem; min-width: 0; }
      .showcase.pl-discipline .pl-compact .pf-name { font-size: clamp(1.7rem, 3vw, 2.6rem); }
      .showcase.pl-discipline .pl-compact .pf-sub,
      .showcase.pl-discipline .pl-compact .pf-bio,
      .showcase.pl-discipline .pl-compact .pf-contact { text-align: left; }
      .showcase.pl-discipline .pl-compact .pf-links { justify-content: flex-start; }
      /* .pf-head centres its children, and .pf-name-row is its own flex
         container, so left-aligning the prose left the name floating in
         the middle of a row that had already gone left. */
      .showcase.pl-discipline .pl-compact .pf-name-row {
        justify-content: flex-start;
        flex-wrap: wrap;
      }

      .showcase .pl-sec { padding-bottom: 1.5rem; }
      .showcase .pl-sec-head {
        display: flex;
        align-items: baseline;
        gap: 0.9rem;
        padding: 1.6rem 0 0.9rem;
      }
      .showcase .pl-sec-head h2 {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 700;
        font-size: clamp(1.1rem, 2vw, 1.6rem);
        letter-spacing: -0.02em;
        margin: 0;
      }
      .showcase .pl-sec-count {
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
        color: var(--stext-dim);
        white-space: nowrap;
      }
      .showcase .pl-sec-bar {
        flex: 1;
        min-width: 2rem;
        height: 3px;
        background: var(--edge);
        position: relative;
      }
      .showcase .pl-sec-bar::after {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: var(--w, 0%);
        background: var(--beam);
      }

      @media (max-width: 860px) {
        /* The rail stops being a rail. A sticky column on a phone is a
           screenful of contact details before any work is visible. */
        .showcase.pl-sheet { grid-template-columns: 1fr; }
        .showcase.pl-sheet .pl-rail {
          position: static;
          max-height: none;
          border-right: 0;
          border-bottom: 1px solid var(--edge);
          padding: 7rem 1.5rem 2rem;
        }
        .showcase .sheetgrid { grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); }
        .showcase.pl-feature .pl-hero { min-height: 60vh; }
      }
    `}</style>
  );
}
