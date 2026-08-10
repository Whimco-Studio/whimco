'use client';

import { useCallback, useEffect, useState } from 'react';
import GalleryGrid from './Gallery';
import { REMOVED_URL, ShowcaseItem } from './constants';
import type { Likes } from './useLikes';

/** What this creator has taken off whimco.com, and a way back.

    Scoped by the server, not here: /api/showcase/removed answers with the
    caller's own removals on the portfolio named by ?author=, and an empty
    list on anybody else's. So this component can mount on every portfolio
    page and simply render nothing when there is nothing to show, rather
    than working out whether the person reading owns the page.

    Collapsed by default. A creator who removed something meant to stop
    seeing it, so the drawer must not put it back in front of them on
    every visit. */
export default function RemovedDrawer({
  username, likes, onRestored, reloadToken = 0,
}: {
  username: string;
  likes: Likes;
  /** Fired after a restore so the portfolio can pull the creation back
      into its grid without a reload. */
  onRestored?: () => void;
  /** Bumped by the parent whenever a creation is removed from the grid.
      Without it the drawer only ever reflects what was already removed
      when the page loaded: the card would disappear and nothing would
      say where it went, leaving no way back short of a reload. */
  reloadToken?: number;
}) {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [failed, setFailed] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ author: username });
      const res = await fetch(`${REMOVED_URL}?${params}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      // Nothing to show beats an error on a page that is otherwise fine.
    }
  }, [username]);

  // Waits for /me. Before that resolves signedIn is false for everyone,
  // and a fetch fired then would come back empty and never retry, so a
  // signed-in creator would see no drawer until they reloaded.
  useEffect(() => {
    if (!likes.ready || !likes.signedIn) return;
    load();
  }, [likes.ready, likes.signedIn, load, reloadToken]);

  const restore = async (item: ShowcaseItem) => {
    setBusy(item.id);
    setFailed(null);
    const ok = await likes.setRemoved(item, false);
    setBusy(null);
    if (!ok) { setFailed(item.id); return; }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    onRestored?.();
  };

  if (items.length === 0) return null;

  return (
    <section className="pf-removed" aria-label="Creations you removed">
      <button
        type="button"
        className="pf-removed-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Removed · {items.length}</span>
        <span className="pf-removed-chev" aria-hidden>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <>
          <p className="pf-removed-note">
            Only you can see these. They are off whimco.com, but copies
            already shared in Discord servers are still there. Ask a
            curator if you need those pulled too.
          </p>
          <div className="pf-removed-grid">
            {items.map((item) => (
              <div className="pf-removed-row" key={item.id}>
                <GalleryGrid items={[item]} emptyText="" showAuthor={false} />
                <button
                  type="button"
                  className="cta-ghost pf-restore"
                  disabled={busy === item.id}
                  onClick={() => restore(item)}
                >
                  {busy === item.id ? 'Restoring…' : 'Restore'}
                </button>
                {failed === item.id && (
                  <span className="tag-failed" role="alert">not restored</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
