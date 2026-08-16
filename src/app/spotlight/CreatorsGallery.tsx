'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import CreatorsStyles from './creatorsStyles';
import ShowcaseStyles from './styles';
import VerifiedSeal from './VerifiedSeal';
import {
  CATEGORY_LABELS, CREATORS_API_URL, Creator, CreatorsData,
} from './constants';

/** Monogram stand-in for the ~80% of creators who have not claimed a
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
          // A cover whose presigned URL expired before the page was
          // reopened otherwise paints its alt text across the whole tile,
          // which reads as a broken card rather than a missing image.
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        />
      ))}
    </div>
  );
}

/** What this creator actually does, as a share of their own output.

    "UI, 10 of 10" separates someone who does this for a living from
    someone who posted one mock in March, and no count of hearts or
    creations can express that difference. Under a filter it reports the
    filtered discipline; with none it reports whichever they post most. */
function Specialty({ creator, active }: { creator: Creator; active: string }) {
  const entries = Object.entries(creator.cats ?? {});
  if (entries.length === 0) return null;
  const code = active && creator.cats[active]
    ? active
    : entries.reduce((best, e) => (e[1][0] > best[1][0] ? e : best))[0];
  const n = creator.cats[code][0];
  const share = n / creator.creations;
  return (
    <p className={`cr-spec ${share >= 0.7 ? 'cr-spec-strong' : ''}`}>
      <b>{CATEGORY_LABELS[code] ?? code}</b>
      {' · '}
      {n} of {creator.creations}
      {share >= 0.7 && n >= 3 && <span className="cr-spec-tag">SPECIALIST</span>}
    </p>
  );
}

function CreatorCard({ creator, active }: { creator: Creator; active: string }) {
  const { name, creations, hearts, claimed, avatar_url: avatar, covers } = creator;
  return (
    <a
      className="cr-card"
      href={`/spotlight/@${encodeURIComponent(name)}`}
      aria-label={`${name}, ${creations} creation${creations === 1 ? '' : 's'}, ${hearts} heart${hearts === 1 ? '' : 's'}`}
    >
      <CoverMosaic covers={covers} name={name} />
      <div className="cr-body">
        <div className="cr-identity">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="cr-avatar" src={avatar} alt="" referrerPolicy="no-referrer" />
          ) : (
            <Monogram name={name} />
          )}
          <span className="cr-name">{name}</span>
          {claimed && <VerifiedSeal className="cr-seal" />}
        </div>
        <Specialty creator={creator} active={active} />
        {creator.bio && <p className="cr-bio">{creator.bio}</p>}
        <p className="cr-stats">
          <b>{creations.toLocaleString('en-US')}</b> creation{creations === 1 ? '' : 's'}
          {' · '}
          <b>{hearts.toLocaleString('en-US')}</b> heart{hearts === 1 ? '' : 's'}
        </p>
        {creator.contact && <p className="cr-contact">↳ {creator.contact}</p>}
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
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(false);

  // Facets come from the network rather than the filtered set, so the row
  // is the same whichever chip is lit. Held from the first response that
  // carried them, which keeps the row from flickering between fetches.
  const [facets, setFacets] = useState(initialData?.categories ?? []);

  // Same guard as the showcase and the portfolio: a filter change and a
  // "show more" can be in flight together, and without this whichever
  // lands last wins regardless of which was asked for last.
  const fetchGen = useRef(0);

  const fetchPage = useCallback(async (
    next: number, category: string, append: boolean,
  ) => {
    const gen = ++fetchGen.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(next) });
      if (category) params.set('category', category);
      const res = await fetch(`${CREATORS_API_URL}?${params}`);
      if (!res.ok) throw new Error(`creators fetch ${res.status}`);
      const data: CreatorsData = await res.json();
      if (fetchGen.current !== gen) return;
      setCreators((prev) => {
        if (!append) return data.creators;
        // Guard against a creator arriving twice if the underlying
        // ordering shifted between page fetches.
        const seen = new Set(prev.map((c) => c.name));
        return [...prev, ...data.creators.filter((c) => !seen.has(c.name))];
      });
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
      if (data.categories?.length) setFacets(data.categories);
    } catch {
      // Leave what is already on screen; the button stays available.
    } finally {
      if (fetchGen.current === gen) setLoading(false);
    }
  }, []);

  const pick = useCallback((category: string) => {
    setActive(category);
    const url = new URL(window.location.href);
    if (category) url.searchParams.set('category', category);
    else url.searchParams.delete('category');
    window.history.replaceState({}, '', url);
    fetchPage(1, category, false);
  }, [fetchPage]);

  // Shareable filtered views: /spotlight/creators?category=ui opens on that
  // discipline. The page itself is statically rendered with a five minute
  // window, so the filter can only be applied here.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('category');
    if (!fromUrl) return;
    setActive(fromUrl);
    fetchPage(1, fromUrl, false);
  }, [fetchPage]);

  const label = active ? (CATEGORY_LABELS[active] ?? active) : '';

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
              <b>{total.toLocaleString('en-US')}</b>
              {active
                ? ` creator${total === 1 ? '' : 's'} posting ${label}`
                : ' creators sharing work across the network'}
            </>
          ) : (
            'The directory is momentarily offline, check back shortly.'
          )}
        </p>

        {facets.length > 0 && (
          <div className="chips" role="group" aria-label="Filter by discipline">
            <button
              type="button"
              className={`chip ${active === '' ? 'chip-on' : ''}`}
              onClick={() => pick('')}
            >
              ALL
            </button>
            {facets.map((f) => (
              <button
                key={f.category}
                type="button"
                className={`chip ${active === f.category ? 'chip-on' : ''}`}
                onClick={() => pick(f.category)}
              >
                {(CATEGORY_LABELS[f.category] ?? f.category).toUpperCase()} {f.creators}
              </button>
            ))}
          </div>
        )}
      </header>

      <section className="cr-grid" aria-label="Creators on the Spotlight network">
        {creators.map((c) => (
          <CreatorCard key={c.name} creator={c} active={active} />
        ))}
      </section>

      {creators.length === 0 && !loading && total === 0 && active && (
        <p className="cr-empty">Nobody has posted {label} yet.</p>
      )}

      {page < pages && (
        <div className="cr-more">
          <button
            type="button"
            onClick={() => fetchPage(page + 1, active, true)}
            disabled={loading}
          >
            {loading ? 'LOADING…' : 'SHOW MORE CREATORS'}
          </button>
        </div>
      )}
    </div>
  );
}
