import { ImageResponse } from 'next/og';
import {
  parseUsername, SHOWCASE_API_URL, ShowcaseData, ShowcaseItem,
} from '../constants';

export const revalidate = 300;
export const alt = 'Spotlight portfolio preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const STAGE = '#0a0a0f';
const BEAM = '#ffd98a';

function firstImageUrl(item: ShowcaseItem): string | null {
  for (const m of item.media) {
    if (m.content_type?.startsWith('image/') && m.url) return m.url;
    if (m.thumbnail) return m.thumbnail; // video posts: use the poster frame
  }
  return null;
}

/** Formats satori can rasterize. Sniff bytes rather than trusting the
    Content-Type header — S3 objects sometimes carry the wrong one, and a
    mislabeled (or WebP) image crashes the whole render. */
function sniffImageType(buf: Buffer): string | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 6 && buf.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  return null;
}

/** Inline the image as a data URI so one expired presign or slow host
    degrades the composite instead of 500ing the whole card. */
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

export default async function OgImage({ params }: { params: { username: string } }) {
  const name = parseUsername(params.username);
  let data: ShowcaseData | null = null;
  if (name) {
    try {
      const res = await fetch(
        `${SHOWCASE_API_URL}?author=${encodeURIComponent(name)}`,
        { next: { revalidate: 300 } },
      );
      if (res.ok) data = await res.json();
    } catch {
      // Text-only card below still renders.
    }
  }

  const author = data?.author;
  const display = author?.name || name || 'Spotlight';

  // Items arrive ranked by hearts — take the first image of the top posts,
  // fetching one spare in case a URL has gone stale.
  const candidates = (data?.items ?? [])
    .map(firstImageUrl)
    .filter((u): u is string => Boolean(u))
    .slice(0, 4);
  const images = ((await Promise.all(candidates.map(toDataUri)))
    .filter(Boolean) as string[]).slice(0, 3);

  const nameSize = display.length > 18 ? 52 : display.length > 12 ? 66 : 84;

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
        {images.length > 0 && (
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                style={{
                  width: `${Math.ceil(1200 / images.length)}px`,
                  height: '630px',
                  objectFit: 'cover',
                }}
              />
            ))}
          </div>
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
            right: '56px',
            bottom: '44px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: BEAM,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 8,
            }}
          >
            SPOTLIGHT
          </div>
          <div
            style={{
              display: 'flex',
              color: '#ffffff',
              fontSize: nameSize,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {display}
          </div>
          {author && author.creations > 0 && (
            <div
              style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 28,
                marginTop: 10,
              }}
            >
              {`${author.creations} creation${author.creations === 1 ? '' : 's'} broadcast · ${author.hearts} heart${author.hearts === 1 ? '' : 's'} from the network`}
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
