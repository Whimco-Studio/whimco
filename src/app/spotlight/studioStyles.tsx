'use client';

/* Header chrome for a server's page.

   Only the header. The grid below is GalleryGrid under the shared
   .showcase rules, untouched: a server's gallery and a creator's gallery
   are the same object with a different subject. The one thing this page
   has that a portfolio does not is the roster, so that is where the
   weight goes. */
export default function StudioStyles() {
  return (
    <style jsx global>{`
      .studiohead {
        --beam: #ffd98a;
        --edge: rgba(255, 255, 255, 0.07);
        --panel: #14141d;
        --stext: #f4f5fa;
        --stext-dim: #9ba0b4;
        --live: #3ba55d;
        position: relative;
        font-family: 'Inter', -apple-system, sans-serif;
        color: var(--stext);
      }

      .studiohead .st-band { position: relative; overflow: hidden; }
      /* The server's own icon, blown up and washed back, so each page
         carries its own colour without a hero image nobody uploaded. */
      .studiohead .st-bg {
        position: absolute;
        inset: -20% -5%;
        background-size: cover;
        background-position: center;
        opacity: 0.16;
        filter: saturate(0.8) blur(42px);
      }
      .studiohead .st-bg::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg, rgba(10, 10, 15, 0.45) 0%, rgba(10, 10, 15, 0.8) 60%, #0a0a0f 100%
        );
      }
      .studiohead .st-wrap {
        position: relative;
        max-width: 1240px;
        margin: 0 auto;
        padding: 6.5rem 2rem 0;
      }
      .studiohead .st-row {
        display: flex;
        gap: 1.4rem;
        align-items: center;
        padding-bottom: 1.6rem;
      }
      .studiohead .st-icon {
        width: 104px;
        height: 104px;
        border-radius: 28px;
        border: 1px solid var(--edge);
        box-shadow: 0 16px 44px rgba(0, 0, 0, 0.6);
        flex-shrink: 0;
        background: var(--panel);
        object-fit: cover;
      }
      .studiohead .st-monogram {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display), 'Inter', sans-serif;
        font-size: 2.6rem;
        font-weight: 800;
        color: var(--beam);
      }
      .studiohead .st-titles { min-width: 0; flex: 1; }
      .studiohead .st-name {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-size: clamp(1.8rem, 3.6vw, 2.6rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.08;
        margin: 0 0 0.5rem;
      }
      .studiohead .st-facts {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.55rem 0.9rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
        color: var(--stext-dim);
        margin: 0 0 0.45rem;
      }
      .studiohead .st-facts b { color: var(--stext); font-weight: 500; }
      .studiohead .st-sep { opacity: 0.4; }
      .studiohead .st-live { color: var(--live); display: inline-flex; align-items: center; gap: 0.45em; }
      .studiohead .st-live b { color: var(--live); }
      .studiohead .st-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--live); box-shadow: 0 0 7px var(--live);
      }
      .studiohead .st-work {
        font-size: 0.95rem;
        color: var(--stext-dim);
        margin: 0;
      }
      .studiohead .st-work b { color: var(--stext); font-weight: 600; }

      /* ---------------------------- roster ---------------------- */
      .studiohead .st-people {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        padding-bottom: 1.6rem;
      }
      .studiohead .st-people-l {
        font-family: var(--font-mono), monospace;
        font-size: 0.62rem;
        letter-spacing: 0.18em;
        color: var(--beam);
        margin-right: 0.4rem;
      }
      .studiohead .st-person {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 999px;
        padding: 0.25rem 0.75rem 0.25rem 0.3rem;
        color: var(--stext);
        text-decoration: none;
        font-size: 0.82rem;
        transition: border-color 0.14s ease, color 0.14s ease;
      }
      .studiohead .st-person:hover { border-color: var(--beam); }
      .studiohead .st-avatar {
        width: 24px; height: 24px; border-radius: 50%;
        background: #1c1c27; object-fit: cover; flex-shrink: 0;
      }
      .studiohead .st-avatar-mono {
        display: inline-flex; align-items: center; justify-content: center;
        font-family: var(--font-mono), monospace;
        font-size: 0.7rem; color: var(--stext-dim);
      }
      .studiohead .st-person-name { display: inline-flex; align-items: center; gap: 0.3em; }
      .studiohead .st-seal { color: var(--beam); display: inline-flex; width: 0.95em; height: 0.95em; }
      .studiohead .st-seal svg { width: 100%; height: 100%; }
      .studiohead .st-person-n {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        color: var(--stext-dim);
      }
      .studiohead .st-people-more {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        color: var(--stext-dim);
        margin-left: 0.3rem;
      }

      /* ----------------------------- tabs ----------------------- */
      .studiohead .st-tabs {
        position: relative;
        display: flex;
        gap: 1.6rem;
        overflow-x: auto;
        border-bottom: 1px solid var(--edge);
        max-width: 1240px;
        margin: 0 auto;
        padding: 0 2rem;
        scrollbar-width: none;
        /* The row scrolls when a server has every discipline. A tab cut
           at the edge reads as a bug; a tab fading out reads as more. */
        mask-image: linear-gradient(90deg, #000 calc(100% - 3.5rem), transparent);
        -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 3.5rem), transparent);
      }
      .studiohead .st-tabs::-webkit-scrollbar { display: none; }
      .studiohead .st-tab {
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--stext-dim);
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
        letter-spacing: 0.14em;
        padding: 0 0 0.85rem;
        margin-bottom: -1px;
        cursor: pointer;
        white-space: nowrap;
        transition: color 0.14s ease, border-color 0.14s ease;
      }
      .studiohead .st-tab:hover { color: var(--stext); }
      .studiohead .st-tab-on { color: var(--beam); border-bottom-color: var(--beam); }
      .studiohead .st-tab .n { opacity: 0.5; margin-left: 0.45em; }

      .showcase .st-offline {
        padding: 8rem 2rem;
        text-align: center;
        color: #9ba0b4;
      }

      @media (max-width: 820px) {
        .studiohead .st-wrap { padding: 5rem 1.25rem 0; }
        .studiohead .st-tabs { padding-left: 1.25rem; padding-right: 1.25rem; }
        .studiohead .st-row { flex-wrap: wrap; gap: 1rem; }
        .studiohead .st-icon { width: 76px; height: 76px; border-radius: 20px; }
        .studiohead .st-monogram { font-size: 2rem; }
      }
    `}</style>
  );
}
