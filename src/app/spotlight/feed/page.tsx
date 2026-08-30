import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import GlassNav from '../../components/GlassNav';
import FeedStream from '../FeedStream';
import { SHOWCASE_API_URL, ShowcaseData } from '../constants';

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

/* Shorter than the gallery's 300s. This page's whole claim is that it
   shows what just landed, and a five minute cache would make the first
   paint older than the poll interval that runs after it. */
export const revalidate = 60;

async function getShowcase(): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(`${SHOWCASE_API_URL}?sort=new&page=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Spotlight down: render the shell and let the browser poll, the same
    // as the showcase, the gallery and the creator directory do.
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getShowcase(); // deduped with the page fetch below
  const total = data?.total ?? 0;
  const description = total > 0
    ? `A live timeline of every creation broadcast across the Spotlight network, newest first. ${total.toLocaleString('en-US')} creations and counting.`
    : 'A live timeline of every creation broadcast across the Spotlight network, newest first.';

  return {
    title: 'The Feed — Spotlight | Whimco',
    description,
    alternates: { canonical: '/spotlight/feed' },
    // video.twimg.com 403s any request carrying a foreign Referer, so this
    // page must send none for inline X video playback to work, the same as
    // the showcase and the gallery.
    referrer: 'no-referrer',
    openGraph: {
      title: 'The Feed — Spotlight',
      description,
      images: ['/spotlight-logo.png'],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function FeedPage() {
  const data = await getShowcase();
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <FeedStream initialData={data} />
    </div>
  );
}
