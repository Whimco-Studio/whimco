import { fetchShowcaseItem, playableVideo } from '../../../constants';

/** The permanent address of a creation's clip, redirecting to wherever
    the bytes currently are.

    Discord scrapes og:video once, caches the string, and replays it to
    every client that renders the embed afterwards — so the URL in that
    tag has to outlive the file's own URL. Ours never do: S3 clips are
    presigned for 12 hours, and X reserves the right to move anything on
    video.twimg.com. This hop re-reads the item and hands back the URL
    that is live at the moment somebody presses play.

    Deliberately a redirect and not a proxy. Playback is range requests
    over tens of megabytes, and every one of those bytes moving through
    a serverless function would cost real money to do nothing but launder
    a hostname. */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  // Shorter than the page's 300s: the redirect target has a lifetime and
  // the page's title does not.
  const item = await fetchShowcaseItem(params.id, 60);
  const video = item ? playableVideo(item) : null;

  // Unknown, hidden, author-removed and banned all arrive as null, and a
  // still-image creation has no clip. Both are a plain 404, for the same
  // reason the page is: anything more specific answers a question the
  // backend is refusing to answer.
  if (!video) return new Response('Not found', { status: 404 });

  return new Response(null, {
    status: 302,
    headers: {
      Location: video.url,
      // video.twimg.com 403s a request carrying a foreign Referer. A
      // redirect does not add one, but the header costs nothing and
      // removes the question.
      'Referrer-Policy': 'no-referrer',
      // Well inside the 12h presign, so a cached hop can never outlive
      // the URL it is holding.
      'Cache-Control': 'public, max-age=600',
    },
  });
}
