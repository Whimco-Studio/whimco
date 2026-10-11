/** Where a reader of a portfolio page came from, and the view beacon.

    The click table on the Spotlight side only sees presses on links we
    own, so it only ever counts the readers a broadcast sent. The beacon
    counts everyone: one POST per page load with the creator, the source
    server if the Spotlight hop tagged the URL, and the referrer. The
    server keeps the referrer's host and nothing else, and stores no IP,
    cookie or agent, same as the click table.

    The arrival is also remembered for the tab, because a signed-out
    "Ask for an introduction" goes out through Discord sign-in and comes
    back with discord.com as the referrer. The ask reports the referrer
    of the visit that started it, not the bounce. */
import { VIEW_URL } from './constants';

export type Arrival = { referrer: string; source: string; at: number };

const TTL_MS = 60 * 60 * 1000;
/** Hosts that mean "we sent you back here", not "you arrived". */
const BOUNCE_HOSTS = new Set(['discord.com', 'spotlight.whimco.com']);

const key = (creator: string) => `spotlight:arrival:${creator.toLowerCase()}`;

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function stored(creator: string): Arrival | null {
  try {
    const raw = sessionStorage.getItem(key(creator));
    if (!raw) return null;
    const a = JSON.parse(raw) as Arrival;
    return Date.now() - a.at < TTL_MS ? a : null;
  } catch { return null; }
}

/** The arrival for this creator's page, as remembered for the tab. */
export function readArrival(creator: string): Arrival | null {
  return stored(creator);
}

/** Call once per page load. Records the arrival if this is a fresh
    visit, and sends the view beacon for it. A load whose referrer is a
    bounce back from sign-in, with an arrival already remembered, is the
    same visit and sends nothing. */
export function recordArrival(creator: string): Arrival {
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source') === 'spotlight'
    ? (params.get('utm_content') ?? '').replace(/\D/g, '')
    : '';
  const previous = stored(creator);
  const host = hostOf(referrer);
  if (previous && (BOUNCE_HOSTS.has(host) || !host)) return previous;

  const arrival: Arrival = { referrer, source, at: Date.now() };
  try { sessionStorage.setItem(key(creator), JSON.stringify(arrival)); } catch { /* private mode */ }
  try {
    fetch(VIEW_URL, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator, source, referrer }),
    }).catch(() => {});
  } catch { /* counting a view must never cost the page */ }
  return arrival;
}
