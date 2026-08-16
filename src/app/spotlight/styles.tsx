'use client';

/* Shared visual system for the Spotlight showcase + creator portfolios.
   Global (not scoped) because cards/lightbox render from child
   components — everything is namespaced under .showcase instead. */
export default function ShowcaseStyles() {
  return (
    <style jsx global>{`
      .showcase {
        --stage: #0a0a0f;
        --panel: #14141d;
        --edge: rgba(255, 255, 255, 0.07);
        --blurple: #5865f2;
        --beam: #ffd98a;
        --beam-dim: rgba(255, 217, 138, 0.14);
        --stext: #f4f5fa;
        --stext-dim: #9ba0b4;
        --heart: #ed4245;
        background:
          radial-gradient(ellipse 90% 45% at 50% 0%, rgba(88, 101, 242, 0.10) 0%, transparent 60%),
          var(--stage);
        color: var(--stext);
        font-family: 'Inter', -apple-system, sans-serif;
      }

      /* ------------------------------ hero --------------------- */
      .showcase .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 8.5rem 1.5rem 4rem;
        gap: 1.4rem;
      }
      .showcase .eyebrow {
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
        letter-spacing: 0.28em;
        color: var(--beam);
        display: flex;
        align-items: center;
        gap: 0.6em;
        margin: 0;
      }
      .showcase .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--beam);
        box-shadow: 0 0 8px var(--beam);
        animation: showcasePulse 2.4s ease-in-out infinite;
      }
      @keyframes showcasePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.35; }
      }
      @media (prefers-reduced-motion: reduce) {
        .showcase .live-dot { animation: none; }
      }
      .showcase .hero-logo {
        width: clamp(220px, 30vw, 340px);
        height: auto;
      }
      .showcase .headline {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(2.6rem, 7vw, 5.2rem);
        line-height: 1.02;
        letter-spacing: -0.02em;
        margin: 0;
      }
      .showcase .beamed {
        background: linear-gradient(100deg, #fff2d4 0%, var(--beam) 45%, #d9a94f 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .showcase .sub {
        max-width: 42rem;
        color: var(--stext-dim);
        font-size: clamp(0.95rem, 1.4vw, 1.08rem);
        line-height: 1.65;
        margin: 0;
      }
      .showcase .cta-row {
        display: flex;
        gap: 0.9rem;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 0.4rem;
      }
      .showcase .cta-primary {
        background: var(--blurple);
        color: #fff;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.85rem 1.7rem;
        border-radius: 12px;
        text-decoration: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        box-shadow: 0 4px 24px rgba(88, 101, 242, 0.35);
      }
      .showcase .cta-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(88, 101, 242, 0.5);
      }
      .showcase .cta-ghost {
        color: var(--stext-dim);
        font-weight: 500;
        font-size: 0.95rem;
        padding: 0.85rem 1.4rem;
        border: 1px solid var(--edge);
        border-radius: 12px;
        text-decoration: none;
        background: transparent;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .showcase .cta-ghost:hover {
        color: var(--stext);
        border-color: rgba(255, 217, 138, 0.4);
      }

      /* --------------------------- stat strip ------------------ */
      .showcase .stat-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1px;
        background: var(--edge);
        border: 1px solid var(--edge);
        border-radius: 16px;
        overflow: hidden;
        margin-top: 2.2rem;
        width: min(58rem, 100%);
      }
      .showcase .stat {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        padding: 1.5rem 1rem;
        background: rgba(20, 20, 29, 0.85);
      }
      .showcase .stat-number {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 700;
        font-size: clamp(1.5rem, 3.2vw, 2.3rem);
        color: var(--beam);
        text-shadow: 0 0 24px rgba(255, 217, 138, 0.25);
        font-variant-numeric: tabular-nums;
      }
      .showcase .stat-label {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        letter-spacing: 0.14em;
        color: var(--stext-dim);
      }
      @media (max-width: 720px) {
        .showcase .stat-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      /* ---------------------------- gallery --------------------- */
      .showcase .gallery-section {
        max-width: 78rem;
        margin: 0 auto;
        padding: 2rem 1.5rem 5rem;
      }
      .showcase .gallery-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.2rem;
      }
      .showcase .gallery-title {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 700;
        font-size: clamp(1.4rem, 2.6vw, 2rem);
        margin: 0;
      }
      .showcase .gallery-head-right {
        display: flex;
        align-items: baseline;
        gap: 1.1rem;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .showcase .gallery-link {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        letter-spacing: 0.16em;
        color: var(--beam);
        text-decoration: none;
        white-space: nowrap;
        border-bottom: 1px solid transparent;
        transition: border-color 0.18s ease;
      }
      .showcase .gallery-link:hover,
      .showcase .gallery-link:focus-visible {
        border-bottom-color: var(--beam);
      }
      .showcase .gallery-note {
        font-family: var(--font-mono), monospace;
        font-size: 0.68rem;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
        white-space: nowrap;
      }
      /* Sort tabs sit above the category chips and read as a different
         kind of control on purpose: an underline rather than a pill, so
         "which ordering" never looks like one more filter to combine. */
      .showcase .sort-tabs {
        display: flex;
        gap: 1.4rem;
        border-bottom: 1px solid var(--edge);
        margin-bottom: 1.1rem;
      }
      .showcase .sort-tab {
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.06em;
        color: var(--stext-dim);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0 0 0.6rem;
        margin-bottom: -1px;
        cursor: pointer;
        white-space: nowrap;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .showcase .sort-tab:hover { color: var(--stext); }
      .showcase .sort-tab-on {
        color: var(--beam);
        border-bottom-color: var(--beam);
        font-weight: 700;
      }

      .showcase .chips {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.8rem;
        margin-bottom: 1.2rem;
        scrollbar-width: none;
      }
      .showcase .chips::-webkit-scrollbar { display: none; }
      .showcase .chip {
        font-family: var(--font-mono), monospace;
        font-size: 0.75rem;
        color: var(--stext-dim);
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 999px;
        padding: 0.42rem 0.9rem;
        cursor: pointer;
        white-space: nowrap;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .showcase .chip:hover { color: var(--stext); }
      .showcase .chip-on {
        color: #1a1204;
        background: var(--beam);
        border-color: var(--beam);
        font-weight: 700;
      }
      .showcase .chip-count { opacity: 0.65; margin-left: 0.15rem; }

      /* the beam — warm light that follows the cursor */
      .showcase .masonry-wrap { position: relative; }
      .showcase .beam-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 2;
        background: radial-gradient(
          580px circle at var(--mx, 50%) var(--my, 20%),
          var(--beam-dim) 0%,
          transparent 65%
        );
        mix-blend-mode: screen;
      }
      @media (hover: none) {
        .showcase .beam-overlay { display: none; }
      }

      .showcase .masonry {
        display: flex;
        gap: 0.9rem;
        align-items: flex-start;
      }
      .showcase .masonry-col {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }
      .showcase .card {
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 14px;
        /* No overflow: hidden here. The category picker opens upward from
           the meta row and needs to escape this box, not be clipped by it.
           The clipping moved to .card-hit, which holds everything that
           actually needs it. */
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .showcase .card:hover, .showcase .card:focus-within {
        transform: translateY(-3px);
        border-color: rgba(255, 217, 138, 0.35);
        box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5), 0 0 22px rgba(255, 217, 138, 0.08);
      }
      .showcase .card-hit {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: inherit;
        font: inherit;
        /* Was the whole card's job. It sits here rather than on
           .card-media because a card can have no media at all:
           views._media_urls drops entries whose presign fails, leaving a
           caption-only card whose square .card-caption-only border-left
           would otherwise poke past the card's rounded top corners.
           .card-hit wraps the media and the caption both, so it clips
           everything that needs clipping. The picker is in .card-meta, a
           sibling of this, so it still escapes the card entirely. */
        overflow: hidden;
        border-radius: 14px 14px 0 0;
      }
      .showcase .card-hit:focus-visible {
        outline: 2px solid var(--beam);
        outline-offset: -2px;
      }
      .showcase .card-media {
        position: relative;
        display: block;
        /* Clipping lives on .card-hit, the parent, so a card with no
           media is clipped too. */
      }
      .showcase .card-media img,
      .showcase .card-media video {
        width: 100%;
        display: block;
        filter: brightness(0.94);
        transition: filter 0.18s ease;
      }
      .showcase .card:hover .card-media img,
      .showcase .card:hover .card-media video {
        filter: brightness(1.04);
      }
      .showcase .video-badge,
      .showcase .count-badge {
        position: absolute;
        right: 8px;
        bottom: 8px;
        font-size: 0.65rem;
        font-family: var(--font-mono), monospace;
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        border-radius: 6px;
        padding: 3px 7px;
      }
      .showcase .card-caption {
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--stext);
        padding: 0.7rem 0.8rem 0;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .showcase .card-caption-only {
        -webkit-line-clamp: 6;
        font-size: 0.95rem;
        padding-top: 1rem;
        border-left: 3px solid var(--beam-dim);
      }
      .showcase .card-meta {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 0.8rem 0.75rem;
        font-size: 0.72rem;
        color: var(--stext-dim);
        min-width: 0;
      }
      .showcase .card-author {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
        color: inherit;
        text-decoration: none;
      }
      .showcase a.card-author:hover {
        color: var(--beam);
        text-decoration: underline;
      }
      /* Sits inside the author link, which ellipsises a long name. Stays
         gold on hover (the link recolours) and never shrinks away.

         Sized in rem, not the 1em it used to inherit. The seal renders at
         0.62em of its own font-size, so inheriting .card-meta's 0.72rem
         drew it at about 7px: half the size of the same mark in the
         creators directory and small enough to read as a speck of dust
         next to the name. 1.3rem puts it at roughly 13px, a little taller
         than the 11.5px text beside it, which is where a badge wants to
         sit. It stays under the meta row's line box, so nothing reflows. */
      .showcase .card-seal {
        color: var(--beam);
        font-size: 1.3rem;
        margin-left: 0.3em;
        vertical-align: -0.14em;
        flex-shrink: 0;
      }
      .showcase .card-hearts {
        color: var(--heart);
        font-weight: 600;
        flex-shrink: 0;
      }
      .showcase button.heart-btn {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        transition: transform 0.12s ease;
      }
      .showcase button.heart-btn:hover { transform: scale(1.15); }
      .showcase button.heart-btn:active { transform: scale(0.95); }
      .showcase button.heart-btn.heart-on { color: var(--heart); }
      .showcase .card-tag {
        font-family: var(--font-mono), monospace;
        font-size: 0.65rem;
        color: var(--beam);
        flex-shrink: 0;
        margin-left: auto;
      }
      .showcase .card-tag-editable {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }
      .showcase .tag-edit {
        font: inherit;
        color: inherit;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }
      .showcase .tag-edit-empty { opacity: 0.45; }
      /* On a card the pencil waits for hover, so twenty-four of them are
         not competing with the work. In the lightbox there is one item on
         screen, so it stays put. */
      .showcase .card .tag-pencil { opacity: 0; transition: opacity 0.15s ease; }
      .showcase .card:hover .tag-pencil,
      .showcase .card:focus-within .tag-pencil,
      .showcase .lightbox .tag-pencil { opacity: 0.7; }
      .showcase .tag-edit:hover .tag-pencil { opacity: 1; }
      .showcase .tag-failed { color: #f0a0a6; font-size: 0.6rem; }

      /* Remove control, on your own creations only. Quiet until the card
         is hovered or focused, the same way the curator pencil is: it is
         destructive, and a permanently lit ✕ on every one of your cards
         makes your own portfolio read as a management screen. Always
         visible in the lightbox, where there is no hover to reveal it and
         one creation has the whole viewport. */
      .showcase .card-remove-wrap {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        margin-left: auto;
      }
      .showcase .card-remove {
        background: none;
        border: 0;
        padding: 0 0.15rem;
        cursor: pointer;
        font: inherit;
        font-size: 0.68rem;
        line-height: 1;
        color: var(--stext-dim);
        opacity: 0;
        transition: opacity 0.15s ease, color 0.15s ease;
      }
      .showcase .card:hover .card-remove,
      .showcase .card:focus-within .card-remove,
      .showcase .lightbox .card-remove { opacity: 0.65; }
      .showcase .card-remove:hover { opacity: 1; color: #f0a0a6; }
      .showcase .card-remove:disabled { cursor: default; opacity: 0.4; }
      /* A phone has no hover to reveal it with, so the reasoning above
         inverts: on touch the control was not subtle, it was absent. The
         only way to reach it was to open a creation and find it in the
         lightbox, which nobody would think to do. Shown persistently
         here, which costs the restraint above on the devices that cannot
         afford it. Safe to leave lit because the first press only arms
         it. */
      @media (hover: none) {
        .showcase .card-remove { opacity: 0.65; }
      }
      /* Armed: reads as a word, not a glyph, so the second press is a
         deliberate answer to a question rather than a repeat of a click. */
      .showcase .card-remove-armed,
      .showcase .card:hover .card-remove-armed,
      .showcase .lightbox .card-remove-armed {
        opacity: 1;
        color: #f0a0a6;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        font-size: 0.6rem;
      }

      /* The removed drawer: collapsed by default. A creator who removed
         something meant to stop seeing it. */
      .showcase .pf-removed {
        margin-top: 2.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        padding-top: 1rem;
      }
      .showcase .pf-removed-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: none;
        border: 0;
        padding: 0.2rem 0;
        cursor: pointer;
        font: inherit;
        font-size: 0.72rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--stext-dim);
      }
      .showcase .pf-removed-toggle:hover { color: var(--beam); }
      .showcase .pf-removed-chev { font-size: 0.6rem; }
      .showcase .pf-removed-note {
        margin: 0.6rem 0 1.1rem;
        max-width: 46ch;
        font-size: 0.72rem;
        line-height: 1.55;
        color: var(--stext-dim);
      }
      .showcase .pf-removed-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
        gap: 1.4rem;
      }
      .showcase .pf-removed-row {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        /* Removed work reads as set aside rather than shown. Restoring
           returns it to full strength, so the difference is legible. */
        opacity: 0.72;
      }
      .showcase .pf-removed-row:hover { opacity: 1; }
      .showcase .pf-restore {
        align-self: flex-start;
        font-size: 0.66rem;
        padding: 0.3rem 0.8rem;
      }
      .showcase .tag-picker {
        position: absolute;
        bottom: 100%;
        right: 0;
        margin-bottom: 0.35rem;
        z-index: 30;
        display: grid;
        grid-template-columns: repeat(2, minmax(5.5rem, 1fr));
        gap: 0.15rem;
        padding: 0.35rem;
        background: #101018;
        border: 1px solid var(--edge);
        border-radius: 0.5rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }
      .showcase .tag-option {
        font: inherit;
        font-size: 0.65rem;
        text-align: left;
        color: #c8c8dc;
        background: none;
        border: none;
        border-radius: 0.3rem;
        padding: 0.3rem 0.4rem;
        cursor: pointer;
        white-space: nowrap;
      }
      .showcase .tag-option:hover { background: #1c1c30; color: #fff; }
      .showcase .tag-option-on { color: var(--beam); }
      .showcase .empty {
        border: 1px dashed var(--edge);
        border-radius: 14px;
        padding: 3.5rem 2rem;
        text-align: center;
        color: var(--stext-dim);
        font-size: 0.95rem;
      }
      .showcase .more-row {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
      }
      .showcase .more-btn {
        cursor: pointer;
        font-family: inherit;
      }
      .showcase .more-btn:disabled { opacity: 0.5; cursor: default; }

      /* --------------------------- portfolio -------------------- */
      .showcase .pf-head {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
        padding: 8.5rem 1.5rem 3rem;
      }
      .showcase .pf-back {
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
        letter-spacing: 0.18em;
        color: var(--stext-dim);
        text-decoration: none;
      }
      .showcase .pf-back:hover { color: var(--beam); }
      .showcase .pf-name {
        font-family: var(--font-display), 'Inter', sans-serif;
        font-weight: 800;
        font-size: clamp(2.2rem, 6vw, 4.2rem);
        line-height: 1.05;
        letter-spacing: -0.02em;
        margin: 0;
        overflow-wrap: anywhere;
      }
      .showcase .pf-sub {
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.12em;
        color: var(--stext-dim);
      }
      .showcase .pf-sub b { color: var(--beam); font-weight: 700; }
      .showcase .pf-name-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .showcase .pf-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 2px solid var(--beam);
      }
      /* Shared verified seal. Sized in em off its own font-size, so each
         surface only overrides that one value and the seal tracks whatever
         type it sits beside at every breakpoint. */
      .showcase .sl-seal {
        display: inline-flex;
        align-items: center;
        line-height: 0;
        color: var(--beam);
      }
      .showcase .sl-seal svg {
        width: 0.62em;
        height: 0.62em;
        display: block;
        filter: drop-shadow(0 0 0.14em rgba(255, 217, 138, 0.4));
      }
      .showcase .pf-verified { font-size: clamp(2.2rem, 6vw, 4.2rem); }
      .showcase .pf-bio {
        max-width: 560px;
        font-size: 0.95rem;
        line-height: 1.65;
        color: var(--stext);
        opacity: 0.85;
      }
      .showcase .pf-links {
        display: flex;
        gap: 1.4rem;
        flex-wrap: wrap;
        justify-content: center;
        font-family: var(--font-mono), monospace;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
      }
      .showcase .pf-links a { color: var(--beam); text-decoration: none; }
      .showcase .pf-links a:hover { text-decoration: underline; }
      /* Reaching a creator is most of what this page is for, so the handle
         sits in the link row and inherits its type. A button rather than an
         anchor because it copies instead of navigating. */
      .showcase .pf-copy-wrap {
        display: inline-flex;
        align-items: baseline;
        gap: 0.5rem;
      }
      .showcase .pf-copy {
        background: none;
        border: 0;
        padding: 0;
        cursor: pointer;
        font: inherit;
        letter-spacing: inherit;
        color: var(--beam);
      }
      .showcase .pf-copy:hover { text-decoration: underline; }
      .showcase .pf-copy-done { color: var(--stext); }
      /* One click selects the whole handle, since this fallback exists for
         exactly the viewer whose browser refused to copy for them. */
      .showcase .pf-copy-fail {
        color: var(--stext-dim);
        user-select: all;
      }
      .showcase .pf-contact {
        font-family: var(--font-mono), monospace;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
      }
      .showcase .pf-claim-cta {
        font-family: var(--font-mono), monospace;
        font-size: 0.74rem;
        letter-spacing: 0.1em;
        color: var(--stext-dim);
        display: flex;
        align-items: center;
        gap: 0.9rem;
        flex-wrap: wrap;
        justify-content: center;
      }
      .showcase .pf-claim-cta a {
        position: relative;
        overflow: hidden;
        display: inline-block;
        color: #241a05;
        background: linear-gradient(180deg, #ffe9b8 0%, var(--beam) 45%, #e8b95e 100%);
        border: 1px solid #ffe9b8;
        border-radius: 999px;
        padding: 0.6rem 1.3rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-decoration: none;
        transition: box-shadow 0.2s, transform 0.2s;
      }
      /* Sheen that sweeps across on hover — the shine. */
      .showcase .pf-claim-cta a::after {
        content: '';
        position: absolute;
        top: 0;
        left: -80%;
        width: 50%;
        height: 100%;
        background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.55), transparent);
        transform: skewX(-20deg);
        transition: left 0.45s ease;
      }
      .showcase .pf-claim-cta a:hover {
        transform: translateY(-1px);
        box-shadow: 0 0 26px rgba(255, 217, 138, 0.45),
          0 0 60px rgba(255, 217, 138, 0.18);
      }
      .showcase .pf-claim-cta a:hover::after {
        left: 120%;
      }

      /* ---------------------------- lightbox -------------------- */
      .showcase .lightbox {
        position: fixed;
        inset: 0;
        z-index: 200;
        background: rgba(5, 5, 8, 0.88);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
      }
      .showcase .lightbox-inner {
        position: relative;
        background: var(--panel);
        border: 1px solid var(--edge);
        border-radius: 16px;
        max-width: min(60rem, 100%);
        max-height: 90vh;
        overflow-y: auto;
        padding: 1.2rem;
      }
      .showcase .lightbox-close {
        position: absolute;
        top: 0.7rem;
        right: 0.7rem;
        z-index: 2;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border: none;
        border-radius: 8px;
        width: 32px;
        height: 32px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      .showcase .lightbox-media img,
      .showcase .lightbox-media video {
        width: 100%;
        border-radius: 10px;
        display: block;
        margin-bottom: 0.8rem;
      }
      .showcase .lightbox-caption {
        font-size: 0.95rem;
        line-height: 1.6;
        color: var(--stext);
        margin: 0.2rem 0 0.8rem;
        white-space: pre-wrap;
      }
      .showcase .lightbox-meta {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 0.8rem;
        color: var(--stext-dim);
        flex-wrap: wrap;
      }
      .showcase .lightbox-source {
        margin-left: auto;
        color: var(--beam);
        text-decoration: none;
        font-family: var(--font-mono), monospace;
        font-size: 0.72rem;
      }
      .showcase .lightbox-source:hover { text-decoration: underline; }

      @media (max-width: 640px) {
        .showcase .hero { padding-top: 7rem; }
        .showcase .gallery-head { flex-direction: column; gap: 0.2rem; }
      }
    `}</style>
  );
}
