'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GalleryGrid from './Gallery';
import PortfolioEditor from './PortfolioEditor';
import PortfolioHeader, { catLabel, disciplinesOf } from './PortfolioHeader';
import PortfolioLayoutStyles from './portfolioLayoutStyles';
import RemovedDrawer from './RemovedDrawer';
import ShowcaseStyles from './styles';
import useLikes from './useLikes';
import useInviteUrl from './useInviteUrl';
import {
  asAccent, asLayout, PORTFOLIO_ACCENTS, PortfolioAccent, PortfolioLayout,
  SHOWCASE_API_URL, ShowcaseData, ShowcaseItem,
} from './constants';

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
  const inviteUrl = useInviteUrl();

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

  // Whether the person reading this page is the person it is about.
  // Compared on username rather than on owning any of the creations: a
  // creator whose first post has not landed yet still owns their
  // portfolio, and own_item_ids would be empty for them.
  const isOwner = likes.ready && likes.signedIn
    && !!likes.username && likes.username === name;

  // What the server has. /me is the fresher of the two and is only about
  // the reader, so it is trusted here and nowhere else: viewing somebody
  // else's portfolio while signed in must not paint it in your colours.
  const [saved, setSaved] = useState<
    { layout: PortfolioLayout; accent: PortfolioAccent } | null
  >(null);
  const stored = saved ?? {
    layout: asLayout((isOwner && likes.appearance.layout) || profile?.layout),
    accent: asAccent((isOwner && likes.appearance.accent) || profile?.accent),
  };

  // Non-null while the customise bar is open. The page renders the draft,
  // so the preview is the portfolio itself rather than a thumbnail of it,
  // and closing without saving simply drops it.
  const [draft, setDraft] = useState<
    { layout: PortfolioLayout; accent: PortfolioAccent } | null
  >(null);

  // Only a claimed profile carries a layout, which is the same bar the
  // verified seal stands for: an unclaimed portfolio has nobody who could
  // have chosen one. Anything unrecognised falls back to classic, so a
  // layout the backend ships before this site can render it degrades
  // instead of blanking the page.
  const layout = draft?.layout ?? stored.layout;
  const accent = draft?.accent ?? stored.accent;
  const disciplines = useMemo(() => disciplinesOf(items), [items]);
  // Feature puts one piece behind the name, and the network's hearts pick
  // it. Newest breaks the tie, which matters more than it sounds: most
  // creations sit on the same low heart count, so in practice this is
  // "their best, and their most recent among equals".
  const hero = useMemo(
    () => [...items].sort(
      (a, b) => b.hearts - a.hearts
        || Date.parse(b.created_at) - Date.parse(a.created_at),
    )[0],
    [items],
  );

  const gridProps = {
    likes,
    showAuthor: false,
    onRemoved,
    // Card is a 34rem column whatever the monitor, so the window-derived
    // column count has to be capped or it deals four columns into it.
    maxCols: layout === 'card' ? 2 : 4,
    emptyText: initialData
      ? `No creations from ${name} in the showcase yet.`
      : 'The showcase is momentarily offline — check back shortly.',
  };

  const grouped = layout === 'discipline' && items.length > 0;

  return (
    <div
      className={`showcase${layout === 'classic' ? '' : ` pl-${layout}`}`}
      style={{
        // The accent overrides tokens the whole showcase already reads,
        // so recolouring a portfolio costs two custom properties and no
        // stylesheet of its own.
        '--beam': PORTFOLIO_ACCENTS[accent].hex,
        '--beam-dim': PORTFOLIO_ACCENTS[accent].dim,
      } as React.CSSProperties}
    >
      <PortfolioHeader
        layout={layout}
        name={name}
        profile={profile}
        author={author}
        handle={handle}
        disciplines={disciplines}
        hero={hero}
        editControl={isOwner && !draft ? (
          <button
            type="button"
            className="pf-edit"
            onClick={() => setDraft(stored)}
            title="Customise your portfolio"
            aria-label="Customise your portfolio"
          >
            ✎
          </button>
        ) : null}
      />

      <section className="gallery-section" aria-label={`Creations by ${name}`}>
        {grouped ? (
          disciplines.map(([code, count, hearts], i) => (
            <div className="pl-sec" key={code}>
              <div className="pl-sec-head">
                <h2>{catLabel(code)}</h2>
                <span className="pl-sec-count">
                  {count} creation{count === 1 ? '' : 's'}
                  {hearts > 0
                    ? `, ${hearts} heart${hearts === 1 ? '' : 's'}`
                    : ''}
                </span>
                <span
                  className="pl-sec-bar"
                  aria-hidden
                  style={{
                    // share of the body of work, against their biggest
                    // discipline rather than the total, so a creator with
                    // one discipline still gets a full bar
                    '--w': `${Math.round((count / disciplines[0][1]) * 100)}%`,
                  } as React.CSSProperties}
                />
              </div>
              <GalleryGrid
                {...gridProps}
                items={items.filter((it) => it.category === code)}
                // Only the last section carries it, so a page split into
                // four groups still has one "show more" rather than four
                // buttons all doing the same thing.
                canLoadMore={i === disciplines.length - 1 && page < pages}
                loading={loading}
                onLoadMore={loadMore}
              />
            </div>
          ))
        ) : (
          <GalleryGrid
            {...gridProps}
            items={items}
            arrangement={layout === 'sheet' ? 'squares' : 'masonry'}
            canLoadMore={page < pages}
            loading={loading}
            onLoadMore={loadMore}
          />
        )}

        <RemovedDrawer
          username={username}
          likes={likes}
          onRestored={refresh}
          reloadToken={removedToken}
        />

        <div className="cta-row" style={{ marginTop: '3.5rem' }}>
          <a
            className="cta-primary"
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            Share your work through Spotlight
          </a>
        </div>
      </section>

      {draft && (
        <PortfolioEditor
          layout={draft.layout}
          accent={draft.accent}
          onPreview={setDraft}
          onClose={() => setDraft(null)}
          onSaved={(next) => { setSaved(next); setDraft(null); }}
        />
      )}

      {layout !== 'classic' && <PortfolioLayoutStyles />}
      <ShowcaseStyles />
    </div>
  );
}
