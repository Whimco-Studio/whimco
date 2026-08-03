'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CLAIM_START_URL, LIKE_URL, ME_URL, RECATEGORIZE_URL, ShowcaseItem,
} from './constants';

export type Likes = {
  ready: boolean;
  signedIn: boolean;
  isCurator: boolean;
  isLiked: (id: number) => boolean;
  hearts: (item: ShowcaseItem) => number;
  toggle: (item: ShowcaseItem) => void;
  categoryOf: (item: ShowcaseItem) => string;
  recategorize: (item: ShowcaseItem, category: string) => Promise<boolean>;
};

/** Viewer state for the gallery: heart state, and whether this visitor
    may edit categories. Both come from the single credentialed /me call,
    which is why curator status lives here rather than in a hook of its
    own. /me is served no-store, so a second hook would mean a second
    round trip on every page load.

    Hearts are optimistic: the UI flips immediately and reconciles with
    the server's {liked, hearts} answer. Signed-out toggles route through
    the claim OAuth flow and land back on the current page via ?next=. */
export default function useLikes(): Likes {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isCurator, setIsCurator] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<Record<number, string>>({});

  useEffect(() => {
    let alive = true;
    fetch(ME_URL, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        setSignedIn(Boolean(data.signed_in));
        setIsCurator(Boolean(data.is_curator));
        setLiked(new Set<number>(data.liked_item_ids ?? []));
      })
      .catch(() => {})
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const toggle = useCallback((item: ShowcaseItem) => {
    if (!ready) return; // /me still in flight — a click now can't know signedIn
    if (!signedIn) {
      const next = encodeURIComponent(window.location.href);
      window.location.href = `${CLAIM_START_URL}?next=${next}`;
      return;
    }
    const wasLiked = liked.has(item.id);
    const prevCount = counts[item.id] ?? item.hearts;
    const apply = (nowLiked: boolean, hearts?: number) => {
      setLiked((prev) => {
        const nextSet = new Set(prev);
        if (nowLiked) nextSet.add(item.id); else nextSet.delete(item.id);
        return nextSet;
      });
      setCounts((prev) => ({
        ...prev,
        [item.id]: hearts ?? (prev[item.id] ?? item.hearts) + (nowLiked ? 1 : -1),
      }));
    };
    apply(!wasLiked); // optimistic
    fetch(LIKE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => apply(Boolean(data.liked), data.hearts))
      // A swallowed failure would leave a heart that looks saved but isn't —
      // roll back so the user sees the like didn't stick.
      .catch(() => apply(wasLiked, prevCount));
  }, [ready, signedIn, liked, counts]);

  // A local override wins over the item's server-rendered category, so a
  // reassignment shows immediately. The gallery payload is cached five
  // minutes and revalidated by ISR on top of that, so without this the
  // curator would keep seeing the old tag for up to ten minutes and
  // reasonably conclude the change had not saved.
  const categoryOf = useCallback(
    (item: ShowcaseItem) => categories[item.id] ?? item.category ?? '',
    [categories],
  );

  const recategorize = useCallback(
    async (item: ShowcaseItem, category: string) => {
      const previous = categories[item.id] ?? item.category ?? '';
      setCategories((prev) => ({ ...prev, [item.id]: category })); // optimistic
      try {
        const r = await fetch(RECATEGORIZE_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: item.id, category }),
        });
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        setCategories((prev) => ({ ...prev, [item.id]: data.category }));
        return true;
      } catch {
        // Roll back rather than leave a tag that looks saved and is not.
        setCategories((prev) => ({ ...prev, [item.id]: previous }));
        return false;
      }
    },
    [categories],
  );

  return {
    ready,
    signedIn,
    isCurator,
    isLiked: useCallback((id: number) => liked.has(id), [liked]),
    hearts: useCallback(
      (item: ShowcaseItem) => counts[item.id] ?? item.hearts,
      [counts],
    ),
    toggle,
    categoryOf,
    recategorize,
  };
}
