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
    if (!signedIn) {
      const next = encodeURIComponent(window.location.href);
      window.location.href = `${CLAIM_START_URL}?next=${next}`;
      return;
    }
    const wasLiked = liked.has(item.id);
    setLiked((prev) => {
      const nextSet = new Set(prev);
      if (wasLiked) nextSet.delete(item.id); else nextSet.add(item.id);
      return nextSet;
    });
    setCounts((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] ?? item.hearts) + (wasLiked ? -1 : 1),
    }));
    fetch(LIKE_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: item.id }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setLiked((prev) => {
          const nextSet = new Set(prev);
          if (data.liked) nextSet.add(item.id); else nextSet.delete(item.id);
          return nextSet;
        });
        setCounts((prev) => ({ ...prev, [item.id]: data.hearts }));
      })
      .catch(() => {});
  }, [signedIn, liked]);

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
