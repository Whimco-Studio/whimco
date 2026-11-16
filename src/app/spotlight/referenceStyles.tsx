/** Styles for the reference library and the "More like this" row. A plain
    <style> rather than styled-jsx so server components can render it. */
export default function ReferenceStyles() {
  return (
    <style>{`
      .rf { max-width: 92rem; margin: 0 auto; padding: 6.5rem 1rem 4rem; color: #f4f5fa; }
      .rf-head { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; }
      .rf-back { font-family: var(--font-mono), monospace; font-size: 0.72rem; letter-spacing: 0.14em;
                 color: #9ba0b4; text-decoration: none; }
      .rf-title { font-family: var(--font-display), 'Inter', sans-serif; font-weight: 800;
                  font-size: clamp(2rem, 5.5vw, 3.4rem); letter-spacing: 0.03em; margin: 0; }
      .rf-sub { font-family: var(--font-mono), monospace; font-size: 0.78rem; letter-spacing: 0.08em;
                color: #9ba0b4; margin: 0; max-width: 40rem; line-height: 1.6; }
      .rf-sub b { color: #ffd98a; }
      .rf-search { width: min(28rem, 100%); background: #14141f; border: 1px solid #2a2a3d; color: #f4f5fa;
                   border-radius: 999px; padding: 0.7rem 1.1rem; font-size: 0.95rem; margin-top: 0.6rem; }
      .rf-chips { display: flex; flex-wrap: wrap; gap: 0.45rem; justify-content: center; margin: 1.2rem 0 0.4rem; }
      .rf-chips.rf-styles { margin-top: 0.2rem; }
      .rf-chip { font-family: var(--font-mono), monospace; font-size: 0.78rem; text-decoration: none;
                 color: #d6d8e4; background: #14141f; border: 1px solid #2a2a3d; border-radius: 999px;
                 padding: 0.4rem 0.8rem; white-space: nowrap; }
      .rf-chip:hover { border-color: #ffd98a; }
      .rf-chip-on { color: #0a0a0f; background: #ffd98a; border-color: #ffd98a; }
      .rf-chip small { opacity: 0.6; margin-left: 0.35rem; }
      .rf-style-label { font-family: var(--font-mono), monospace; font-size: 0.7rem; letter-spacing: 0.14em;
                        color: #9ba0b4; align-self: center; margin-right: 0.2rem; }
      .rf-grid { columns: 2; column-gap: 0.75rem; margin-top: 1.6rem; }
      @media (min-width: 720px) { .rf-grid { columns: 3; } }
      @media (min-width: 1040px) { .rf-grid { columns: 4; } }
      @media (min-width: 1280px) { .rf-grid { columns: 5; } }
      .rf-tile { break-inside: avoid; margin: 0 0 0.9rem; display: block; }
      .rf-media { position: relative; display: block; border-radius: 12px; overflow: hidden; background: #14141f;
                  border: 1px solid #1f1f2e; }
      .rf-media img, .rf-media video, .rf-media svg { display: block; width: 100%; height: 100%; object-fit: cover; }
      .rf-media:hover { border-color: #ffd98a; }
      .rf-empty { display: block; padding: 2rem 1rem; text-align: center; color: #6a6e82; font-size: 0.8rem; }
      .rf-badge { position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(10,10,15,0.75); color: #ffd98a;
                  font-family: var(--font-mono), monospace; font-size: 0.65rem; letter-spacing: 0.1em;
                  padding: 0.15rem 0.45rem; border-radius: 6px; text-transform: uppercase; }
      .rf-tile figcaption { padding: 0.4rem 0.2rem 0; font-size: 0.82rem; overflow: hidden;
                            text-overflow: ellipsis; white-space: nowrap; }
      .rf-tile figcaption a { color: #d6d8e4; text-decoration: none; }
      .rf-tile figcaption a::before { content: '@'; color: #9ba0b4; }
      .rf-tile figcaption a:hover { color: #ffd98a; }
      .rf-more { text-align: center; margin-top: 1.6rem; }
      .rf-more a { font-family: var(--font-mono), monospace; font-size: 0.85rem; color: #ffd98a;
                   border: 1px solid #ffd98a; border-radius: 999px; padding: 0.6rem 1.2rem; text-decoration: none; }
      .rf-end, .rf-none { text-align: center; color: #9ba0b4; font-family: var(--font-mono), monospace;
                          font-size: 0.78rem; margin-top: 2rem; }
      .rf-end a, .rf-none a, .rf-related a { color: #ffd98a; }
      .rf-related { margin-top: 2.6rem; text-align: center; }
      .rf-related h2 { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: #9ba0b4;
                       font-weight: 600; margin: 0 0 0.6rem; }
      .rf-like { max-width: 64rem; margin: 0 auto; padding: 0.5rem 1.25rem 0; }
      .rf-like h2 { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: #9aa0b4;
                    font-weight: 600; margin: 1.6rem 0 0.6rem; }
      .rf-like .rf-grid { margin-top: 0.6rem; columns: 2; }
      @media (min-width: 720px) { .rf-like .rf-grid { columns: 4; } }
      @media (max-width: 640px) { .rf { padding-top: 5.5rem; } }
    `}</style>
  );
}
