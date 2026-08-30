'use client';

import { useEffect, useRef, useState } from 'react';
import { postPath } from './constants';

type Props = {
  id: number;
  authorName: string;
  className?: string;
};

/** Copies a creation's permalink to the clipboard.
 *
 * Always the clipboard, never navigator.share. The OS sheet looked like
 * the richer option and is the wrong one here: it is a modal the reader
 * did not ask for, it is absent on desktop where most of this gets used,
 * and what it returns is unknowable, so the button could not honestly
 * say whether anything happened. Copy is one predictable outcome the
 * label can confirm.
 *
 * navigator.clipboard still needs a guard. It is undefined outside a
 * secure context, so anyone reaching a dev server by LAN IP over plain
 * http has no clipboard, and saying "copy failed" is better than a
 * button that silently does nothing.
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

  const copy = async (e: React.MouseEvent) => {
    // The lightbox closes on any click that reaches it. Without this,
    // copying from inside the lightbox also dismisses the thing copied.
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}${postPath(id)}`;

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
      onClick={copy}
      aria-label={`Copy a link to the creation by ${authorName}`}
    >
      {label}
    </button>
  );
}
