import type { Metadata } from 'next';
import { Archivo, Bricolage_Grotesque } from 'next/font/google';
import Wall from './Wall';
import { SHOWCASE_API_URL, ShowcaseData } from '../../spotlight/constants';
import './wall.css';

/* Archivo, not the site's Bricolage, and no JetBrains Mono anywhere.
   The reference's chrome recedes: 12 to 13px, regular weight, sentence
   case, no tracking. Today every label on /spotlight is monospace with
   0.28em of letterspacing, which is the loudest quiet type there is, so
   the typeface is part of the proposal rather than incidental to it.
   Bricolage survives in one place, the footer headline, so the brand
   thread does not snap. */
const chrome = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-chrome',
  display: 'swap',
});
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-display',
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
    <div className={`${chrome.variable} ${display.variable}`}>
      <Wall initial={data} />
    </div>
  );
}
