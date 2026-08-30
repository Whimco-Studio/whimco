'use client';

/** Styles for /spotlight/feed, the live timeline. Kept beside
    browseStyles and creatorsStyles rather than folded into styles.tsx:
    this page renders a single column of posts, not a masonry of cards,
    and the two share tokens but no layout.

    Namespaced under .feedpage for the same reason .showcase is: the
    lightbox and the cards render from a client child, so the rules
    cannot be scoped by the component that owns them. */
export default function FeedStyles() {
  return (
    <style jsx global>{`
      .feedpage {
        --stage: #0a0a0f;
        --panel: #14141d;
        --edge: rgba(255, 255, 255, 0.07);
        --blurple: #5865f2;
        --beam: #ffd98a;
        --beam-dim: rgba(255, 217, 138, 0.14);
        --stext: #f4f5fa;
        --stext-dim: #9ba0b4;
        --heart: #ed4245;
        min-height: 100vh;
        background:
          radial-gradient(ellipse 90% 45% at 50% 0%, rgba(88, 101, 242, 0.10) 0%, transparent 60%),
          var(--stage);
        color: var(--stext);
        font-family: 'Inter', -apple-system, sans-serif;
      }
      .feedpage .wrap { max-width: 660px; margin: 0 auto; padding: 0 1rem 4rem; }

      /* ------------------------------------------------ masthead */
      .feedpage .masthead { padding: 7.5rem 0 1.2rem; }
      .feedpage .eyebrow {
        font-family: var(--font-mono), monospace;
        font-size: 0.66rem;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--beam);
        display: flex;
        align-items: center;
        gap: 0.6em;
        margin: 0 0 0.5rem;
      }
      .feedpage .live-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--beam); box-shadow: 0 0 8px var(--beam);
        animation: feedPulse 2.4s ease-in-out infinite;
      }
      .feedpage .live-dot.stale {
        background: #e0574a; box-shadow: 0 0 8px #e0574a; animation: none;
      }
      @keyframes feedPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      @media (prefers-reduced-motion: reduce) {
        .feedpage .live-dot { animation: none; }
      }
      .feedpage h1 {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(2rem, 5vw, 2.9rem);
        letter-spacing: -0.02em;
        line-height: 1.02;
        margin: 0 0 0.5rem;
      }
      .feedpage .beamed {
        background: linear-gradient(100deg, #fff2d4 0%, var(--beam) 45%, #d9a94f 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .feedpage .sub {
        color: var(--stext-dim);
        font-size: 0.92rem;
        line-height: 1.6;
        margin: 0;
        max-width: 34rem;
      }
      .feedpage .sub a { color: var(--beam); text-decoration: none; }
      .feedpage .sub a:hover { text-decoration: underline; }

      /* ------------------------------------------------- controls */
      .feedpage .bar {
        position: sticky; top: 0; z-index: 20;
        background: rgba(10, 10, 15, 0.82);
        backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--edge);
        margin: 0 -1rem; padding: 0.85rem 1rem 0;
      }
      .feedpage .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .feedpage input, .feedpage select {
        font-family: var(--font-mono), monospace;
        font-size: 0.75rem;
        background: var(--panel); color: var(--stext);
        border: 1px solid var(--edge); border-radius: 999px;
        padding: 0.42rem 0.9rem; outline: none;
        transition: border-color 0.15s ease;
      }
      .feedpage input { flex: 1; min-width: 170px; }
      .feedpage input::placeholder { color: #5f6478; }
      .feedpage input:focus, .feedpage select:focus { border-color: var(--beam-dim); }
      .feedpage select { cursor: pointer; }
      .feedpage .chip {
        font-family: var(--font-mono), monospace;
        font-size: 0.75rem; color: var(--stext-dim);
        background: var(--panel); border: 1px solid var(--edge);
        border-radius: 999px; padding: 0.42rem 0.9rem;
        cursor: pointer; white-space: nowrap;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .feedpage .chip:hover { color: var(--stext); }
      .feedpage .chip-on {
        color: #1a1204; background: var(--beam);
        border-color: var(--beam); font-weight: 700;
      }
      .feedpage .tabs { display: flex; gap: 1.6rem; padding: 0.8rem 0 0; }
      .feedpage .tab {
        font-family: var(--font-mono), monospace;
        font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase;
        color: var(--stext-dim); background: none; border: none;
        cursor: pointer; padding: 0 0 0.55rem; position: relative;
        transition: color 0.15s ease;
      }
      .feedpage .tab:hover { color: var(--stext); }
      .feedpage .tab-on { color: var(--beam); }
      .feedpage .tab-on::after {
        content: ''; position: absolute; left: 0; right: 0; bottom: -1px;
        height: 2px; border-radius: 2px; background: var(--beam);
        box-shadow: 0 0 10px var(--beam-dim);
      }
      .feedpage .count {
        font-family: var(--font-mono), monospace;
        font-size: 0.66rem; color: var(--stext-dim);
        margin-left: auto; align-self: center; padding-bottom: 0.55rem;
        white-space: nowrap;
      }

      /* ---------------------------------------------------- posts */
      .feedpage .stream {
        display: flex; flex-direction: column; gap: 0.9rem; padding-top: 1.1rem;
      }
      .feedpage .post {
        display: flex; gap: 0.85rem;
        padding: 0.95rem 1rem 1rem;
        background: var(--panel); border: 1px solid var(--edge);
        border-radius: 14px;
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .feedpage .post:hover, .feedpage .post:focus-within {
        transform: translateY(-3px);
        border-color: rgba(255, 217, 138, 0.35);
        box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5), 0 0 22px rgba(255, 217, 138, 0.08);
      }
      .feedpage .av {
        width: 38px; height: 38px; flex: 0 0 38px; border-radius: 50%;
        display: grid; place-items: center;
        font-family: var(--font-display), sans-serif;
        font-weight: 700; font-size: 15px; color: #0a0a0f;
        text-decoration: none;
      }
      .feedpage .body { flex: 1; min-width: 0; }
      .feedpage .line {
        display: flex; align-items: baseline; gap: 0.4rem; flex-wrap: wrap;
      }
      .feedpage .name {
        font-family: var(--font-display), sans-serif;
        font-weight: 700; font-size: 0.92rem; letter-spacing: -0.01em;
        color: var(--stext); text-decoration: none;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 15rem;
      }
      .feedpage .name:hover { color: var(--beam); }
      /* Shared verified seal. Its rules live under .showcase, which does
         not wrap this page, so the three that matter are repeated here.
         Sized in rem rather than the 1em it would inherit: the mark draws
         at 0.62em of its own font-size, so inheriting the 0.68rem meta
         text would render it at about 7px. 1.35rem puts it a shade taller
         than the name beside it, which is where a badge wants to sit. */
      .feedpage .sl-seal {
        display: inline-flex;
        align-items: center;
        line-height: 0;
        color: var(--beam);
        font-size: 1.35rem;
        align-self: center;
        flex-shrink: 0;
      }
      .feedpage .sl-seal svg {
        width: 0.62em;
        height: 0.62em;
        display: block;
        filter: drop-shadow(0 0 0.14em rgba(255, 217, 138, 0.4));
      }
      .feedpage .handle, .feedpage .time {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem; color: var(--stext-dim);
      }
      .feedpage .caption {
        margin: 0.4rem 0 0; font-size: 0.86rem; line-height: 1.55;
        white-space: pre-wrap; word-wrap: break-word;
      }

      .feedpage .media {
        margin-top: 0.7rem; border-radius: 12px; overflow: hidden;
        border: 1px solid var(--edge); display: grid; gap: 2px; background: #08080c;
      }
      .feedpage .media.n1 { grid-template-columns: 1fr; }
      .feedpage .media.n2 { grid-template-columns: 1fr 1fr; }
      .feedpage .media.n3, .feedpage .media.n4 {
        grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
      }
      .feedpage .media.n3 .cell:first-child { grid-row: span 2; }
      .feedpage .cell {
        position: relative; background: #08080c; overflow: hidden;
        min-height: 0; padding: 0; border: none;
      }
      .feedpage .media.n1 .cell { max-height: 520px; }
      .feedpage .media:not(.n1) .cell { aspect-ratio: 1 / 1; }
      .feedpage .cell img, .feedpage .cell video {
        width: 100%; height: 100%; object-fit: cover; display: block;
      }
      .feedpage .media.n1 .cell img { object-fit: contain; max-height: 520px; }
      .feedpage button.cell { cursor: zoom-in; }
      .feedpage button.cell img { transition: transform 0.3s ease; }
      .feedpage .post:hover button.cell img { transform: scale(1.02); }
      .feedpage .badge {
        position: absolute; right: 8px; bottom: 8px;
        font-family: var(--font-mono), monospace; font-size: 0.62rem;
        background: rgba(0, 0, 0, 0.65); color: #fff;
        border-radius: 6px; padding: 3px 7px; pointer-events: none;
      }
      .feedpage .dead {
        display: grid; place-items: center; height: 100%;
        font-family: var(--font-mono), monospace;
        font-size: 0.62rem; color: var(--stext-dim);
      }

      .feedpage .foot {
        display: flex; align-items: center; gap: 0.9rem; margin-top: 0.65rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem; color: var(--stext-dim);
      }
      .feedpage .hearts { color: var(--heart); font-weight: 600; }
      .feedpage .tag { color: var(--beam); font-size: 0.65rem; }
      .feedpage .cat {
        margin-left: auto; font-size: 0.62rem; letter-spacing: 0.1em;
        text-transform: uppercase; color: var(--stext-dim);
        border: 1px solid var(--edge); border-radius: 999px; padding: 0.15rem 0.55rem;
      }
      .feedpage .xlink { color: var(--stext-dim); text-decoration: none; }
      .feedpage .xlink:hover { color: var(--beam); }

      .feedpage .note {
        padding: 2.4rem 0; text-align: center;
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem; color: var(--stext-dim);
      }
      .feedpage .more {
        display: block; width: 100%; margin-top: 1.2rem; padding: 0.8rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase;
        background: var(--panel); color: var(--stext-dim);
        border: 1px solid var(--edge); border-radius: 999px; cursor: pointer;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .feedpage .more:hover { color: var(--beam); border-color: var(--beam-dim); }
      .feedpage .more:disabled { opacity: 0.5; cursor: default; }

      .feedpage .fresh { animation: feedFlash 1.8s ease-out; }
      @keyframes feedFlash {
        from { border-color: var(--beam); box-shadow: 0 0 26px rgba(255, 217, 138, 0.22); }
        to { border-color: var(--edge); box-shadow: none; }
      }

      /* ------------------------------------------------ share */
      .feedpage .share-btn {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        color: var(--stext-dim);
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: color 0.15s ease;
      }
      .feedpage .share-btn:hover { color: var(--beam); }
      .feedpage .share-on { color: var(--beam); }

      /* -------------------------------------------- permalink */
      .feedpage .permalink-head { padding-bottom: 1.4rem; }
      .feedpage .permalink-head h1 {
        display: flex;
        align-items: center;
        gap: 0.1em;
        margin-bottom: 0.35rem;
      }
      .feedpage a.permalink-author { color: var(--stext); text-decoration: none; }
      .feedpage a.permalink-author:hover { color: var(--beam); }
      .feedpage .permalink {
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 14px;
        padding: 1rem;
      }
      /* One column, not the timeline's 2x2. A permalink is reached by
         someone who wants to look at this creation, so every attachment
         gets full width rather than a quarter of a square. */
      .feedpage .permalink-media {
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--edge);
        background: #08080c;
      }
      .feedpage .permalink-media img,
      .feedpage .permalink-media video {
        width: 100%;
        max-height: 76vh;
        object-fit: contain;
        display: block;
        background: #08080c;
      }
      .feedpage .permalink-caption {
        margin: 0.9rem 0 0;
        font-size: 0.95rem;
        line-height: 1.6;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .feedpage .permalink-foot { margin-top: 0.9rem; }
      .feedpage .permalink-share { margin-left: auto; }
      .feedpage .note a { color: var(--beam); text-decoration: none; }
      .feedpage .note a:hover { text-decoration: underline; }

      .feedpage .lightbox {
        position: fixed; inset: 0; z-index: 60;
        background: rgba(5, 5, 9, 0.94); backdrop-filter: blur(6px);
        display: grid; place-items: center; padding: 2rem;
        border: none; cursor: zoom-out; width: 100%;
      }
      .feedpage .lightbox img {
        max-width: 100%; max-height: 100%; object-fit: contain;
        border-radius: 12px; box-shadow: 0 24px 70px rgba(0, 0, 0, 0.7);
      }
    `}</style>
  );
}
