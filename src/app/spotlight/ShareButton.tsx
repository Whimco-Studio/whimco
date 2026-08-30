'use client';

import { useEffect, useRef, useState } from 'react';
import { postPath } from './constants';

type Props = {
  id: number;
  authorName: string;
  className?: string;
};

/** Copies a creation's permalink, or hands it to the OS share sheet.
 *
 * navigator.share first where it exists, which on a phone is the sheet
 * that offers Discord directly. That is worth preferring: most of this
 * audience is sharing into a Discord server, and the sheet skips the
 * copy-then-paste round trip entirely.
 *
 * Clipboard is the fallback, and it needs a guard of its own:
 * navigator.clipboard is undefined on any page not served over HTTPS,
 * which includes every local dev server on plain http. Doing nothing
 * there would read as a broken button rather than an insecure context.
 */
export default function ShareButton({ id, authorName, className = '' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const flash = (next: 'copied' | 'failed') => {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  const share = async (e: React.MouseEvent) => {
    // The lightbox closes on any click that reaches it. Without this,
    // sharing from inside the lightbox also dismisses the thing shared.
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}${postPath(id)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Creation by ${authorName} on Spotlight`, url });
        return;
      } catch {
        // Dismissing the sheet rejects, and so does a browser that
        // advertises share but refuses this payload. Neither is worth
        // saying out loud, so fall through to the clipboard either way.
      }
    }

    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await navigator.clipboard.writeText(url);
      flash('copied');
    } catch {
      flash('failed');
    }
  };

  const label = state === 'copied'
    ? 'copied'
    : state === 'failed' ? 'copy failed' : 'share';

  return (
    <button
      type="button"
      className={`share-btn${state === 'copied' ? ' share-on' : ''} ${className}`.trim()}
      onClick={share}
      aria-label={`Share the creation by ${authorName}`}
    >
      {label}
    </button>
  );
}
