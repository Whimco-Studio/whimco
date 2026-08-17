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

/** The creator's Discord handle, click to copy.

    Deliberately not a link. Discord has no public profile page, and
    discord.com/users/<id> only resolves into a popout for a viewer already
    signed in on that device, so most clicks would land on a login wall.
    Linking would also mean publishing the Discord snowflake as an
    invitation, which nobody agreed to by claiming a portfolio.

    Copying is the thing people actually want anyway: reaching a creator
    means pasting the handle into Discord's own search. Never the free-text
    contact line, which is whatever the creator typed and is often an email.

    Shown for unclaimed creators too. Their handle is author_name, captured
    from str(message.author) when the bot broadcast the post, which is the
    username rather than the display name: all 170 claimed creators with
    items have an author_name identical to the username OAuth reports, so
    the two fields are the same thing arriving by different routes. A
    claimed profile still wins where we have one, because that copy is
    refreshed on every login and an unclaimed one is frozen at post time.

    This publishes nothing new either way. The handle is already the page
    title and the byline under every card; the button copies what is
    on screen. The Discord user id stays out of the payload. */
function DiscordHandle({ handle }: { handle: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(handle);
      setState('copied');
    } catch {
      // No clipboard permission, or an insecure context. Falling back to
      // the handle in selectable text, because a button that silently does
      // nothing reads as broken and leaves them no way to reach anyone.
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  return (
    <span className="pf-copy-wrap">
      <button
        type="button"
        className={`pf-copy ${state === 'copied' ? 'pf-copy-done' : ''}`}
        onClick={copy}
        title={`Copy ${handle} to your clipboard`}
        aria-live="polite"
      >
        {state === 'copied' ? 'Copied ✓' : 'Discord ⧉'}
      </button>
      {state === 'failed' && <span className="pf-copy-fail">{handle}</span>}
    </span>
  );
}

export default function Portfolio({
  username, initialData,
}: { username: string; initialData: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [loading, setLoading] = useState(false);
  const [author, setAuthor] = useState(initialData?.author);
  const [removedToken, setRemovedToken] = useState(0);
  const likes = useLikes();

  const profile = initialData?.profile;
  const name = author?.name || username;
  // A claimed profile is authoritative on its own, since that username
  // comes from OAuth and gets refreshed on every login, and a creator whose
  // first post has not landed yet still has one.
  //
  // Unclaimed, the handle is only as good as a post we have actually seen,
  // so it needs a visible creation behind it. The API answers every author
  // query with a block naming whoever was asked for, zeroed when nobody
  // matched, so testing that the block exists would put a copy button for a
  // handle nobody holds on /spotlight/@anything-at-all.
  const handle = profile?.username
    || (author && author.creations > 0 ? author.name : '')
    || '';

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
    // And tell the drawer to re-read, or the card would simply vanish
    // with nothing saying where it went.
    setRemovedToken((n) => n + 1);
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
        {/* The hearts clause drops out entirely at zero rather than reading
            "0 hearts from the network", which sits under the creator's name
            and says the network saw their work and passed. Same reason the
            card hearts hide their count until there is one. A creator with no
            hearts yet is simply a creator with creations. */}
        {author && (
          <p className="pf-sub">
            <b>{author.creations.toLocaleString('en-US')}</b> creation{author.creations === 1 ? '' : 's'} broadcast
            {author.hearts > 0 && (
              <>
                {' · '}
                <b>{author.hearts.toLocaleString('en-US')}</b> heart{author.hearts === 1 ? '' : 's'} from the network
              </>
            )}
          </p>
        )}
        {profile?.bio && <p className="pf-bio">{profile.bio}</p>}
        {/* The handle joins the link row rather than getting a row of its
            own, so it reads as one more way to reach this person. Which
            means the row now renders for a creator with no links, and for
            an unclaimed one who has no profile block at all. */}
        {(!!handle || !!profile?.links.length) && (
          <p className="pf-links">
            {(profile?.links ?? []).map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="nofollow noopener noreferrer">
                {l.label} ↗
              </a>
            ))}
            {!!handle && <DiscordHandle handle={handle} />}
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

        <RemovedDrawer
          username={username}
          likes={likes}
          onRestored={refresh}
          reloadToken={removedToken}
        />

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
