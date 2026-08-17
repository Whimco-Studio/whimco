export const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1414683911404916876&permissions=326417640512&scope=bot%20applications.commands';

/** The Spotlight Support server, linked from the network directory hero.
    A non-expiring invite, deliberately: a link baked into a page outlives
    any invite with a lifetime. This is the one server whose invite is
    ours to publish, which is why no other card on that page links out. */
export const SUPPORT_INVITE_URL = 'https://discord.gg/b6eDADvQzy';

export const SHOWCASE_API_URL =
  process.env.NEXT_PUBLIC_SPOTLIGHT_API_URL ??
  'https://spotlight.whimco.com/api/showcase/';

export type ShowcaseMedia = {
  url: string;
  content_type: string;
  thumbnail?: string;
};

const X_LINK_RE = /https?:\/\/(?:www\.)?(?:x|twitter|fxtwitter|vxtwitter)\.com\/[^\s]+/i;
const X_STATUS_ID_RE = /(?:x|twitter|fxtwitter|vxtwitter)\.com\/[^/\s]+\/status\/(\d+)/i;
const ANY_URL_RE = /https?:\/\/[^\s]+/gi;

/** Canonical link to the original X post (works even when the shared URL
    was an fxtwitter/vxtwitter mirror or had a placeholder username). */
export function xLink(content: string): string | null {
  const status = content.match(X_STATUS_ID_RE);
  if (status) return `https://x.com/i/status/${status[1]}`;
  const m = content.match(X_LINK_RE);
  return m ? m[0] : null;
}

/** Caption with bare URLs removed — the media already shows the content. */
export function cleanCaption(content: string): string {
  return content.replace(ANY_URL_RE, '').replace(/\s{2,}/g, ' ').trim();
}

/** /spotlight/@<name> — the @ marks creator portfolios so future static
    routes under /spotlight never collide with usernames. */
export function parseUsername(raw: string): string | null {
  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith('@')) return null;
  const name = decoded.slice(1).trim();
  return name.length > 0 && name.length <= 255 ? name : null;
}

export type ShowcaseItem = {
  id: number;
  author_name: string;
  /** Author has claimed their portfolio through Discord. Optional so a
      cached response from before the field existed still parses. */
  author_claimed?: boolean;
  content: string;
  tag: string;
  category: string;
  hearts: number;
  created_at: string;
  media: ShowcaseMedia[];
};

/** Order mirrors the backend's CATEGORY_CHOICES. New categories are
    appended, never inserted: the triage keyboard binds shortcuts to
    these codes by position, so an insertion mid-list would silently
    rebind every shortcut after it. */
export const CATEGORY_LABELS: Record<string, string> = {
  gfx: 'GFX',
  '2d': '2D Art',
  build: 'Builds',
  ui: 'UI',
  model: '3D Models',
  animation: 'Animation',
  vfx: 'VFX',
  clothing: 'Clothing',
  clip: 'Videos',
  game: 'Games',
  scripting: 'Scripting',
  audio: 'Audio',
  logo: 'Logos',
};

/** The noun phrase that follows a count of creations: "creations", or
    "creations in 3D Models" under a filter.

    Shared because three surfaces say this and they must agree: the
    gallery's subtitle, the link across to it from the landing page, and
    the line at the end of a filtered run. The category name is never
    lowercased and never glued in front of the noun, because the labels
    are display-cased ("UI", "GFX", "3D Models") and both "ui creations"
    and "3D Models creations" read as mistakes. */
export function creationsIn(total: number, category: string): string {
  const noun = `creation${total === 1 ? '' : 's'}`;
  const label = category ? (CATEGORY_LABELS[category] ?? category) : '';
  return label ? `${noun} in ${label}` : noun;
}

export type ShowcaseStats = {
  member_reach: number;
  server_count: number;
  creations: number;
  hearts_given: number;
};

/** Claimed-portfolio profile block (author mode only; null when unclaimed). */
export type ShowcaseProfile = {
  username: string;
  avatar_url: string | null;
  bio: string;
  links: { label: string; url: string }[];
  contact: string;
};

/** Gallery ordering. 'new' is newest first and the default; 'top' ranks by
    hearts within a 7-day window. Top is deliberately not all-time: hearts
    only accumulate, so an all-time ranking drifts older every day. */
export type SortMode = 'new' | 'top';

export type ShowcaseData = {
  items: ShowcaseItem[];
  page: number;
  pages: number;
  total: number;
  /** Echoed back by the API, so an unrecognised ?sort is visible as the
      default it fell back to rather than silently ignored. */
  sort?: SortMode;
  stats: ShowcaseStats;
  tags: { tag: string; count: number }[];
  categories: { category: string; count: number }[];
  author?: { name: string; creations: number; hearts: number } | null;
  profile?: ShowcaseProfile | null;
};

export const CLAIM_URL = 'https://spotlight.whimco.com/claim';

/** The creator directory: the network browsed as people, not creations. */
export const CREATORS_API_URL = SHOWCASE_API_URL.replace(
  '/api/showcase/', '/api/creators/',
);

export type Creator = {
  name: string;
  creations: number;
  hearts: number;
  claimed: boolean;
  avatar_url: string | null;
  bio: string;
  /** Free text the creator typed; blank unless they claimed and filled it. */
  contact: string;
  /** Up to 3 of their best-hearted images, used as the card's cover. */
  covers: string[];
  /** Their whole body of work by discipline, as {code: [creations, hearts]},
      never just the filtered slice. "10 of 10" and "10 of 40" are the same
      creator under a UI filter without the denominator. */
  cats: Record<string, [number, number]>;
};

export type CreatorsData = {
  creators: Creator[];
  page: number;
  pages: number;
  total: number;
  /** Echoed back, so an unrecognised code is visible as the unfiltered
      directory it fell back to rather than silently ignored. */
  category?: string;
  /** Creators per discipline across the whole network, not the filtered
      set, so choosing a chip cannot collapse the row to that one chip. */
  categories?: { category: string; creators: number }[];
};

/** The network directory: the same broadcast, viewed from where it lands
    instead of who sends it. */
export const NETWORK_API_URL = SHOWCASE_API_URL.replace(
  '/api/showcase/', '/api/servers/',
);

export type NetworkServer = {
  id: string;
  name: string;
  members: number;
  online: number;
  icon: string | null;
  /** Only present when NETWORK_SHOW_CONTRIBUTION is enabled server side.
      Off today, so nothing renders it yet. */
  creations?: number;
};

export type NetworkData = {
  servers: NetworkServer[];
  total: number;
  members: number;
};

/** Web likes: credentialed endpoints on the Spotlight backend. Same-site
    with whimco.com, so the claim-flow session cookie rides along on
    credentials: 'include' fetches. */
export const SPOTLIGHT_ORIGIN = new URL(SHOWCASE_API_URL).origin;
export const LIKE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/like`;
export const ME_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/me`;
export const CLAIM_START_URL = `${SPOTLIGHT_ORIGIN}/claim/start`;
export const RECATEGORIZE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/recategorize`;
/** A creator taking their own work off whimco.com, and their drawer of
    what they have taken off. Gallery only: the Discord copies already
    broadcast to member servers stay where they are. */
export const REMOVE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/remove`;
export const REMOVED_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/removed`;
