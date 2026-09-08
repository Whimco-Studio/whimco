import type { Metadata } from 'next';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import Wall from './Wall';
import { SHOWCASE_API_URL, ShowcaseData } from '../../spotlight/constants';
import './wall.css';

/* The site's own faces, not a substitute. Body text inherits whatever
   the root layout loaded, so the chrome reads like the rest of
   whimco.com. Bricolage carries the masthead sentence and the footer
   headline. JetBrains Mono comes back for small labels only, tracked
   at the site's 0.14em: the landing page sets every label at 0.28em,
   which is the loudest quiet type there is, and the wall keeps the
   voice without the volume. */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Spotlight, ArtStation shape',
  robots: { index: false, follow: false },
  // video.twimg.com 403s anything carrying a foreign Referer, and this
  // wall shows the same X-hosted media the live page does.
  referrer: 'no-referrer',
};

export const revalidate = 300;

async function firstPage(): Promise<ShowcaseData | null> {
  try {
    const res = await fetch(SHOWCASE_API_URL, { next: { revalidate: 300 } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function SpotlightWallLab() {
  const data = await firstPage();
  return (
    <div className={`${display.variable} ${mono.variable}`}>
      <Wall initial={data} />
    </div>
  );
}
