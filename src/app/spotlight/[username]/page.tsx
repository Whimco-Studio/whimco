import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import GlassNav from '../../components/GlassNav';
import Portfolio from '../Portfolio';
import { parseUsername, SHOWCASE_API_URL, ShowcaseData } from '../constants';

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

type Params = { params: { username: string } };

async function getPortfolio(name: string): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(
      `${SHOWCASE_API_URL}?author=${encodeURIComponent(name)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const name = parseUsername(params.username);
  if (!name) return { title: 'Spotlight | Whimco' };
  const data = await getPortfolio(name);
  const a = data?.author;
  const canonical = a?.name || name;
  const description = a && a.creations > 0
    ? `${a.creations} creation${a.creations === 1 ? '' : 's'} by ${canonical}, broadcast across the Spotlight network with ${a.hearts} hearts.`
    : `Creations by ${canonical} on the Spotlight network.`;
  return {
    title: `${canonical} — Spotlight Portfolio | Whimco`,
    description,
    referrer: 'no-referrer',
    // og:image comes from opengraph-image.tsx — a live composite of the
    // creator's top posts, so Discord/X embeds preview their actual work.
    openGraph: {
      title: `${canonical} — Spotlight Portfolio`,
      description,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function PortfolioPage({ params }: Params) {
  const name = parseUsername(params.username);
  if (!name) notFound();
  const data = await getPortfolio(name);
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <Portfolio username={name} initialData={data} />
    </div>
  );
}
