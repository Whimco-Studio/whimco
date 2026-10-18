import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { display, mono } from '../../../fonts';
import GlassNav from '../../../components/GlassNav';
import Studio from '../../Studio';
import { SHOWCASE_API_URL, ShowcaseData } from '../../constants';

/* A server's page: every creation posted in one Discord server, with
   the people who posted them. Studio servers and community servers get
   the same page; the subject is the server, the work is what it already
   broadcast, so nothing is asked of anyone. Linked from the network
   directory for every server with something posted. See brain 432 for
   why this and not a game page. */

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
  const s = data?.server;
  const name = s?.name ?? 'A Spotlight server';
  const description = s
    ? `${s.creations.toLocaleString('en-US')} creation${s.creations === 1 ? '' : 's'} by `
      + `${s.creators.toLocaleString('en-US')} creator${s.creators === 1 ? '' : 's'}, `
      + `posted in ${name} and shared through Spotlight.`
    : 'Work posted in a Discord server and shared through Spotlight.';
  return {
    title: `${name}: Spotlight | Whimco`,
    description,
    // video.twimg.com 403s any request carrying a foreign Referer, and
    // the grid plays X video inline, same as every page that renders it.
    referrer: 'no-referrer',
    openGraph: {
      title: `${name}: Spotlight`,
      description,
      images: [s?.icon ?? '/spotlight-logo.png'],
    },
    twitter: { card: 'summary' },
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
