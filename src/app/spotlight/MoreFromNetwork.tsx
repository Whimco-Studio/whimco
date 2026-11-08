import {
  CATEGORY_LABELS, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem, isIndexablePost, postPath,
} from './constants';

const PER_LIST = 6;

async function getPage(page: number): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(`${SHOWCASE_API_URL}?page=${page}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function pick(items: ShowcaseItem[], exclude: Set<number>): ShowcaseItem[] {
  const out: ShowcaseItem[] = [];
  for (const it of items) {
    if (out.length >= PER_LIST) break;
    if (exclude.has(it.id) || !isIndexablePost(it)) continue;
    exclude.add(it.id);
    out.push(it);
  }
  return out;
}

function label(it: ShowcaseItem): string {
  const craft = it.category ? (CATEGORY_LABELS[it.category] ?? it.category) : 'Creation';
  return `${craft} by ${it.author_name}`;
}

/** Links out from every permalink to the newest work and to a slice of
    older work picked by the day, so a crawler landing anywhere can reach
    creations and creators that no "related" module would ever surface.
    A related list only joins popular pages to popular pages and leaves
    new ones orphaned (Product-Led SEO, the point-to-point route map).

    The older slice is a gallery page chosen from the date and this
    creation's id: stable for a day, so it caches, and different across
    pages and days, so over time every page gets linked. Rendered on the
    server as plain links; nothing here needs JavaScript. */
export default async function MoreFromNetwork({ currentId }: { currentId: number }) {
  const recent = await getPage(1);
  if (!recent || recent.items.length === 0) return null;

  const day = Math.floor(Date.now() / 86_400_000);
  const pages = Math.max(1, recent.pages);
  const olderPage = pages > 1 ? 2 + ((day * 31 + currentId) % (pages - 1)) : 1;
  const older = olderPage === 1 ? null : await getPage(olderPage);

  const seen = new Set<number>([currentId]);
  const newest = pick(recent.items, seen);
  const fromArchive = older ? pick(older.items, seen) : [];
  if (newest.length === 0 && fromArchive.length === 0) return null;

  return (
    <nav className="more-network" aria-label="More creations from the Spotlight network">
      <style>{`
        .more-network { max-width: 46rem; margin: 0 auto; padding: 1rem 1.25rem 4rem; color: #9aa0b4; }
        .more-network h2 { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; margin: 1.6rem 0 0.6rem; color: #9aa0b4; font-weight: 600; }
        .more-network ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.35rem; }
        .more-network a { color: #e6e8f0; text-decoration: none; font-size: 0.92rem; }
        .more-network a:hover { text-decoration: underline; text-underline-offset: 3px; }
        .more-network .all { display: inline-block; margin-top: 1.4rem; font-size: 0.8rem; color: #ffd98a; }
      `}</style>
      {newest.length > 0 && (
        <>
          <h2>New on Spotlight</h2>
          <ul>
            {newest.map((it) => (
              <li key={it.id}><a href={postPath(it.id)}>{label(it)}</a></li>
            ))}
          </ul>
        </>
      )}
      {fromArchive.length > 0 && (
        <>
          <h2>From the archive</h2>
          <ul>
            {fromArchive.map((it) => (
              <li key={it.id}><a href={postPath(it.id)}>{label(it)}</a></li>
            ))}
          </ul>
        </>
      )}
      <a className="all" href="/spotlight/creators">Browse every creator →</a>
    </nav>
  );
}
