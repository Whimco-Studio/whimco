import localFont from 'next/font/local';

/** The site's three faces, from files in this repo. See fonts/README.md
    for why they are not fetched from Google at build time. Each file is
    a variable font, so every weight a page asks for is available without
    listing instances. */

export const display = localFont({
  src: './fonts/BricolageGrotesque-latin.woff2',
  weight: '200 800',
  variable: '--font-display',
  display: 'swap',
});

export const mono = localFont({
  src: './fonts/JetBrainsMono-latin.woff2',
  weight: '100 800',
  variable: '--font-mono',
  display: 'swap',
});

export const inter = localFont({
  src: './fonts/Inter-latin.woff2',
  weight: '100 900',
  display: 'swap',
});
