'use client';

import React, { useCallback, useState } from 'react';
import GalleryGrid from './Gallery';
import ShowcaseStyles from './styles';
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
  const likes = useLikes();

  const author = initialData?.author;
  const profile = initialData?.profile;
  const name = author?.name || username;

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), author: username });
      const res = await fetch(`${SHOWCASE_API_URL}?${params}`);
      if (!res.ok) throw new Error(`portfolio fetch ${res.status}`);
      const data: ShowcaseData = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      // Keep what we have; the button stays available to retry.
    } finally {
      setLoading(false);
    }
  }, [page, username]);

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
          {profile && (
            <span
              className="pf-verified"
              role="img"
              aria-label="Verified creator, ownership confirmed via Discord"
              title="This creator verified ownership via Discord"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <defs>
                  <linearGradient id="pf-verified-gold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffe9b8" />
                    <stop offset="45%" stopColor="#ffd98a" />
                    <stop offset="100%" stopColor="#e8b95e" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#pf-verified-gold)"
                  d="M12 1l2.4 2.1 3.1-.5 1.2 2.9 2.9 1.2-.5 3.1L23 12l-2.1 2.4.5 3.1-2.9 1.2-1.2 2.9-3.1-.5L12 23l-2.4-2.1-3.1.5-1.2-2.9L2.4 17.3l.5-3.1L1 12l2.1-2.4-.5-3.1 2.9-1.2 1.2-2.9 3.1.5L12 1z"
                />
                <path
                  fill="#0a0a0f"
                  d="M10.6 16.1l-3.5-3.5 1.5-1.5 2 2 4.9-4.9 1.5 1.5z"
                />
              </svg>
            </span>
          )}
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
