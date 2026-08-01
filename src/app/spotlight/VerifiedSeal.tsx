/** Gold seal marking a creator who proved ownership through Discord.
 *
 * Fills from `currentColor` rather than an SVG gradient: the creators
 * directory renders one of these per card, and a gradient would need a
 * `<defs>` id repeated hundreds of times in a single document. Colour and
 * size both come from CSS, so the seal tracks whatever type it sits beside.
 */
export default function VerifiedSeal({ className = '' }: { className?: string }) {
  return (
    <span
      className={`sl-seal ${className}`.trim()}
      role="img"
      aria-label="Verified creator, ownership confirmed via Discord"
      title="This creator verified ownership via Discord"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 1l2.4 2.1 3.1-.5 1.2 2.9 2.9 1.2-.5 3.1L23 12l-2.1 2.4.5 3.1-2.9 1.2-1.2 2.9-3.1-.5L12 23l-2.4-2.1-3.1.5-1.2-2.9L2.4 17.3l.5-3.1L1 12l2.1-2.4-.5-3.1 2.9-1.2 1.2-2.9 3.1.5L12 1z"
        />
        <path fill="#0a0a0f" d="M10.6 16.1l-3.5-3.5 1.5-1.5 2 2 4.9-4.9 1.5 1.5z" />
      </svg>
    </span>
  );
}
