'use client';

import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  CLAIM_START_URL, LIKE_URL, ME_URL, RECATEGORIZE_URL, REMOVE_URL, ShowcaseItem,
} from './constants';

export type Likes = {
  ready: boolean;
  signedIn: boolean;
  isCurator: boolean;
  /** The signed-in creator's Discord username, which is what a portfolio
      URL is built from. Comparing it to the page's canonical name is how
      the page knows the reader owns it, and it works for a creator with
      no creations yet, which own_item_ids cannot. */
  username: string;
  /** Their stored layout and accent, straight from /me rather than the
      public payload: that one is cached five minutes, so a creator who
      just saved would reopen the editor on their previous choice. */
  appearance: { layout: string; accent: string; feature: number | null };
  isLiked: (id: number) => boolean;
  hearts: (item: ShowcaseItem) => number;
  toggle: (item: ShowcaseItem) => void;
  categoryOf: (item: ShowcaseItem) => string;
  recategorize: (item: ShowcaseItem, category: string) => Promise<boolean>;
  /** Whether this creation belongs to the person reading the page. */
  isMine: (id: number) => boolean;
  /** Take one of your own creations off whimco.com, or put it back.
      Gallery only: the Discord copies stay live. */
  setRemoved: (item: ShowcaseItem, removed: boolean) => Promise<boolean>;
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
  const [username, setUsername] = useState('');
  const [appearance, setAppearance] = useState<{
    layout: string; accent: string; feature: number | null;
  }>({ layout: '', accent: '', feature: null });
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [own, setOwn] = useState<Set<number>>(new Set());
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<Record<number, string>>({});
  // Per-item write sequence, guarding against two overlapping recategorize
  // calls landing out of order (fire one, then correct it before the first
  // reply arrives). A ref, not state: a stale generation must not itself
  // trigger a render, it only needs to be readable when the in-flight
  // calls it's tracking resolve.
  const categoryGen = useRef<Record<number, number>>({});

  useEffect(() => {
    let alive = true;
    fetch(ME_URL, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        setSignedIn(Boolean(data.signed_in));
        setIsCurator(Boolean(data.is_curator));
        setUsername(String(data.username ?? ''));
        setAppearance({
          layout: String(data.layout ?? ''),
          accent: String(data.accent ?? ''),
          feature: data.feature_item_id ?? null,
        });
        setLiked(new Set<number>(data.liked_item_ids ?? []));
        setOwn(new Set<number>(data.own_item_ids ?? []));
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

  /** Take one of your own creations off whimco.com, or restore it.
      Resolves false when the write did not land, so the caller can roll
      its optimistic update back and say so.

      Not optimistic here, unlike toggle: the caller removes the card from
      its own list, and there is no shared count to keep in step. The
      ownership set is updated on success so a restore from the drawer
      brings the remove control back with the card. */
  const setRemoved = useCallback(
    async (item: ShowcaseItem, removed: boolean) => {
      if (!signedIn) {
        const next = encodeURIComponent(window.location.href);
        window.location.href = `${CLAIM_START_URL}?next=${next}`;
        return false;
      }
      try {
        const r = await fetch(REMOVE_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: item.id, removed }),
        });
        if (!r.ok) throw new Error(String(r.status));
        setOwn((prev) => {
          const nextSet = new Set(prev);
          if (removed) nextSet.delete(item.id); else nextSet.add(item.id);
          return nextSet;
        });
        return true;
      } catch {
        return false;
      }
    },
    [signedIn],
  );

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
      // Claim this write's slot before anything async happens, so a second
      // call started while this one is in flight is visible the moment it
      // starts, not just when it resolves.
      const gen = (categoryGen.current[item.id] ?? 0) + 1;
      categoryGen.current[item.id] = gen;
      const isCurrent = () => categoryGen.current[item.id] === gen;
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
        // A newer call already owns this item's displayed value. Applying
        // this reply now would overwrite it with a stale confirmation.
        if (isCurrent()) setCategories((prev) => ({ ...prev, [item.id]: data.category }));
        return true;
      } catch {
        // Same guard on the failure path: rolling back here would stomp a
        // later call's already-confirmed value with this call's stale one.
        if (isCurrent()) setCategories((prev) => ({ ...prev, [item.id]: previous }));
        return false;
      }
    },
    [categories],
  );

  return {
    ready,
    signedIn,
    isCurator,
    username,
    appearance,
    isLiked: useCallback((id: number) => liked.has(id), [liked]),
    hearts: useCallback(
      (item: ShowcaseItem) => counts[item.id] ?? item.hearts,
      [counts],
    ),
    toggle,
    categoryOf,
    recategorize,
    isMine: useCallback((id: number) => own.has(id), [own]),
    setRemoved,
  };
}
