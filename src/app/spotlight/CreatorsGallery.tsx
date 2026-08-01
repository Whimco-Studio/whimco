'use client';

import React, { useCallback, useState } from 'react';
import CreatorsStyles from './creatorsStyles';
import ShowcaseStyles from './styles';
import VerifiedSeal from './VerifiedSeal';
import { CREATORS_API_URL, Creator, CreatorsData } from './constants';

/** Monogram stand-in for the ~98% of creators who have not claimed a
    profile and so have no Discord avatar to show. */
function Monogram({ name }: { name: string }) {
  const initial = (Array.from(name)[0] ?? '?').toUpperCase();
  return <span className="cr-monogram" aria-hidden="true">{initial}</span>;
}

function CoverMosaic({ covers, name }: { covers: string[]; name: string }) {
  if (covers.length === 0) {
    return <div className="cr-cover cr-cover-empty" aria-hidden="true" />;
  }
  return (
    <div className={`cr-cover cr-cover-${Math.min(covers.length, 3)}`}>
      {covers.slice(0, 3).map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt={i === 0 ? `Work by ${name}` : ''}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ))}
    </div>
  );
}

function CreatorCard({ creator }: { creator: Creator }) {
  const { name, creations, hearts, claimed, avatar_url, covers } = creator;
  return (
    <a
      className="cr-card"
      href={`/spotlight/@${encodeURIComponent(name)}`}
      aria-label={`${name}, ${creations} creation${creations === 1 ? '' : 's'}, ${hearts} heart${hearts === 1 ? '' : 's'}`}
    >
      <CoverMosaic covers={covers} name={name} />
      <div className="cr-body">
        <div className="cr-identity">
          {avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cr-avatar" src={avatar_url} alt="" referrerPolicy="no-referrer" />
          ) : (
            <Monogram name={name} />
          )}
          <span className="cr-name">{name}</span>
          {claimed && <VerifiedSeal className="cr-seal" />}
        </div>
        <p className="cr-stats">
          <b>{creations.toLocaleString('en-US')}</b> creation{creations === 1 ? '' : 's'}
          {' · '}
          <b>{hearts.toLocaleString('en-US')}</b> heart{hearts === 1 ? '' : 's'}
        </p>
      </div>
    </a>
  );
}

export default function CreatorsGallery({
  initialData,
}: {
  initialData: CreatorsData | null;
}) {
  const [creators, setCreators] = useState<Creator[]>(initialData?.creators ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [loading, setLoading] = useState(false);
  const pages = initialData?.pages ?? 1;
  const total = initialData?.total ?? 0;

  const loadMore = useCallback(async () => {
    if (loading || page >= pages) return;
    setLoading(true);
    try {
      const res = await fetch(`${CREATORS_API_URL}?page=${page + 1}`);
      if (res.ok) {
        const data: CreatorsData = await res.json();
        // Guard against a creator arriving twice if the underlying
        // ordering shifted between page fetches.
        setCreators((prev) => {
          const seen = new Set(prev.map((c) => c.name));
          return [...prev, ...data.creators.filter((c) => !seen.has(c.name))];
        });
        setPage(data.page);
      }
    } catch {
      // Leave what is already on screen; the button stays available.
    } finally {
      setLoading(false);
    }
  }, [loading, page, pages]);

  return (
    <div className="showcase">
      <ShowcaseStyles />
      <CreatorsStyles />

      <header className="cr-head">
        <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
        <h1 className="cr-title">THE CREATORS</h1>
        <p className="cr-sub">
          {total > 0 ? (
            <>
              <b>{total.toLocaleString('en-US')}</b> creators sharing work across the network
            </>
          ) : (
            'The directory is momentarily offline — check back shortly.'
          )}
        </p>
      </header>

      <section className="cr-grid" aria-label="Creators on the Spotlight network">
        {creators.map((c) => (
          <CreatorCard key={c.name} creator={c} />
        ))}
      </section>

      {page < pages && (
        <div className="cr-more">
          <button type="button" onClick={loadMore} disabled={loading}>
            {loading ? 'LOADING…' : 'SHOW MORE CREATORS'}
          </button>
        </div>
      )}
    </div>
  );
}
