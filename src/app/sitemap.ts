import type { MetadataRoute } from 'next';
import {
  CATEGORY_LABELS, SITE_ORIGIN, SITEMAP_API_URL, SitemapData,
  isIndexablePortfolio, portfolioPath, postPath,
} from './spotlight/constants';

/** Rebuilt at most hourly. The API side is cached for the same hour per
    showcase generation, so this costs one request an hour. */
export const revalidate = 3600;

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: '/', priority: 1 },
  { path: '/spotlight', priority: 0.9 },
  { path: '/spotlight/creators', priority: 0.8 },
  { path: '/spotlight/gallery', priority: 0.8 },
  { path: '/spotlight/network', priority: 0.6 },
  { path: '/experiences', priority: 0.6 },
  { path: '/about', priority: 0.5 },
  { path: '/privacy', priority: 0.2 },
  { path: '/terms', priority: 0.2 },
];

async function getSitemapData(): Promise<SitemapData | null> {
  try {
    const res = await fetch(SITEMAP_API_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority }) => ({
    url: `${SITE_ORIGIN}${path}`,
    priority,
  }));

  // One gallery view per discipline: these are the pages that answer
  // "Roblox VFX" or "Roblox UI" searches across the whole network.
  for (const code of Object.keys(CATEGORY_LABELS)) {
    pages.push({
      url: `${SITE_ORIGIN}/spotlight/gallery?category=${code}`,
      priority: 0.6,
    });
  }

  const data = await getSitemapData();
  // Spotlight down: serve the static part rather than an empty sitemap.
  if (!data) return pages;

  // Only portfolios the page itself lets search engines index, and only
  // their creations. Listing a noindexed URL here would send the crawler
  // to a page that then tells it to go away.
  for (const c of data.creators) {
    if (!isIndexablePortfolio(c.creations, c.claimed)) continue;
    pages.push({
      url: `${SITE_ORIGIN}${portfolioPath(c.name)}`,
      lastModified: c.lastmod,
      priority: c.claimed ? 0.7 : 0.5,
    });
    for (const [id, date] of c.items) {
      pages.push({
        url: `${SITE_ORIGIN}${postPath(id)}`,
        lastModified: date,
        priority: 0.4,
      });
    }
  }
  return pages;
}
