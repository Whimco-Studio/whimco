import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import GlassNav from '../../../components/GlassNav';
import PostPermalink from '../../PostPermalink';
import {
  CATEGORY_LABELS, cleanCaption, fetchShowcaseItem, postPath,
} from '../../constants';

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

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const item = await fetchShowcaseItem(params.id); // deduped with the page fetch
  if (!item) {
    return { title: 'Creation not found — Spotlight | Whimco', robots: { index: false } };
  }

  const label = item.category ? (CATEGORY_LABELS[item.category] ?? item.category) : '';
  const title = label
    ? `${label} by ${item.author_name} — Spotlight`
    : `Creation by ${item.author_name} — Spotlight`;
  const caption = cleanCaption(item.content || '');
  const description = caption
    || `Shared by ${item.author_name} and broadcast across the Spotlight network.`;

  return {
    title: `${title} | Whimco`,
    description,
    alternates: { canonical: postPath(item.id) },
    // video.twimg.com 403s any request carrying a foreign Referer, so this
    // page must send none for inline X video playback to work, the same as
    // the showcase, the gallery and the feed.
    referrer: 'no-referrer',
    // No images key. The sibling opengraph-image.tsx supplies it, and
    // naming one here would win over the generated card and put the
    // Spotlight logo in every unfurl instead of the creation.
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const item = await fetchShowcaseItem(params.id);
  // Unknown, hidden, author-removed and banned all arrive here as null,
  // which is the backend refusing to say which. Rendering anything other
  // than a plain 404 would say it for them.
  if (!item) notFound();

  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <PostPermalink item={item} />
    </div>
  );
}
