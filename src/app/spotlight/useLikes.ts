'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CLAIM_START_URL, LIKE_URL, ME_URL, ShowcaseItem,
} from './constants';

export type Likes = {
  ready: boolean;
  signedIn: boolean;
  isLiked: (id: number) => boolean;
  hearts: (item: ShowcaseItem) => number;
  toggle: (item: ShowcaseItem) => void;
};

/** Heart state for the signed-in visitor. Optimistic: the UI flips
    immediately and reconciles with the server's {liked, hearts} answer.
    Signed-out toggles route through the claim OAuth flow and land back
    on the current page via ?next=. */
export default function useLikes(): Likes {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    let alive = true;
    fetch(ME_URL, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        setSignedIn(Boolean(data.signed_in));
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

  return {
    ready,
    signedIn,
    isLiked: useCallback((id: number) => liked.has(id), [liked]),
    hearts: useCallback(
      (item: ShowcaseItem) => counts[item.id] ?? item.hearts,
      [counts],
    ),
    toggle,
  };
}
