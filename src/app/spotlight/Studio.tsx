'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import GalleryGrid from './Gallery';
import ShowcaseStyles from './styles';
import StudioStyles from './studioStyles';
import VerifiedSeal from './VerifiedSeal';
import useLikes from './useLikes';
import { CATEGORY_LABELS, SHOWCASE_API_URL, ShowcaseData, ShowcaseServer } from './constants';

const nf = new Intl.NumberFormat('en-US');

/** A server's icon, or a monogram of its first character when it has
    none or the bot has left and Discord no longer tells us. */
function ServerIcon({ server }: { server: ShowcaseServer }) {
  if (server.icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="st-icon" src={server.icon} alt="" referrerPolicy="no-referrer" />
    );
  }
  const initial = (Array.from(server.name ?? '')[0] ?? '#').toUpperCase();
  return <span className="st-icon st-monogram" aria-hidden="true">{initial}</span>;
}

/** One person on the server's roster. Links to their own portfolio,
    because the page is the server's and the person is still the author:
    the chip is where the credit lives, not the card. */
function Person({ p }: { p: ShowcaseServer['people'][number] }) {
  const initial = (Array.from(p.name)[0] ?? '?').toUpperCase();
  return (
    <a className="st-person" href={`/spotlight/@${encodeURIComponent(p.name)}`}>
      {p.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="st-avatar" src={p.avatar_url} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span className="st-avatar st-avatar-mono" aria-hidden="true">{initial}</span>
      )}
      <span className="st-person-name">
        {p.name}
        {p.claimed && <VerifiedSeal className="st-seal" />}
      </span>
      <span className="st-person-n">{p.creations}</span>
    </a>
  );
}

export default function Studio({
  serverId, initialData,
}: {
  serverId: string;
  initialData: ShowcaseData | null;
}) {
  const server = initialData?.server ?? null;
  const [category, setCategory] = useState('');
  const [items, setItems] = useState(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [loading, setLoading] = useState(false);
  const likes = useLikes();

  // Guards the fetches against each other, as Portfolio.tsx does: a tab
  // change landing after a "show more" must not append page two of one
  // category under page one of another.
  const fetchGen = useRef(0);

  const load = useCallback(async (cat: string, nextPage: number, append: boolean) => {
    const gen = ++fetchGen.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ server: serverId, page: String(nextPage) });
      if (cat) params.set('category', cat);
      const res = await fetch(`${SHOWCASE_API_URL}?${params}`);
      if (!res.ok) throw new Error(`server page fetch ${res.status}`);
      const data: ShowcaseData = await res.json();
      if (fetchGen.current !== gen) return;
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setPage(data.page);
      setPages(data.pages);
    } catch {
      // Keep what is on screen; the button stays available to retry.
    } finally {
      if (fetchGen.current === gen) setLoading(false);
    }
  }, [serverId]);

  const pick = useCallback((cat: string) => {
    setCategory(cat);
    load(cat, 1, false);
  }, [load]);

  // Same mount refresh as a portfolio: the page is served through ISR
  // and the API is current within seconds, so page one is asked for
  // again silently and swapped in.
  useEffect(() => { load('', 1, false); }, [load]);

  if (!server) {
    return (
      <div className="showcase">
        <p className="st-offline">The showcase is momentarily offline. Check back shortly.</p>
        <ShowcaseStyles />
      </div>
    );
  }

  const name = server.name ?? 'A Spotlight server';
  const tabs = [
    { key: '', label: 'All', n: server.creations },
    ...server.categories.map((c) => ({
      key: c.category,
      label: CATEGORY_LABELS[c.category] ?? c.category,
      n: c.count,
    })),
  ];

  return (
    <>
      <ShowcaseStyles />
      <StudioStyles />

      <div className="studiohead">
        <div className="st-band">
          {server.icon && (
            <div className="st-bg" style={{ backgroundImage: `url(${server.icon})` }} />
          )}
          <div className="st-wrap">
            <div className="st-row">
              <ServerIcon server={server} />
              <div className="st-titles">
                {/* A chip beside the name rather than a stripe across the
                    top: the floating nav covers the top of the page, and
                    a disclaimer nobody can read is not a disclaimer. */}
                <span className="st-demo">Private demo, not indexed</span>
                <h1 className="st-name">{name}</h1>
                <p className="st-facts">
                  {server.members > 0 ? (
                    <>
                      <span>Discord community</span>
                      <span className="st-sep">/</span>
                      <span><b>{nf.format(server.members)}</b> members</span>
                      <span className="st-sep">/</span>
                      <span className="st-live">
                        <span className="st-dot" />
                        <b>{nf.format(server.online)}</b> online
                      </span>
                    </>
                  ) : (
                    <span>Discord community</span>
                  )}
                </p>
                <p className="st-work">
                  <b>{nf.format(server.creations)}</b> creation{server.creations === 1 ? '' : 's'}
                  {' by '}
                  <b>{nf.format(server.creators)}</b> creator{server.creators === 1 ? '' : 's'}
                  {server.hearts > 0 && (
                    <>
                      {', '}
                      <b>{nf.format(server.hearts)}</b> heart{server.hearts === 1 ? '' : 's'}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="st-people" aria-label="People who posted here">
              <span className="st-people-l">PEOPLE</span>
              {server.people.map((p) => <Person key={p.name} p={p} />)}
              {server.creators > server.people.length && (
                <span className="st-people-more">
                  and {nf.format(server.creators - server.people.length)} more on the cards below
                </span>
              )}
            </div>
          </div>

          <div className="st-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.key || 'all'}
                type="button"
                role="tab"
                className={`st-tab ${category === t.key ? 'st-tab-on' : ''}`}
                onClick={() => pick(t.key)}
                aria-selected={category === t.key}
              >
                {t.label.toUpperCase()}
                <span className="n">{nf.format(t.n)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="showcase">
        <section className="gallery-section" aria-label={`Creations posted in ${name}`}>
          <GalleryGrid
            items={items}
            likes={likes}
            showAuthor
            deep
            emptyText="Nothing in this category yet."
            canLoadMore={page < pages}
            loading={loading}
            onLoadMore={() => load(category, page + 1, true)}
          />
        </section>
      </div>
    </>
  );
}
