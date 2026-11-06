import type { Metadata } from 'next';
import { display, mono } from '../../fonts';
import GlassNav from '../../components/GlassNav';
import HowItWorksSimple from '../HowItWorksSimple';
import { SHOWCASE_API_URL, ShowcaseData } from '../constants';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'How Spotlight Works | Whimco',
  description: "Post once in your server's #creations channel and Spotlight carries it to showcase channels across every connected Discord server.",
  alternates: { canonical: '/spotlight/how-it-works' },
  // Same reason as the landing page: inline X video needs no Referer.
  referrer: 'no-referrer',
};

async function getShowcase(): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(SHOWCASE_API_URL, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** A real creation for the loop, so it demonstrates the product instead of
    diagramming it. Prefers a still; null renders a gradient stand-in. */
function pickSample(data: ShowcaseData | null) {
  for (const item of data?.items ?? []) {
    const media = item.media?.[0];
    if (!media) continue;
    const image = media.thumbnail
      ?? (media.content_type?.startsWith('image/') ? media.url : null);
    if (image) return { image, author: item.author_name };
  }
  return null;
}

export default async function HowItWorksPage() {
  const data = await getShowcase();
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <div style={{ textAlign: 'center', padding: '7rem 1.5rem 0' }}>
        <h1
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.28em',
            color: '#9ba0b4',
            fontWeight: 400,
            margin: 0,
          }}
        >
          HOW IT WORKS
        </h1>
      </div>
      <HowItWorksSimple stats={data?.stats ?? null} sample={pickSample(data)} />
    </div>
  );
}
