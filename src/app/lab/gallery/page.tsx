import type { Metadata } from 'next';
import { display, mono } from '../../fonts';
import GalleryBrowser from '../../spotlight/GalleryBrowser';
import { RawParams, getShowcase, readView } from '../../spotlight/galleryView';

/** A demo of the gallery shaped like Pinterest: search pinned at the top,
    categories as one row of words, an image-only wall up to seven
    columns wide. Same data, search, hearts and lightbox as
    /spotlight/gallery. Under /lab, so robots.txt already keeps crawlers
    out, and noindexed here as well; nothing on the site links to it. */
export const metadata: Metadata = {
  title: 'Gallery layout demo',
  robots: { index: false, follow: false },
  // Same reason as the live gallery: video.twimg.com refuses requests
  // carrying a foreign Referer.
  referrer: 'no-referrer',
};

export const revalidate = 300;

export default async function GalleryDemoPage(
  { searchParams }: { searchParams: RawParams },
) {
  const view = readView(searchParams);
  const data = await getShowcase(view);
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GalleryBrowser
        variant="pins"
        basePath="/lab/gallery"
        initialData={data}
        initialPage={view.page}
        initialCategory={view.category}
        initialSort={view.sort}
        initialQuery={view.q}
      />
    </div>
  );
}
