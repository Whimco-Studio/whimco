import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { display, mono } from '../../fonts';
import GlassNav from '../../components/GlassNav';
import Portfolio from '../Portfolio';
import {
  isIndexablePortfolio, parseUsername, portfolioPath, SHOWCASE_API_URL, ShowcaseData,
  topDisciplines,
} from '../constants';

export const revalidate = 300;

type Params = {
  params: { username: string };
  /** ?layout= and ?accent= render this portfolio in another arrangement
      without saving anything, so the shape a creator would get can be
      screenshotted from a real page with real work in it. Read on the
      server, so the first paint is already the requested layout and a
      screenshot never catches a swap. */
  searchParams?: { layout?: string; accent?: string; feature?: string };
};

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

export async function generateMetadata(
  { params, searchParams }: Params,
): Promise<Metadata> {
  const name = parseUsername(params.username);
  if (!name) return { title: 'Spotlight | Whimco' };
  const data = await getPortfolio(name);
  const a = data?.author;
  const canonical = a?.name || name;
  // What they make, named the way someone searching for them would type
  // it: "kruger_xd, Roblox VFX and UI portfolio".
  const disciplines = topDisciplines(data?.items ?? []);
  const craft = disciplines.length ? `Roblox ${disciplines.join(' and ')}` : 'Roblox';
  const description = a && a.creations > 0
    ? `${a.creations} Roblox creation${a.creations === 1 ? '' : 's'} by ${canonical}${disciplines.length ? `, mostly ${disciplines.join(' and ')}` : ''}, shared across the Spotlight network of Discord servers.`
    : `Roblox creations by ${canonical} on the Spotlight network.`;
  const claimed = Boolean(data?.profile);
  const isPreview = Boolean(
    searchParams?.layout || searchParams?.accent || searchParams?.feature,
  );
  // Thin portfolios stay out of search; isIndexablePortfolio is the same
  // rule sitemap.ts applies, so the two never disagree about a page.
  const thin = !a || !isIndexablePortfolio(a.creations, claimed);
  return {
    title: `${canonical}, ${craft} portfolio | Spotlight by Whimco`,
    description,
    alternates: { canonical: portfolioPath(canonical) },
    referrer: 'no-referrer',
    // A preview is the same portfolio wearing another layout. Letting a
    // crawler index one would put four more copies of a creator's page in
    // search results, all outranking each other.
    // Thin portfolios follow the same rule: links on them still count,
    // the page itself is not offered as a result.
    ...(isPreview || thin ? { robots: { index: false, follow: true } } : {}),
    // og:image comes from opengraph-image.tsx — a live composite of the
    // creator's top posts, so Discord/X embeds preview their actual work.
    openGraph: {
      title: `${canonical}, ${craft} portfolio`,
      description,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function PortfolioPage({ params, searchParams }: Params) {
  const name = parseUsername(params.username);
  if (!name) notFound();
  const data = await getPortfolio(name);
  // Display names change on Discord; the API resolves any historical name
  // to the creator's canonical one. Send stale-name URLs there (307, not
  // 308 — a rename back would loop against a browser-cached permanent).
  // A handle with nothing behind it (never posted, or every post gone,
  // and no claimed profile) is a real 404 rather than an empty page that
  // answers 200, which search engines file as a soft 404. data null means
  // the API was unreachable, which is not the same thing and still renders.
  if (data && (data.author?.creations ?? 0) === 0 && !data.profile) notFound();
  const canonical = data?.author?.name;
  if (canonical && canonical !== name) {
    redirect(`/spotlight/@${encodeURIComponent(canonical)}`);
  }
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <Portfolio
        username={name}
        initialData={data}
        previewLayout={searchParams?.layout}
        previewAccent={searchParams?.accent}
        previewFeature={searchParams?.feature}
      />
    </div>
  );
}
