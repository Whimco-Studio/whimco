'use client';

import { useState } from 'react';
import useSaved from './useSaved';

/**
 * Save creator, on a portfolio. Private: only the viewer sees their list,
 * and the creator is never told. Works signed out (kept in this browser)
 * so a visitor from search can save without an account.
 */
export default function SaveCreatorButton({ handle }: { handle: string }) {
  const saved = useSaved();
  const [note, setNote] = useState('');
  if (!saved.ready) return null;
  const on = saved.isSaved(handle);

  const press = async () => {
    const ok = await saved.toggle(handle);
    if (!ok) { setNote('Could not save that. Try again.'); return; }
    setNote(on ? '' : saved.signedIn
      ? 'Saved. It is in your Spotlight DMs too.'
      : 'Saved in this browser. Sign in with Discord to keep it everywhere.');
  };

  return (
    <div className="pf-save">
      <button
        type="button"
        className={`pf-save-btn ${on ? 'pf-save-on' : ''}`}
        aria-pressed={on}
        onClick={press}
      >
        {on ? '★ Saved' : '☆ Save creator'}
      </button>
      {note && <p className="pf-save-note">{note} <a href="/spotlight/saved">Your saved creators →</a></p>}
    </div>
  );
}
