'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import GalleryGrid from './Gallery';
import RemovedDrawer from './RemovedDrawer';
import ShowcaseStyles from './styles';
import VerifiedSeal from './VerifiedSeal';
import useLikes from './useLikes';
import {
  CLAIM_URL, INVITE_URL, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem,
} from './constants';

export default function Portfolio({
  username, initialData,
}: { username: string; initialData: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useState(initialData?.author);
  const likes = useLikes();

  const profile = initialData?.profile;
  const name = author?.name || username;

  // Guards the two fetches below against each other, the same way
  // Showcase.tsx guards its own. The mount refresh and a "show more"
  // click can be in flight together, and without this whichever lands
  // last wins regardless of which was asked for last: a page-one refresh
  // landing after a page-two append would throw the appended page away.
  const fetchGen = useRef(0);

  const loadMore = useCallback(async () => {
    const gen = ++fetchGen.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), author: username });
      const res = await fetch(`${SHOWCASE_API_URL}?${params}`);
      if (!res.ok) throw new Error(`portfolio fetch ${res.status}`);
      const data: ShowcaseData = await res.json();
      if (fetchGen.current !== gen) return;
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      // Keep what we have; the button stays available to retry.
    } finally {
      setLoading(false);
    }
  }, [page, username]);

  // The page is rendered through ISR with a five minute window, and ISR
  // serves the stale copy while it regenerates, so the request that
  // trips the revalidation still gets the old page. For a creator that
  // window lands exactly where it hurts: they post, open their own
  // portfolio to check it arrived, and their newest work is not there.
  //
  // The API itself is already current within seconds, because every
  // showcase write bumps the generation in its cache key. So this just
  // asks for page one again on mount and swaps it in. Silent, with no
  // spinner: nobody clicked anything, and a flash of "Loading" on a page
  // that already has content reads as a fault rather than a refresh.
  const refresh = useCallback(async () => {
    const gen = ++fetchGen.current;
    try {
      const params = new URLSearchParams({ page: '1', author: username });
      const res = await fetch(`${SHOWCASE_API_URL}?${params}`);
      if (!res.ok) return;
      const data: ShowcaseData = await res.json();
      // A "show more" that started after this one owns the list now;
      // replacing it with page one would drop what they just loaded.
      if (fetchGen.current !== gen) return;
      setItems(data.items);
      setPage(data.page);
      setPages(data.pages);
      // The header counts go stale with the grid. Leaving them behind
      // would show a creator four creations above five cards.
      if (data.author) setAuthor(data.author);
    } catch {
      // Stale content beats blanking the page over a failed refresh.
    }
  }, [username]);

  useEffect(() => { refresh(); }, [refresh]);

  /** A creation the owner just took down. The card goes immediately, then
      the refresh corrects the header counts, which are computed server
      side and would otherwise still claim the creation this just removed. */
  const onRemoved = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    refresh();
  }, [refresh]);

  return (
    <div className="showcase">
      <header className="pf-head">
        <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
        <div className="pf-name-row">
          {profile?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pf-avatar" src={profile.avatar_url} alt="" referrerPolicy="no-referrer" />
          )}
          <h1 className="pf-name">{name}</h1>
          {profile && <VerifiedSeal className="pf-verified" />}
        </div>
        {author && (
          <p className="pf-sub">
            <b>{author.creations.toLocaleString('en-US')}</b> creation{author.creations === 1 ? '' : 's'} broadcast
            {' · '}
            <b>{author.hearts.toLocaleString('en-US')}</b> heart{author.hearts === 1 ? '' : 's'} from the network
          </p>
        )}
        {profile?.bio && <p className="pf-bio">{profile.bio}</p>}
        {profile && profile.links.length > 0 && (
          <p className="pf-links">
            {profile.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="nofollow noopener noreferrer">
                {l.label} ↗
              </a>
            ))}
          </p>
        )}
        {profile?.contact && <p className="pf-contact">{profile.contact}</p>}
        {/* Shown even at zero creations: the welcome DM sends first-time
            creators straight here, and the showcase API and this page's ISR
            each cache for 5 minutes, so their first creation has not landed
            yet. Gating on creations > 0 hid the claim from exactly the people
            it was written for. */}
        {!profile && author && (
          <p className="pf-claim-cta">
            <span>Is this you?</span>
            <a href={CLAIM_URL}>CLAIM THIS PORTFOLIO</a>
          </p>
        )}
      </header>

      <section className="gallery-section" aria-label={`Creations by ${name}`}>
        <GalleryGrid
          items={items}
          likes={likes}
          showAuthor={false}
          emptyText={initialData
            ? `No creations from ${name} in the showcase yet.`
            : 'The showcase is momentarily offline — check back shortly.'}
          canLoadMore={page < pages}
          loading={loading}
          onLoadMore={loadMore}
          onRemoved={onRemoved}
        />

        <RemovedDrawer username={username} likes={likes} onRestored={refresh} />

        <div className="cta-row" style={{ marginTop: '3.5rem' }}>
          <a className="cta-primary" href={INVITE_URL} target="_blank" rel="noopener noreferrer">
            Share your work through Spotlight
          </a>
        </div>
      </section>

      <ShowcaseStyles />
    </div>
  );
}
