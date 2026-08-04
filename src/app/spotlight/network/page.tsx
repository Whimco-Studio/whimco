import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import GlassNav from '../../components/GlassNav';
import NetworkDirectory from '../NetworkDirectory';
import { NETWORK_API_URL, NetworkData } from '../constants';

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

async function getNetwork(): Promise<NetworkData | null> {
  try {
    const res = await fetch(NETWORK_API_URL, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Spotlight down: render the shell and let Vercel keep serving the
    // last good page, same as the creators directory does.
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getNetwork(); // deduped with the page fetch below
  const total = data?.total ?? 0;
  const description = total > 0
    ? `${total.toLocaleString('en-US')} Discord communities Spotlight broadcasts into.`
    : 'The Discord communities Spotlight broadcasts into.';
  return {
    title: 'The Network: Spotlight | Whimco',
    description,
    referrer: 'no-referrer',
    openGraph: {
      title: 'The Network: Spotlight',
      description,
      images: ['/spotlight-logo.png'],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function NetworkPage() {
  const data = await getNetwork();
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <NetworkDirectory data={data} />
    </div>
  );
}
