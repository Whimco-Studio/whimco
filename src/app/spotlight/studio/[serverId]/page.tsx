import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { display, mono } from '../../../fonts';
import GlassNav from '../../../components/GlassNav';
import Studio from '../../Studio';
import { SHOWCASE_API_URL, ShowcaseData } from '../../constants';

/* Lab route: a server's page, every creation posted in one Discord
   server with the people who posted them. Studio servers and community
   servers get the same page; the subject is the server, the work is
   what it already broadcast. Private demo, so noindex and nothing links
   here. See brain 432 for why this and not a game page yet. */

export const revalidate = 300;

type Params = { params: { serverId: string } };

/** A Discord snowflake, and nothing else, reaches the API. */
function parseServerId(raw: string): string | null {
  return /^\d{15,22}$/.test(raw) ? raw : null;
}

async function getServerPage(id: string): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(
      `${SHOWCASE_API_URL}?server=${id}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = parseServerId(params.serverId);
  const data = id ? await getServerPage(id) : null;
  const name = data?.server?.name ?? 'A Spotlight server';
  return {
    title: `${name} (demo): Spotlight | Whimco`,
    robots: { index: false, follow: false },
    // video.twimg.com 403s any request carrying a foreign Referer, and
    // the grid plays X video inline, same as every page that renders it.
    referrer: 'no-referrer',
  };
}

export default async function StudioPage({ params }: Params) {
  const id = parseServerId(params.serverId);
  if (!id) notFound();
  const data = await getServerPage(id);
  // A server with no visible creation has no page, and a server that
  // matches nothing is the same 404: the API returns null for both.
  if (data && !data.server) notFound();
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <Studio serverId={id} initialData={data} />
    </div>
  );
}
