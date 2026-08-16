/** Styles for the creator directory. Kept beside ShowcaseStyles rather
    than inside it so the showcase and portfolio pages do not ship rules
    for a grid they never render. Relies on the `.showcase` theme vars. */
export default function CreatorsStyles() {
  return (
    <style jsx global>{`
      .showcase .cr-head {
        text-align: center;
        padding: 3rem 1.5rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.9rem;
      }
      .showcase .cr-title {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(2rem, 5.5vw, 3.6rem);
        letter-spacing: 0.04em;
        margin: 0;
      }
      .showcase .cr-sub {
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
        margin: 0;
      }
      .showcase .cr-sub b { color: var(--beam); font-weight: 700; }

      .showcase .cr-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 1.1rem;
        padding: 0 1.5rem 3rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .showcase .cr-card {
        display: block;
        text-decoration: none;
        color: inherit;
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 14px;
        overflow: hidden;
        transition: transform 0.18s ease, border-color 0.18s ease,
          box-shadow 0.18s ease;
      }
      .showcase .cr-card:hover,
      .showcase .cr-card:focus-visible {
        transform: translateY(-3px);
        border-color: var(--beam);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
          0 0 0 1px var(--beam-dim);
      }

      /* Cover mosaic: one hero when that is all they have, otherwise a
         hero plus a stacked column, so a 3-up never looks like a filmstrip. */
      .showcase .cr-cover {
        display: grid;
        gap: 2px;
        height: 150px;
        background: #0d0d14;
      }
      .showcase .cr-cover-1 { grid-template-columns: 1fr; }
      .showcase .cr-cover-2 { grid-template-columns: 1fr 1fr; }
      .showcase .cr-cover-3 {
        grid-template-columns: 2fr 1fr;
        grid-template-rows: 1fr 1fr;
      }
      .showcase .cr-cover-3 img:first-child { grid-row: span 2; }
      .showcase .cr-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .showcase .cr-cover-empty {
        background:
          repeating-linear-gradient(
            45deg, transparent, transparent 10px,
            rgba(255, 255, 255, 0.02) 10px, rgba(255, 255, 255, 0.02) 20px
          ),
          #0d0d14;
      }

      .showcase .cr-body {
        padding: 0.85rem 0.95rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .showcase .cr-identity {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
      }
      .showcase .cr-avatar,
      .showcase .cr-monogram {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .showcase .cr-avatar { border: 1px solid var(--beam); }
      .showcase .cr-monogram {
        display: grid;
        place-items: center;
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--beam);
        border: 1px solid var(--beam-dim);
        background: rgba(255, 217, 138, 0.06);
      }
      .showcase .cr-name {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 700;
        font-size: 0.98rem;
        /* Names are unbounded user input, so clip rather than let a long
           one wrap and desynchronise card heights across the grid. */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
      /* Larger than the name it follows: 2 of 36 cards carry one, so at
         name-size it reads as punctuation rather than a mark. */
      .showcase .cr-seal {
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      .showcase .cr-stats {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        color: var(--stext-dim);
        margin: 0;
      }
      .showcase .cr-stats b { color: var(--beam); font-weight: 700; }

      /* The discipline row is the feed's chip row, which is built to scroll
         full bleed. Here it sits inside a centred header instead. */
      .showcase .cr-head .chips {
        justify-content: center;
        flex-wrap: wrap;
        max-width: 900px;
        padding: 0;
      }

      .showcase .cr-spec {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        letter-spacing: 0.08em;
        color: var(--stext-dim);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.45rem;
        flex-wrap: wrap;
      }
      .showcase .cr-spec b { color: var(--stext); font-weight: 700; }
      .showcase .cr-spec-strong b { color: var(--beam); }
      .showcase .cr-spec-tag {
        font-size: 0.55rem;
        letter-spacing: 0.16em;
        color: var(--beam);
        border: 1px solid var(--beam-dim);
        border-radius: 999px;
        padding: 0.1rem 0.45rem;
      }

      /* Two lines, because the cards are a grid and an unbounded bio would
         desynchronise their heights the way an unclipped name would. */
      .showcase .cr-bio {
        font-size: 0.76rem;
        line-height: 1.5;
        color: var(--stext);
        opacity: 0.75;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .showcase .cr-contact {
        font-family: var(--font-mono), monospace;
        font-size: 0.62rem;
        letter-spacing: 0.06em;
        color: var(--stext-dim);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .showcase .cr-empty {
        text-align: center;
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
        padding: 2rem 1.5rem 4rem;
      }

      .showcase .cr-more {
        display: flex;
        justify-content: center;
        padding: 0 1.5rem 4rem;
      }
      .showcase .cr-more button {
        font-family: var(--font-mono), monospace;
        font-size: 0.7rem;
        letter-spacing: 0.2em;
        color: var(--beam);
        background: transparent;
        border: 1px solid var(--beam);
        border-radius: 999px;
        padding: 0.75rem 1.8rem;
        cursor: pointer;
        transition: background 0.18s ease;
      }
      .showcase .cr-more button:hover:not(:disabled) {
        background: var(--beam-dim);
      }
      .showcase .cr-more button:disabled {
        opacity: 0.5;
        cursor: default;
      }

      @media (prefers-reduced-motion: reduce) {
        .showcase .cr-card { transition: none; }
        .showcase .cr-card:hover,
        .showcase .cr-card:focus-visible { transform: none; }
      }
    `}</style>
  );
}
