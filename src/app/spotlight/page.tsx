import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import GlassNav from '../components/GlassNav';
import Showcase from './Showcase';
import HowItWorks from './HowItWorks';
import { SHOWCASE_API_URL, ShowcaseData } from './constants';

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

async function getShowcase(): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(SHOWCASE_API_URL, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Spotlight down: the page still renders hero + how-it-works, and
    // Vercel keeps serving the last successful render until it recovers.
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getShowcase(); // deduped with the page fetch below
  const s = data?.stats;
  const description = s && s.member_reach > 0
    ? `Real creations broadcast to ${s.server_count} connected Discord servers, reaching ${s.member_reach.toLocaleString('en-US')} members. Post once, broadcast everywhere.`
    : "Spotlight broadcasts creators' posts from #creations channels to showcase channels across every connected Discord server.";
  return {
    title: 'Spotlight — Post Once, Broadcast Everywhere | Whimco',
    description,
    // video.twimg.com 403s any request carrying a foreign Referer, so the
    // whole page must send none for inline X video playback to work.
    referrer: 'no-referrer',
    openGraph: {
      title: 'Spotlight — Post Once, Broadcast Everywhere',
      description,
      images: ['/spotlight-logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Spotlight — Post Once, Broadcast Everywhere',
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
      <Showcase initialData={data} />
      <div
        style={{
          textAlign: 'center',
          padding: '4.5rem 1.5rem 0',
          background: '#0a0a0f',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.28em',
            color: '#9ba0b4',
            margin: 0,
          }}
        >
          HOW IT WORKS
        </p>
      </div>
      <HowItWorks />
    </div>
  );
}
