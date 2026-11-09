'use client';

/** Styles for the jobs demo. Same theme vars and type as the network
    directory (`.showcase`): display face for names, mono for everything
    that reads as data, gold `--beam` for what matters. */
export default function JobsStyles() {
  return (
    <style jsx global>{`
      .showcase .jb-head {
        text-align: center;
        padding: 3rem 1.5rem 1.2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.9rem;
      }
      .showcase .jb-demo {
        font-family: var(--font-mono), monospace;
        font-size: 0.55rem;
        letter-spacing: 0.16em;
        color: var(--beam);
        border: 1px dashed var(--beam);
        border-radius: 999px;
        padding: 0.3rem 0.7rem;
      }
      .showcase .jb-h1 {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(2rem, 5.5vw, 3.6rem);
        letter-spacing: 0.04em;
        margin: 0;
      }
      .showcase .jb-sub {
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        color: var(--stext-dim);
        margin: 0;
        max-width: 52ch;
        line-height: 1.7;
      }

      .showcase .jb-rail {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.8rem 2.6rem;
        padding: 0.6rem 1.5rem 2rem;
      }
      .showcase .jb-stat { text-align: center; }
      .showcase .jb-stat b {
        display: block;
        font-family: var(--font-display), 'Inter', sans-serif;
        font-size: 1.7rem;
        font-weight: 800;
        color: var(--beam);
        font-variant-numeric: tabular-nums;
      }
      .showcase .jb-stat span {
        font-family: var(--font-mono), monospace;
        font-size: 0.62rem;
        letter-spacing: 0.18em;
        color: var(--stext-dim);
      }

      .showcase .jb-bar,
      .showcase .jb-foot {
        max-width: 1400px;
        margin: 0 auto;
        padding-left: max(1.5rem, env(safe-area-inset-left, 0px));
        padding-right: max(1.5rem, env(safe-area-inset-right, 0px));
      }
      .showcase .jb-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.8rem;
        padding-bottom: 1.1rem;
      }
      .showcase .jb-filters { display: flex; flex-wrap: wrap; gap: 0.45rem; flex: 1; }
      .showcase .jb-chip {
        font-family: var(--font-mono), monospace;
        font-size: 0.6rem;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 999px;
        padding: 0.45rem 0.75rem;
        cursor: pointer;
        transition: border-color 0.18s ease, color 0.18s ease;
      }
      .showcase .jb-chip small { opacity: 0.6; margin-left: 0.25rem; }
      .showcase .jb-chip:hover { color: var(--stext); border-color: var(--beam-dim); }
      .showcase .jb-chip[aria-pressed='true'] {
        color: #14141d;
        background: var(--beam);
        border-color: var(--beam);
      }
      .showcase .jb-chip:focus-visible,
      .showcase .jb-sort select:focus-visible {
        outline: 2px solid var(--beam);
        outline-offset: 2px;
      }
      .showcase .jb-sort {
        font-family: var(--font-mono), monospace;
        font-size: 0.6rem;
        letter-spacing: 0.16em;
        color: var(--stext-dim);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .showcase .jb-sort select {
        font-family: var(--font-mono), monospace;
        font-size: 0.7rem;
        color: var(--stext);
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 8px;
        padding: 0.35rem 0.5rem;
      }

      .showcase .jb-role {
        font-family: var(--font-mono), monospace;
        font-size: 0.58rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--beam);
      }
      .showcase .jb-title {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 700;
        font-size: 1.12rem;
        line-height: 1.3;
        margin: 0.3rem 0 0;
        color: var(--stext);
        text-wrap: balance;
      }
      .showcase .jb-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem 1.1rem;
        margin: 0;
        font-family: var(--font-mono), monospace;
        font-size: 0.58rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
      }
      .showcase .jb-strong { color: var(--stext); }
      .showcase .jb-notes { display: flex; flex-wrap: wrap; gap: 0.4rem; }
      .showcase .jb-note {
        font-family: var(--font-mono), monospace;
        font-size: 0.6rem;
        letter-spacing: 0.04em;
        color: var(--stext-dim);
        border: 1px solid var(--edge);
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        padding: 0.25rem 0.5rem;
      }
      .showcase .jb-note-warn { color: var(--beam); border-color: var(--beam-dim); background: rgba(255, 217, 138, 0.06); }
      .showcase .jb-note-flag { color: #ff8a80; border-color: rgba(237, 66, 69, 0.35); background: rgba(237, 66, 69, 0.08); }

      .showcase .jb-status {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.58rem;
        letter-spacing: 0.14em;
        color: var(--stext-dim);
      }
      .showcase .jb-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--stext-dim); }
      .showcase .jb-live { color: var(--stext); }
      .showcase .jb-live .jb-dot { background: #3ba55c; }
      .showcase .jb-btn {
        font-family: var(--font-mono), monospace;
        font-size: 0.58rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        color: #14141d;
        background: var(--beam);
        border: 1px solid var(--beam);
        border-radius: 999px;
        padding: 0.5rem 1.05rem;
        cursor: not-allowed;
      }

      /* Layout C: tiles on the Network page's grid, pay as the headline. */
      .showcase .jb-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.1rem;
        max-width: 1400px;
        margin: 0 auto;
        padding-left: max(1.5rem, env(safe-area-inset-left, 0px));
        padding-right: max(1.5rem, env(safe-area-inset-right, 0px));
        padding-bottom: 2.5rem;
      }
      .showcase .jb-tile {
        position: relative;
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 14px;
        overflow: hidden;
        padding: 1rem 1rem 1.05rem;
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
        min-width: 0;
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .showcase .jb-tile:hover {
        transform: translateY(-3px);
        border-color: var(--beam);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--beam-dim);
      }
      .showcase .jb-glow {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 160px;
        height: 160px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 217, 138, 0.16), transparent 70%);
        pointer-events: none;
      }
      /* Everything but the glow sits in flow; the glow floats behind. */
      .showcase .jb-tile > :not(.jb-glow) { position: relative; }
      .showcase .jb-tile-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }
      .showcase .jb-big {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(1.6rem, 2.4vw, 2.1rem);
        line-height: 1;
        color: var(--beam);
        font-variant-numeric: tabular-nums;
      }
      .showcase .jb-big small {
        display: block;
        margin-top: 0.4rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.56rem;
        font-weight: 500;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
        overflow-wrap: anywhere;
      }
      .showcase .jb-big small.jb-conv {
        color: var(--beam);
        opacity: 0.85;
        margin-top: 0.45rem;
      }
      .showcase .jb-big small.jb-conv + small { margin-top: 0.2rem; }
      .showcase .jb-tile .jb-title { font-size: 1rem; margin: 0; }
      .showcase .jb-tile .jb-meta { margin-top: auto; }
      .showcase .jb-tile .jb-btn { align-self: flex-start; }

      /* Reference image from the post: full bleed across the top of the tile. */
      .showcase .jb-shot {
        margin: -1rem -1rem 0.1rem;
        aspect-ratio: 16 / 9;
        max-width: calc(100% + 2rem);
        overflow: hidden;
        border-bottom: 1px solid var(--edge);
        background: #0f0f16;
      }
      .showcase .jb-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
      /* No reference image: the role, set large and faint on a hatch, so
         the slot reads as intentional rather than broken. */
      .showcase .jb-shot-empty {
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at 70% 20%, rgba(255, 217, 138, 0.08), transparent 60%),
          repeating-linear-gradient(135deg, #12121a 0 10px, #0f0f16 10px 20px);
      }
      .showcase .jb-shot-empty span {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: 1.5rem;
        letter-spacing: 0.08em;
        color: rgba(255, 217, 138, 0.16);
      }
      .showcase .jb-shot-count {
        position: absolute;
        top: 0.6rem;
        left: 0.6rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.58rem;
        letter-spacing: 0.1em;
        color: var(--stext);
        background: rgba(10, 10, 15, 0.75);
        border: 1px solid var(--edge);
        border-radius: 999px;
        padding: 0.2rem 0.5rem;
      }
      /* Who posted it, and only facts about them. */
      .showcase .jb-hirer {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 0.65rem;
        border: 1px solid var(--edge);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
        min-width: 0;
        flex-wrap: wrap;
      }
      .showcase .jb-ava {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        flex-shrink: 0;
        object-fit: cover;
        border: 1px solid var(--beam-dim);
      }
      .showcase .jb-ava-empty {
        display: grid;
        place-items: center;
        font-family: var(--font-mono), monospace;
        font-size: 0.7rem;
        color: var(--beam);
      }
      .showcase .jb-hirer-text { min-width: 0; flex: 1; display: grid; gap: 0.1rem; }
      .showcase .jb-hirer-text b {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--stext);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .showcase .jb-hirer-text span {
        font-family: var(--font-mono), monospace;
        font-size: 0.5rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
      }

      .showcase .jb-foot {
        padding-bottom: 4rem;
        display: grid;
        gap: 0.5rem;
      }
      .showcase .jb-foot p {
        font-family: var(--font-mono), monospace;
        font-size: 0.62rem;
        letter-spacing: 0.05em;
        line-height: 1.7;
        color: var(--stext-dim);
        margin: 0;
        max-width: 70ch;
      }

      @media (max-width: 600px) {
        .showcase .jb-sort { margin-left: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .showcase .jb-tile, .showcase .jb-chip { transition: none; }
        .showcase .jb-tile:hover { transform: none; }
      }
    `}</style>
  );
}
