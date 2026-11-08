import type { Metadata } from 'next';
import { display, mono } from '../fonts';
import GlassNav from '../components/GlassNav';
import Showcase from './Showcase';
import SpotlightIntro from './SpotlightIntro';
import { SHOWCASE_API_URL, ShowcaseData } from './constants';

export const revalidate = 300;

async function getShowcase(): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(SHOWCASE_API_URL, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Spotlight down: the page still renders the hero, and
    // Vercel keeps serving the last successful render until it recovers.
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getShowcase(); // deduped with the page fetch below
  const s = data?.stats;
  const description = s && s.member_reach > 0
    ? `Real Roblox creations, VFX, builds, UI, scripting and more, shared across ${s.server_count} Roblox dev Discord servers reaching ${s.member_reach.toLocaleString('en-US')} members. Find a creator or add Spotlight to your server.`
    : "Real Roblox creations, VFX, builds, UI, scripting and more, shared across the Roblox dev Discord servers on the Spotlight network.";
  return {
    // Search wants the words people type; social unfurls keep the slogan.
    title: 'Roblox creator showcase: VFX, builds, UI and scripting | Spotlight by Whimco',
    description,
    alternates: { canonical: '/spotlight' },
    // video.twimg.com 403s any request carrying a foreign Referer, so the
    // whole page must send none for inline X video playback to work.
    referrer: 'no-referrer',
    openGraph: {
      title: 'Spotlight: post once, seen everywhere',
      description,
      images: ['/spotlight-logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Spotlight: post once, seen everywhere',
      description,
    },
  };
}

export default async function SpotlightPage() {
  const data = await getShowcase();
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <SpotlightIntro />
      <Showcase initialData={data} />
    </div>
  );
}
