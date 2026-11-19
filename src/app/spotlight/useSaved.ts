'use client';

import { useCallback, useEffect, useState } from 'react';
import { SAVED_LOOKUP_URL, SAVED_MERGE_URL, SAVED_URL } from './constants';

/** One saved creator, as the Spotlight API describes them. */
export type SavedCreator = {
  handle: string;
  url: string;
  categories: string[];
  creations: number;
  covers: string[];
  avatar: string;
};

const LOCAL_KEY = 'spotlight-saved-creators';

function readLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((h) => typeof h === 'string').slice(0, 50) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: string[]) {
  try {
    if (list.length) window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    else window.localStorage.removeItem(LOCAL_KEY);
  } catch {
    // Private window or blocked storage: the save lasts this visit only.
  }
}

const norm = (h: string) => h.replace(/^@/, '').toLowerCase();

/**
 * The viewer's saved creators. Signed in, the list is their account's
 * (the same one the Discord Save creator button fills, and the one the
 * bot keeps in their DMs). Signed out, it lives in this browser, so a
 * hirer from Google can save without making an account first; the next
 * time they sign in it joins their account and the browser copy is
 * cleared.
 */
export default function useSaved() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [items, setItems] = useState<SavedCreator[]>([]);
  const [handles, setHandles] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const r = await fetch(SAVED_URL, { credentials: 'include' });
      const body = r.ok ? await r.json() : { signed_in: false, items: [] };
      if (body.signed_in) {
        const local = readLocal();
        if (local.length) {
          await fetch(SAVED_MERGE_URL, {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ handles: local }),
          });
          writeLocal([]);
          const again = await fetch(SAVED_URL, { credentials: 'include' });
          if (again.ok) body.items = (await again.json()).items;
        }
        setSignedIn(true);
        setItems(body.items);
        setHandles(new Set((body.items as SavedCreator[]).map((i) => norm(i.handle))));
      } else {
        const local = readLocal();
        setSignedIn(false);
        setHandles(new Set(local.map(norm)));
        if (local.length) {
          const q = new URLSearchParams();
          local.forEach((h) => q.append('h', h));
          const lr = await fetch(`${SAVED_LOOKUP_URL}?${q}`);
          if (lr.ok) setItems((await lr.json()).items);
        } else {
          setItems([]);
        }
      }
    } catch {
      setHandles(new Set(readLocal().map(norm)));
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isSaved = useCallback((handle: string) => handles.has(norm(handle)), [handles]);

  /** Save or unsave. Resolves to whether it took. */
  const toggle = useCallback(async (handle: string): Promise<boolean> => {
    const want = !handles.has(norm(handle));
    const apply = (on: boolean) => setHandles((prev) => {
      const next = new Set(prev);
      if (on) next.add(norm(handle)); else next.delete(norm(handle));
      return next;
    });
    apply(want);
    if (!signedIn) {
      const local = readLocal().filter((h) => norm(h) !== norm(handle));
      writeLocal(want ? [handle, ...local] : local);
      return true;
    }
    try {
      const r = await fetch(SAVED_URL, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, saved: want }),
      });
      if (!r.ok) throw new Error(String(r.status));
      return true;
    } catch {
      apply(!want);
      return false;
    }
  }, [handles, signedIn]);

  return { ready, signedIn, items, isSaved, toggle, reload: load };
}
