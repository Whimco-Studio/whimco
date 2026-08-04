'use client';

/** Styles for the server directory. Kept beside NetworkDirectory rather
    than inside ShowcaseStyles so the showcase and creator pages do not
    ship rules for a grid they never render. Relies on the `.showcase`
    theme vars. Marked 'use client' itself, unlike creatorsStyles: this is
    the first `<style jsx>` block ever rendered from a Server Component in
    this app, and styled-jsx's registry needs a client boundary somewhere
    in the tree to attach to. NetworkDirectory stays a Server Component;
    this one leaf opts in so the rest of it does not have to. */
export default function NetworkStyles() {
  return (
    <style jsx global>{`
      .showcase .nt-head {
        text-align: center;
        padding: 3rem 1.5rem 1.4rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.9rem;
      }
      .showcase .nt-title {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(2rem, 5.5vw, 3.6rem);
        letter-spacing: 0.04em;
        margin: 0;
      }
      .showcase .nt-sub {
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
        margin: 0;
        max-width: 46ch;
        line-height: 1.7;
      }

      /* Two numbers that only make sense together: how many communities,
         and how many people that reaches. */
      .showcase .nt-rail {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0 2.6rem;
        padding: 0.6rem 1.5rem 2.4rem;
      }
      .showcase .nt-stat { text-align: center; }
      .showcase .nt-stat b {
        display: block;
        font-family: var(--font-display), 'Inter', sans-serif;
        font-size: 1.7rem;
        font-weight: 800;
        color: var(--beam);
        letter-spacing: 0.02em;
      }
      .showcase .nt-stat span {
        font-family: var(--font-mono), monospace;
        font-size: 0.62rem;
        letter-spacing: 0.18em;
        color: var(--stext-dim);
      }

      .showcase .nt-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 1.1rem;
        padding: 0 1.5rem 4rem;
        max-width: 1400px;
        margin: 0 auto;
      }
      .showcase .nt-empty-wrap {
        padding: 0 1.5rem 4rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .showcase .nt-card {
        position: relative;
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 14px;
        overflow: hidden;
        padding: 1rem 0.95rem 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        transition: transform 0.18s ease, border-color 0.18s ease,
          box-shadow 0.18s ease;
      }
      .showcase .nt-card:hover {
        transform: translateY(-3px);
        border-color: var(--beam);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--beam-dim);
      }

      /* The server's own icon, blurred, so each card takes its colour
         from real data instead of a decorative gradient. */
      .showcase .nt-wash {
        position: absolute;
        inset: -40% -40% auto -40%;
        height: 150%;
        background-size: cover;
        background-position: center;
        filter: blur(34px) saturate(1.5);
        opacity: 0.3;
        pointer-events: none;
      }
      .showcase .nt-wash-empty { background: none; opacity: 0; }
      .showcase .nt-card::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg, rgba(20, 20, 29, 0.55) 0%, rgba(20, 20, 29, 0.94) 62%
        );
        pointer-events: none;
      }
      .showcase .nt-identity,
      .showcase .nt-body { position: relative; z-index: 1; }

      .showcase .nt-identity {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        min-width: 0;
      }
      .showcase .nt-icon {
        width: 42px;
        height: 42px;
        border-radius: 13px;
        flex-shrink: 0;
        object-fit: cover;
        border: 1px solid var(--beam-dim);
      }
      /* Layered on top of .nt-icon or .nt-hero-icon rather than sizing
         itself, so one monogram works at both card and hero scale. */
      .showcase .nt-monogram {
        display: grid;
        place-items: center;
        font-family: var(--font-mono), monospace;
        font-size: 1rem;
        font-weight: 700;
        color: var(--beam);
        background: rgba(255, 217, 138, 0.07);
      }
      .showcase .nt-id { min-width: 0; }
      .showcase .nt-name {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        margin: 0;
        /* Server names are unbounded and some are decorative unicode, so
           clip rather than let one wrap and desynchronise card heights. */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .showcase .nt-meta {
        font-family: var(--font-mono), monospace;
        font-size: 0.6rem;
        letter-spacing: 0.09em;
        color: var(--stext-dim);
        margin: 0.18rem 0 0;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
      .showcase .nt-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #3ba55c;
        flex-shrink: 0;
      }

      .showcase .nt-body {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .showcase .nt-count {
        font-family: var(--font-mono), monospace;
        font-size: 0.66rem;
        letter-spacing: 0.07em;
        color: var(--stext-dim);
        margin: 0;
      }
      .showcase .nt-count b {
        color: var(--stext);
        font-size: 0.94rem;
        font-weight: 700;
        letter-spacing: 0;
      }

      .showcase .nt-badge {
        display: inline-block;
        font-family: var(--font-mono), monospace;
        font-size: 0.55rem;
        letter-spacing: 0.11em;
        text-transform: uppercase;
        color: var(--beam);
        border: 1px solid var(--beam-dim);
        background: rgba(255, 217, 138, 0.07);
        border-radius: 999px;
        padding: 0.25rem 0.55rem;
        white-space: nowrap;
      }

      /* The support server: full width, permanently lit, never just
         another tile in the grid. */
      .showcase .nt-hero {
        grid-column: 1 / -1;
        flex-direction: row;
        align-items: center;
        gap: 1.3rem;
        padding: 1.5rem 1.6rem;
        border-color: var(--beam);
        box-shadow: 0 0 0 1px var(--beam-dim), 0 14px 40px rgba(0, 0, 0, 0.45);
      }
      .showcase .nt-hero:hover { transform: none; }
      .showcase .nt-hero .nt-wash { opacity: 0.42; }
      .showcase .nt-hero-icon {
        position: relative;
        z-index: 1;
        width: 64px;
        height: 64px;
        border-radius: 18px;
        flex-shrink: 0;
        object-fit: cover;
        border: 1px solid var(--beam);
      }
      .showcase .nt-hero-text { position: relative; z-index: 1; flex: 1; min-width: 0; }
      .showcase .nt-hero-name {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: 1.35rem;
        margin: 0.3rem 0 0.25rem;
      }
      .showcase .nt-hero-copy {
        font-family: var(--font-mono), monospace;
        font-size: 0.66rem;
        letter-spacing: 0.06em;
        line-height: 1.7;
        color: var(--stext-dim);
        margin: 0;
        max-width: 52ch;
      }
      .showcase .nt-hero-stat {
        position: relative;
        z-index: 1;
        font-family: var(--font-mono), monospace;
        font-size: 0.64rem;
        letter-spacing: 0.07em;
        color: var(--stext-dim);
        margin: 0;
        text-align: right;
        flex-shrink: 0;
      }
      .showcase .nt-hero-stat b {
        color: var(--beam);
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0;
      }
      .showcase .nt-hero-stat span { font-size: 0.6rem; }

      @media (max-width: 560px) {
        .showcase .nt-hero { flex-direction: column; align-items: flex-start; }
        .showcase .nt-hero-stat { text-align: left; }
      }

      @media (prefers-reduced-motion: reduce) {
        .showcase .nt-card { transition: none; }
        .showcase .nt-card:hover,
        .showcase .nt-hero:hover { transform: none; }
      }
    `}</style>
  );
}
