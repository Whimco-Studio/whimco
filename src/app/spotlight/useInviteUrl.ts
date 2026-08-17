'use client';

import { useEffect, useState } from 'react';
import { INVITE_URL } from './constants';

/** A campaign tag, as narrow as the column that receives it.

    Lowercase letters, digits, dot, dash and underscore, starting on a
    letter or digit. The server applies the same rule and drops anything
    outside it, so this is a courtesy rather than the guard: it keeps a
    junk tag out of the URL bar instead of relying on the far end to
    ignore it. */
const TAG = /^[a-z0-9][a-z0-9._-]*$/;

const MAX_TAG = 24;

/** The install URL, carrying whichever campaign brought the reader here.

    A post can put the same install link in three places, and by the time
    somebody presses the button those three are indistinguishable. This
    reads the utm_source and utm_content already on the page and passes
    them along as ?c=, which is the only thing that tells the header CTA
    apart from the one at the bottom.

    Read in an effect rather than during render on purpose. The showcase
    is prerendered, so touching window.location while rendering would
    produce markup the server could not have produced and the hydration
    would tear. The first paint carries the plain link, which works on
    its own; the tag arrives a frame later, long before anybody has
    aimed at the button. */
export default function useInviteUrl(): string {
  const [url, setUrl] = useState(INVITE_URL);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const parts = [q.get('utm_source'), q.get('utm_content')]
      .map((v) => (v ?? '').trim().toLowerCase().slice(0, MAX_TAG))
      .filter((v) => TAG.test(v));
    if (!parts.length) return;
    setUrl(`${INVITE_URL}?c=${encodeURIComponent(parts.join('.'))}`);
  }, []);

  return url;
}
