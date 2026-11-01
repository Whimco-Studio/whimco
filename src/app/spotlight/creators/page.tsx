import type { Metadata } from 'next';
import { display, mono } from '../../fonts';
import GlassNav from '../../components/GlassNav';
import CreatorsGallery from '../CreatorsGallery';
import { CREATORS_API_URL, CreatorsData } from '../constants';

export const revalidate = 300;

type Props = { searchParams?: { page?: string } };

/** ?page=N renders that page of the directory on the server. It is what
    the "show more" link points at, so a crawler can walk the whole
    directory, and a person who opens it gets that page with a way back. */
function pageOf(searchParams?: { page?: string }): number {
  const n = Number.parseInt(searchParams?.page ?? '1', 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

async function getCreators(page = 1): Promise<CreatorsData | null> {
  try {
    const url = page > 1 ? `${CREATORS_API_URL}?page=${page}` : CREATORS_API_URL;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Spotlight down: render the shell and let Vercel keep serving the
    // last good page, same as the showcase does.
    return null;
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageOf(searchParams);
  const data = await getCreators(page); // deduped with the page fetch below
  const total = data?.total ?? 0;
  const description = total > 0
    ? `${total.toLocaleString('en-US')} Roblox creators sharing VFX, UI, builds, models, animation and scripting across the Spotlight network of Discord servers.`
    : 'The creators sharing work across the Spotlight network.';
  return {
    title: page > 1
      ? `Roblox creators, page ${page} | Spotlight by Whimco`
      : 'Roblox creators: VFX, UI, builders, modelers and more | Spotlight by Whimco',
    description,
    // Each page of the directory lists different people, so each is its
    // own canonical rather than all pointing at page one.
    alternates: { canonical: page > 1 ? `/spotlight/creators?page=${page}` : '/spotlight/creators' },
    referrer: 'no-referrer',
    openGraph: {
      title: 'The Creators — Spotlight',
      description,
      images: ['/spotlight-logo.png'],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function CreatorsPage({ searchParams }: Props) {
  const data = await getCreators(pageOf(searchParams));
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <CreatorsGallery initialData={data} />
    </div>
  );
}
