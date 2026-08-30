import { ImageResponse } from 'next/og';
import { fetchShowcaseItem, CATEGORY_LABELS, ShowcaseItem } from '../../constants';

export const revalidate = 300;
export const alt = 'Spotlight creation preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STAGE = '#0a0a0f';
const BEAM = '#ffd98a';

/** Every attachment that could carry the card, in order of preference.
    A list rather than the first match, because sniffImageType below
    rejects AVIF and WebP (satori cannot rasterize either), and a creation
    whose lead attachment is one of those often has a JPEG right behind
    it. Falling back to the second attachment is the difference between
    the unfurl showing the work and showing an empty card. */
function imageCandidates(item: ShowcaseItem): string[] {
  const out: string[] = [];
  for (const m of item.media) {
    if (m.content_type?.startsWith('image/') && m.url) out.push(m.url);
    if (m.thumbnail) out.push(m.thumbnail); // video posts: the poster frame
  }
  return out.slice(0, 4);
}

/** Formats satori can rasterize. Sniff bytes rather than trusting the
    Content-Type header: S3 objects sometimes carry the wrong one, and a
    mislabeled (or WebP) image crashes the whole render. Same check the
    portfolio card does, for the same reason. */
function sniffImageType(buf: Buffer): string | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 6 && buf.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  return null;
}

/** Inline the image as a data URI so one expired presign or slow host
    degrades the card instead of 500ing it. A Discord unfurl that fails
    shows nothing at all, so this path has to end in a picture either
    way. */
async function toDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const type = sniffImageType(buf);
    if (!type) return null;
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: { params: { id: string } }) {
  const item = await fetchShowcaseItem(params.id);
  const author = item?.author_name ?? 'Spotlight';
  const label = item?.category ? (CATEGORY_LABELS[item.category] ?? item.category) : '';

  // Sequential, not Promise.all: the first candidate almost always wins,
  // and racing four fetches to throw three away costs the unfurl latency
  // that Discord is timing.
  let image: string | null = null;
  for (const url of item ? imageCandidates(item) : []) {
    image = await toDataUri(url);
    if (image) break;
  }

  const nameSize = author.length > 18 ? 46 : author.length > 12 ? 58 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: STAGE,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {image && (
          <img
            src={image}
            style={{ width: '1200px', height: '630px', objectFit: 'cover' }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '380px',
            display: 'flex',
            background:
              'linear-gradient(to top, rgba(10,10,15,0.97) 25%, rgba(10,10,15,0.6) 60%, rgba(10,10,15,0))',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '56px',
            bottom: '52px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: BEAM,
              fontSize: '24px',
              letterSpacing: '6px',
              marginBottom: '14px',
            }}
          >
            {(label || 'SPOTLIGHT').toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              color: '#f4f5fa',
              fontSize: `${nameSize}px`,
              fontWeight: 800,
            }}
          >
            {author}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
