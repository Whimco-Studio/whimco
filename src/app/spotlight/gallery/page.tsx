import type { Metadata } from 'next';
import { display, mono } from '../../fonts';
import GalleryBrowser from '../GalleryBrowser';
import { CATEGORY_LABELS, creationsIn } from '../constants';
import {
  RawParams, getShowcase, readView, viewPath,
} from '../galleryView';

export const revalidate = 300;

export async function generateMetadata(
  { searchParams }: { searchParams: RawParams },
): Promise<Metadata> {
  const view = readView(searchParams);
  const data = await getShowcase(view); // deduped with the page fetch below
  const label = view.category ? (CATEGORY_LABELS[view.category] ?? '') : '';
  const total = data?.total ?? 0;

  const description = total > 0
    ? `${total.toLocaleString('en-US')} ${creationsIn(total, view.category)}, broadcast across the Spotlight network from every connected Discord server.`
    : 'Every Roblox creation shared across the Spotlight network.';

  const titleParts = [label ? `Roblox ${label}` : 'Roblox creations gallery'];
  if (view.sort === 'top') titleParts.push('Top This Week');
  if (view.page > 1) titleParts.push(`Page ${view.page}`);

  return {
    title: `${titleParts.join(' · ')} | Spotlight by Whimco`,
    description,
    // Paginated views self-canonicalise rather than all pointing at page
    // one: they hold different creations, and collapsing them would tell
    // a crawler that everything past the first 24 is a duplicate.
    // A search result points back at the plain view and stays out of the
    // index: every typed query would otherwise be its own thin page.
    alternates: { canonical: viewPath(view) },
    ...(view.q ? { robots: { index: false, follow: true } } : {}),
    // video.twimg.com 403s any request carrying a foreign Referer, so this
    // page must send none for inline X video playback to work, the same as
    // the showcase.
    referrer: 'no-referrer',
    openGraph: {
      title: `${label ? `Roblox ${label}` : 'The Gallery'} | Spotlight`,
      description,
      images: ['/spotlight-logo.png'],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function GalleryPage(
  { searchParams }: { searchParams: RawParams },
) {
  const view = readView(searchParams);
  const data = await getShowcase(view);
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      {/* No GlassNav: the gallery's own top bar carries the site links,
          so the wall starts at the top of the window (brain 658). */}
      <GalleryBrowser
        variant="pins"
        initialData={data}
        initialPage={view.page}
        initialCategory={view.category}
        initialSort={view.sort}
        initialQuery={view.q}
      />
    </div>
  );
}
