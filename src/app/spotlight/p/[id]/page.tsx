import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import GlassNav from '../../../components/GlassNav';
import PostPermalink from '../../PostPermalink';
import {
  CATEGORY_LABELS, SITE_ORIGIN, cleanCaption, fetchShowcaseItem, playableVideo,
  postPath, postVideoPath, twimgVideoSize,
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

/** Width and height of a JPEG or PNG, from its header alone.

    Only ever asked about a clip's poster frame, which is a still cut
    from the clip and so carries the clip's dimensions. Discord sizes the
    embed player from og:video:width/height, and Spotlight's videos are
    square or vertical about as often as they are wide, so assuming 16:9
    would put black bars around most of them.

    A ranged read: the answer is in the first few hundred bytes and the
    file behind it can be tens of megabytes. */
async function probeImageSize(
  url: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(url, {
      headers: { Range: 'bytes=0-65535' },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const b = Buffer.from(await res.arrayBuffer());

    if (b.length > 24 && b.toString('ascii', 1, 4) === 'PNG') {
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }

    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i += 1; continue; }
        const marker = b[i + 1];
        // SOF0-SOF15 carry the frame size. C4, C8 and CC share the range
        // and do not (Huffman table, JPEG extension, arithmetic table).
        if (marker >= 0xc0 && marker <= 0xcf
            && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
    return null;
  } catch {
    return null;
  }
}

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

  const base = {
    title: `${title} | Whimco`,
    description,
    alternates: { canonical: postPath(item.id) },
    // video.twimg.com 403s any request carrying a foreign Referer, so this
    // page must send none for inline X video playback to work, the same as
    // the showcase, the gallery and the feed.
    referrer: 'no-referrer' as const,
    // No openGraph.images key anywhere below. The sibling
    // opengraph-image.tsx supplies it, and naming one here would win over
    // the generated card and put the Spotlight logo in every unfurl
    // instead of the creation.
  };

  const video = playableVideo(item);
  if (video) {
    // Two in five creations lead with a clip, and every one of them used
    // to unfurl in Discord as a frozen frame. These are the tags that
    // make the embed an actual player. Both blocks, og:video and the
    // twitter player, because the two sites whose clips demonstrably
    // play inline in Discord (vxtwitter and Streamable) each ship both,
    // and neither leans on og:video by itself.
    //
    // The cost is twitter:card, which stops being summary_large_image
    // for these. X renders an unapproved player card as a bare link, so
    // a clip shared to X unfurls worse than it did. Spotlight is a
    // Discord product and these links are pasted into Discord; a working
    // player there is worth a plainer card somewhere almost nobody
    // posts them.
    const size = twimgVideoSize(video.url)
      ?? (video.thumbnail ? await probeImageSize(video.thumbnail) : null)
      ?? { width: 1280, height: 720 };
    const stream = `${SITE_ORIGIN}${postVideoPath(item.id)}`;

    return {
      ...base,
      openGraph: {
        title,
        description,
        type: 'video.other',
        // The bare string first, then the descriptor. Next writes a
        // descriptor out as og:video:url and never as plain og:video,
        // and og:video is the tag every scraper is certain to read; a
        // string entry is the only way to get it. The two carry the
        // same URL, which is what the OG spec says og:video:url means.
        videos: [
          stream,
          {
            url: stream,
            secureUrl: stream,
            type: 'video/mp4',
            width: size.width,
            height: size.height,
          },
        ],
      },
      twitter: {
        card: 'player',
        title,
        description,
        // The player is this page, which does play the clip. Discord
        // will not frame a provider it has not whitelisted and falls
        // through to the stream, which is the whole point of naming both.
        players: [{
          playerUrl: `${SITE_ORIGIN}${postPath(item.id)}`,
          streamUrl: stream,
          width: size.width,
          height: size.height,
        }],
      },
    };
  }

  return {
    ...base,
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
