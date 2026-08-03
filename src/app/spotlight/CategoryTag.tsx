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

  const category = likes ? likes.categoryOf(item) : (item.category ?? '');
  const label = category ? (CATEGORY_LABELS[category] ?? category) : '';

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!likes?.isCurator) {
    return category ? <span className="card-tag">{label}</span> : null;
  }

  const choose = async (next: string) => {
    setOpen(false);
    setFailed(false);
    const ok = await likes.recategorize(item, next);
    if (!ok) setFailed(true);
  };

  return (
    <span className="card-tag card-tag-editable" ref={wrapRef}>
      <button
        type="button"
        className={`tag-edit ${category ? '' : 'tag-edit-empty'}`}
        // The card is a click target that opens the lightbox, so every
        // interaction in here has to stop short of it.
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={category ? 'Change category' : 'Set a category'}
      >
        {category ? label : '+ category'}
        <span className="tag-pencil" aria-hidden="true">✎</span>
      </button>
      {failed && <span className="tag-failed">not saved</span>}
      {open && (
        <span className="tag-picker" role="listbox" onClick={(e) => e.stopPropagation()}>
          {Object.entries(CATEGORY_LABELS).map(([code, text]) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === category}
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
