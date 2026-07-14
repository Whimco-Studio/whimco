'use client';

import React, { useCallback, useState } from 'react';
import GalleryGrid from './Gallery';
import ShowcaseStyles from './styles';
import {
  INVITE_URL, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem,
} from './constants';

export default function Portfolio({
  username, initialData,
}: { username: string; initialData: ShowcaseData | null }) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialData?.items ?? []);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [pages, setPages] = useState(initialData?.pages ?? 1);
  const [loading, setLoading] = useState(false);

  const author = initialData?.author;
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
        <h1 className="pf-name">{name}</h1>
        {author && (
          <p className="pf-sub">
            <b>{author.creations.toLocaleString('en-US')}</b> creation{author.creations === 1 ? '' : 's'} broadcast
            {' · '}
            <b>{author.hearts.toLocaleString('en-US')}</b> heart{author.hearts === 1 ? '' : 's'} from the network
          </p>
        )}
      </header>

      <section className="gallery-section" aria-label={`Creations by ${name}`}>
        <GalleryGrid
          items={items}
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
