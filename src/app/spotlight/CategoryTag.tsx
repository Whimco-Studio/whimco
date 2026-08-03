'use client';

import { useEffect, useRef, useState } from 'react';
import { CATEGORY_LABELS, ShowcaseItem } from './constants';
import type { Likes } from './useLikes';

/** The category chip, with an inline picker for curators.

    A non-curator sees exactly what shipped before: a plain span, or
    nothing at all when the item has no category. A curator sees a button
    that opens the full option list, plus a faint placeholder on an
    uncategorized item so a gap can be filled without opening /triage. */
export default function CategoryTag({
  item, likes,
}: { item: ShowcaseItem; likes?: Likes }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const category = likes ? likes.categoryOf(item) : (item.category ?? '');
  const label = category ? (CATEGORY_LABELS[category] ?? category) : '';

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        // The browser's own mousedown default action blurs the current
        // focus toward document.body when the click lands on something
        // unfocusable, which would win over a plain focus() call made from
        // this handler and run right after it. Preventing that default is
        // what lets the explicit focus() below actually stick. It does not
        // stop the outside element's own click handler from firing, so a
        // real click target (another card, another trigger) still works.
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    // Keyboard activation never fires mousedown, only focus events, so a
    // curator tabbing from this pencil to the next one would otherwise
    // leave both pickers open at once. Closing on focus leaving the
    // wrapper covers that path without stealing focus back: the user is
    // deliberately moving on, so unlike the other dismissals below, this
    // one does not re-focus the trigger.
    const onFocusIn = (e: FocusEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!likes?.isCurator) {
    return category ? <span className="card-tag">{label}</span> : null;
  }

  const choose = async (next: string) => {
    setOpen(false);
    triggerRef.current?.focus();
    setFailed(false);
    const ok = await likes.recategorize(item, next);
    if (!ok) setFailed(true);
  };

  return (
    <span className="card-tag card-tag-editable" ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`tag-edit ${category ? '' : 'tag-edit-empty'}`}
        // The card is a click target that opens the lightbox, so every
        // interaction in here has to stop short of it.
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="true"
        aria-expanded={open}
        title={category ? 'Change category' : 'Set a category'}
      >
        {category ? label : '+ category'}
        <span className="tag-pencil" aria-hidden="true">✎</span>
      </button>
      {failed && <span className="tag-failed" role="alert">not saved</span>}
      {open && (
        // A plain button menu, not an ARIA listbox: a real listbox needs
        // roving-tabindex arrow key navigation, which this does not have.
        // Thirteen independently tabbable buttons is an honest description
        // of what this is, so it gets no role rather than a wrong one.
        <span className="tag-picker" onClick={(e) => e.stopPropagation()}>
          {Object.entries(CATEGORY_LABELS).map(([code, text]) => (
            <button
              key={code}
              type="button"
              aria-current={code === category ? 'true' : undefined}
              className={`tag-option ${code === category ? 'tag-option-on' : ''}`}
              onClick={(e) => { e.stopPropagation(); choose(code); }}
            >
              {text}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
