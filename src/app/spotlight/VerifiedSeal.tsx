'use client';

import React, { createContext, useContext } from 'react';
import type { VerificationPrimary } from './constants';

/** Which proof wears gold on this page. Defaults to Discord, which is what
 * every page showed before Roblox linking existed; a page that has a
 * response with stats.verification_primary wraps its tree in the
 * provider so the flip reaches it without a deploy. */
const PrimaryContext = createContext<VerificationPrimary>('discord');

export function VerificationPrimaryProvider({
  value, children,
}: { value?: VerificationPrimary | null; children: React.ReactNode }) {
  return (
    <PrimaryContext.Provider value={value === 'roblox' ? 'roblox' : 'discord'}>
      {children}
    </PrimaryContext.Provider>
  );
}

export type SealKind = 'discord' | 'roblox';

const LABEL: Record<SealKind, { aria: string; title: string }> = {
  discord: {
    aria: 'Claimed portfolio, ownership confirmed via Discord',
    title: 'This creator claimed this portfolio via Discord',
  },
  roblox: {
    aria: 'Verified creator, Roblox account confirmed',
    title: 'This creator verified their Roblox account',
  },
};

/** The verification seal.
 *
 * Two kinds, one gold. The Discord claim is the starburst that has marked
 * claimed portfolios since claiming shipped; the Roblox proof is a
 * hexagon, a Whimco mark rather than anyone's logo. Whichever kind the
 * network currently treats as primary renders gold with its glow, the
 * other renders quiet, so a portfolio with both shows a gold seal and a
 * small second mark, and nobody loses a seal when the primary flips: they
 * keep it in a quieter colour and gain the chance to earn the gold one.
 *
 * Fills from `currentColor` rather than an SVG gradient: the creators
 * directory renders one of these per card, and a gradient would need a
 * `<defs>` id repeated hundreds of times in a single document. Colour and
 * size both come from CSS, so the seal tracks whatever type it sits beside.
 */
export default function VerifiedSeal({
  className = '', kind = 'discord',
}: { className?: string; kind?: SealKind }) {
  const primary = useContext(PrimaryContext);
  const quiet = kind !== primary;
  const { aria, title } = LABEL[kind];
  return (
    <span
      className={`sl-seal sl-seal-${kind} ${quiet ? 'sl-seal-quiet' : ''} ${className}`.trim()}
      role="img"
      aria-label={aria}
      title={title}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {kind === 'roblox' ? (
          <path
            fill="currentColor"
            d="M12 1.2l9.4 5.4v10.8L12 22.8l-9.4-5.4V6.6L12 1.2z"
          />
        ) : (
          <path
            fill="currentColor"
            d="M12 1l2.4 2.1 3.1-.5 1.2 2.9 2.9 1.2-.5 3.1L23 12l-2.1 2.4.5 3.1-2.9 1.2-1.2 2.9-3.1-.5L12 23l-2.4-2.1-3.1.5-1.2-2.9L2.4 17.3l.5-3.1L1 12l2.1-2.4-.5-3.1 2.9-1.2 1.2-2.9 3.1.5L12 1z"
          />
        )}
        <path fill="#0a0a0f" d="M10.6 16.1l-3.5-3.5 1.5-1.5 2 2 4.9-4.9 1.5 1.5z" />
      </svg>
    </span>
  );
}

/** Every seal a creator has earned, gold first. Renders nothing for an
 * unclaimed creator, so call sites need no guard of their own. */
export function Seals({
  claimed, roblox, className = '',
}: { claimed?: boolean; roblox?: boolean; className?: string }) {
  const primary = useContext(PrimaryContext);
  const kinds: SealKind[] = [];
  if (claimed) kinds.push('discord');
  if (roblox) kinds.push('roblox');
  if (!kinds.length) return null;
  kinds.sort((a, b) => (a === primary ? -1 : b === primary ? 1 : 0));
  return (
    <>
      {kinds.map((k) => <VerifiedSeal key={k} kind={k} className={className} />)}
    </>
  );
}
