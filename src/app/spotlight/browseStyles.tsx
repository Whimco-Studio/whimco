/** Styles for /spotlight/gallery, the browse-everything page. Kept beside
    ShowcaseStyles rather than inside it so the landing page and the
    portfolios do not ship rules they never use. Relies on the `.showcase`
    theme vars, and reuses .sort-tabs, .chips, .more-row and .cta-ghost
    from ShowcaseStyles so the controls are the same controls. */
export default function BrowseStyles() {
  return (
    <style jsx global>{`
      /* Clears the fixed GlassNav (about 3.5rem) with room to breathe,
         without the hero-scale gap a portfolio opens with. */
      .showcase .br-head {
        text-align: center;
        padding: 6.5rem 1.5rem 1.6rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.9rem;
      }
      .showcase .br-title {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(2rem, 5.5vw, 3.6rem);
        letter-spacing: 0.04em;
        margin: 0;
      }
      .showcase .br-sub {
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
        margin: 0;
      }
      .showcase .br-sub b { color: var(--beam); font-weight: 700; }

      /* The head already carries the title, so this section starts at the
         controls rather than opening its own gap above them. */
      .showcase .br-section { padding-top: 0.4rem; }

      .showcase .br-deep {
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
        margin: 0 0 1.1rem;
      }
      .showcase .br-deep a { color: var(--beam); text-decoration: none; }
      .showcase .br-deep a:hover { text-decoration: underline; }

      /* Zero height: this only exists to be crossed. Given a size it
         would open a gap under the grid on the last page. */
      .showcase .br-sentinel { height: 0; }

      /* An anchor wearing the button's clothes, so a crawler and a reader
         follow the same control. */
      .showcase .br-more {
        display: inline-block;
        text-align: center;
        font-size: 0.95rem;
      }
      .showcase .br-more[aria-disabled='true'] { opacity: 0.5; }

      .showcase .br-end {
        text-align: center;
        font-family: var(--font-mono), monospace;
        font-size: 0.75rem;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
        margin: 2.6rem 0 0;
      }
      .showcase .br-end a { color: var(--beam); text-decoration: none; }
      .showcase .br-end a:hover { text-decoration: underline; }

      @media (max-width: 640px) {
        .showcase .br-head { padding-top: 5.5rem; }
      }
    `}</style>
  );
}
