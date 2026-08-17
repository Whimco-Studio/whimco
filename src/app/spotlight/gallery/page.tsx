import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import GlassNav from '../../components/GlassNav';
import GalleryBrowser from '../GalleryBrowser';
import {
  CATEGORY_LABELS, SHOWCASE_API_URL, ShowcaseData, SortMode, creationsIn,
} from '../constants';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-display',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
});

export const revalidate = 300;

type RawParams = { [key: string]: string | string[] | undefined };

type View = { page: number; category: string; sort: SortMode };

/** Reading a search param is reading attacker-controlled text, and these
    three reach a fetch URL, a page title and a canonical tag. Narrowed
    here rather than passed through: an unrecognised category becomes the
    unfiltered gallery, an unrecognised sort becomes the default, and the
    page number is bounded so a crafted ?page=1e9 cannot ask the backend
    to count its way to an offset that does not exist. */
function readView(raw: RawParams): View {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const n = Number.parseInt(first(raw.page) ?? '1', 10);
  const category = first(raw.category) ?? '';
  return {
    page: Number.isFinite(n) && n > 1 ? Math.min(n, 999) : 1,
    category: CATEGORY_LABELS[category] ? category : '',
    sort: first(raw.sort) === 'top' ? 'top' : 'new',
  };
}

/** The path for a view, matching viewHref in GalleryBrowser. Two copies
    because one runs on the server for the canonical tag and the other in
    the browser for the controls; they are checked against each other by
    the fact that a mismatch would show up as a canonical pointing at a
    different view than the one rendered. */
function viewPath({ page, category, sort }: View): string {
  const p = new URLSearchParams();
  if (page > 1) p.set('page', String(page));
  if (category) p.set('category', category);
  if (sort !== 'new') p.set('sort', sort);
  const q = p.toString();
  return q ? `/spotlight/gallery?${q}` : '/spotlight/gallery';
}

async function getShowcase(view: View): Promise<ShowcaseData | null> {
  const params = new URLSearchParams({ page: String(view.page) });
  if (view.category) params.set('category', view.category);
  if (view.sort !== 'new') params.set('sort', view.sort);
  try {
    const res = await fetch(`${SHOWCASE_API_URL}?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Spotlight down: render the shell and let the browser retry, same as
    // the showcase and the creator directory do.
    return null;
  }
}

export async function generateMetadata(
  { searchParams }: { searchParams: RawParams },
): Promise<Metadata> {
  const view = readView(searchParams);
  const data = await getShowcase(view); // deduped with the page fetch below
  const label = view.category ? (CATEGORY_LABELS[view.category] ?? '') : '';
  const total = data?.total ?? 0;

  const description = total > 0
    ? `${total.toLocaleString('en-US')} ${creationsIn(total, view.category)}, broadcast across the Spotlight network from every connected Discord server.`
    : 'Every creation broadcast across the Spotlight network.';

  const titleParts = [label || 'The Gallery'];
  if (view.sort === 'top') titleParts.push('Top This Week');
  if (view.page > 1) titleParts.push(`Page ${view.page}`);

  return {
    title: `${titleParts.join(' · ')} — Spotlight | Whimco`,
    description,
    // Paginated views self-canonicalise rather than all pointing at page
    // one: they hold different creations, and collapsing them would tell
    // a crawler that everything past the first 24 is a duplicate.
    alternates: { canonical: viewPath(view) },
    // video.twimg.com 403s any request carrying a foreign Referer, so this
    // page must send none for inline X video playback to work, the same as
    // the showcase.
    referrer: 'no-referrer',
    openGraph: {
      title: `${label || 'The Gallery'} — Spotlight`,
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
      <GlassNav />
      <GalleryBrowser
        initialData={data}
        initialPage={view.page}
        initialCategory={view.category}
        initialSort={view.sort}
      />
    </div>
  );
}
