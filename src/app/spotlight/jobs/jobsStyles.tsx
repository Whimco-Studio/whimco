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
      .showcase .jb-list,
      .showcase .jb-foot {
        max-width: 920px;
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

      .showcase .jb-list { display: grid; gap: 0.9rem; padding-bottom: 2.5rem; }
      .showcase .jb-card {
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 14px;
        padding: 1.1rem 1.2rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        min-width: 0;
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .showcase .jb-card:hover {
        transform: translateY(-2px);
        border-color: var(--beam);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--beam-dim);
      }
      .showcase .jb-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      .showcase .jb-what { min-width: 0; }
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
      .showcase .jb-pay { text-align: right; flex-shrink: 0; max-width: 45%; }
      .showcase .jb-pay b {
        display: block;
        font-family: var(--font-mono), monospace;
        font-size: 0.82rem;
        color: var(--stext);
        line-height: 1.4;
      }
      .showcase .jb-pay span {
        font-family: var(--font-mono), monospace;
        font-size: 0.56rem;
        letter-spacing: 0.1em;
        color: var(--beam);
        font-variant-numeric: tabular-nums;
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

      .showcase .jb-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
        flex-wrap: wrap;
        border-top: 1px solid var(--edge);
        padding-top: 0.8rem;
      }
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
      .showcase .jb-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
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
      .showcase .jb-btn-ghost { background: transparent; color: var(--beam); border-color: var(--beam-dim); }

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
        .showcase .jb-top { flex-direction: column; }
        .showcase .jb-pay { text-align: left; max-width: none; }
        .showcase .jb-sort { margin-left: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .showcase .jb-card, .showcase .jb-chip { transition: none; }
        .showcase .jb-card:hover { transform: none; }
      }
    `}</style>
  );
}
