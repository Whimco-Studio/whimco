/** The install button, routed through a hop we own.

    Everything past this redirect happens inside Discord and reports
    nothing back, so the press is the last event anyone can see. It used
    to be a raw discord.com/oauth2/authorize link, which meant the one
    action the whole page exists to produce was the only one that left no
    trace. Scopes and permissions now live in exactly one place, the
    Spotlight repo's config/urls.py, so the two copies cannot drift.

    The cost, stated plainly: an install now depends on
    spotlight.whimco.com answering. That host already feeds every
    creation on this page, so an outage that breaks the button is an
    outage that already left the gallery empty. */
export const INVITE_URL = 'https://spotlight.whimco.com/invite';

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

/** How a claimed portfolio arranges itself. Only a verified creator can
    choose one, since claiming is the proof the account is theirs, and an
    unclaimed portfolio has nobody who could have chosen.

    The codes are a contract with the Spotlight backend's
    ClaimedProfile.LAYOUT_CHOICES and are append-only on both sides. */
export const PORTFOLIO_LAYOUTS = [
  'classic', 'sheet', 'feature', 'card', 'discipline',
] as const;

export type PortfolioLayout = (typeof PORTFOLIO_LAYOUTS)[number];

/** Anything unrecognised renders classic. A response cached from before
    the field existed has no layout at all, and a layout added to the
    backend before this site ships its renderer would otherwise blank the
    page rather than fall back. */
export function asLayout(raw: unknown): PortfolioLayout {
  return PORTFOLIO_LAYOUTS.includes(raw as PortfolioLayout)
    ? (raw as PortfolioLayout)
    : 'classic';
}

/** The accent a creator picked, as a code. The palette lives here rather
    than arriving from the API: the server curates which codes are allowed,
    and this side decides what they look like, so no colour string from a
    response is ever dropped straight into CSS.

    `dim` is the same hue at the opacity the gallery's cursor beam uses.
    Both override tokens the whole showcase already reads, which is why an
    accent needs no stylesheet of its own. */
export const PORTFOLIO_ACCENTS = {
  beam: { hex: '#ffd98a', dim: 'rgba(255, 217, 138, 0.14)', label: 'Spotlight gold' },
  pink: { hex: '#ff86ff', dim: 'rgba(255, 134, 255, 0.14)', label: 'Pink' },
  cyan: { hex: '#22d3ee', dim: 'rgba(34, 211, 238, 0.14)', label: 'Cyan' },
  lime: { hex: '#a3e635', dim: 'rgba(163, 230, 53, 0.14)', label: 'Lime' },
  violet: { hex: '#a855f7', dim: 'rgba(168, 85, 247, 0.14)', label: 'Violet' },
} as const;

export type PortfolioAccent = keyof typeof PORTFOLIO_ACCENTS;

/** Anything unrecognised is the gold the site already uses, for the same
    reason asLayout falls back to classic. */
export function asAccent(raw: unknown): PortfolioAccent {
  return (raw as PortfolioAccent) in PORTFOLIO_ACCENTS
    ? (raw as PortfolioAccent)
    : 'beam';
}

/** One line each, in the creator's terms. Mirrors LAYOUT_NOTES on the
    backend, which drives the picker at spotlight.whimco.com/profile. */
export const LAYOUT_NOTES: Record<PortfolioLayout, string> = {
  classic: 'A masonry wall of everything you have posted.',
  sheet: 'Your work edge to edge, with your details down the side.',
  feature: 'Your best-loved piece fills the screen, the rest sits below.',
  card: 'A tall single column built for phones and Discord links.',
  discipline: 'Grouped by what it is, so people can find the GFX or the UI.',
};

/** Claimed-portfolio profile block (author mode only; null when unclaimed). */
export type ShowcaseProfile = {
  username: string;
  avatar_url: string | null;
  bio: string;
  links: { label: string; url: string }[];
  contact: string;
  /** Optional so a response cached before the field existed still parses,
      the same reason author_claimed is optional. Read them through
      asLayout() and asAccent(), never directly. */
  layout?: string;
  accent?: string;
  /** Which creation fills the fold in the Feature layout. Null, or an id
      that matches nothing currently loaded, means the hearts decide. */
  feature_item_id?: number | null;
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
/** Where a creator's own layout and accent are written. Credentialed and
    Origin-gated, like the like and remove endpoints beside it. */
export const APPEARANCE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/appearance`;
export const RECATEGORIZE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/recategorize`;
/** A creator taking their own work off whimco.com, and their drawer of
    what they have taken off. Gallery only: the Discord copies already
    broadcast to member servers stay where they are. */
export const REMOVE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/remove`;
export const REMOVED_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/removed`;
/** One creation by id. The gallery is paginated, so without this a link
    to a single creation has to guess a page number; this is what lets a
    permalink exist at all. */
export const ITEM_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/item`;

/** The canonical URL for one creation. Every share button copies this,
    and the gallery lightbox pushes it, so a creation has exactly one
    address no matter which surface it was opened from. */
export function postPath(id: number): string {
  return `/spotlight/p/${id}`;
}

/** Absolute form of postPath, for the metadata Next does not resolve
    against metadataBase (twitter:player and twitter:player:stream are
    emitted verbatim). Hardcoded to the production origin for the same
    reason metadataBase is: a preview deployment's URL sits behind
    deployment protection and 302s crawlers away from the media. */
export const SITE_ORIGIN = 'https://whimco.com';

/** The stable address of a creation's video, which is not the address of
    the file.

    Discord stores the og:video URL it scraped and hands it to every
    client that ever renders the embed, days or weeks later. Most of
    Spotlight's clips live in our S3 bucket behind a presigned URL that
    dies after 12 hours, so pointing Discord at the file directly
    would give a video that plays this afternoon and 403s tomorrow. This
    hop is ours and never expires; it redirects to whatever URL is
    current at the moment somebody presses play. */
export function postVideoPath(id: number): string {
  return `/spotlight/p/${id}/video.mp4`;
}

/** The lead attachment Discord can play inline, or null.

    video/mp4 only. Discord uploads also arrive as video/quicktime, and a
    .mov in an HTML5 player is a black rectangle everywhere but Safari —
    those fall through to the still card rather than embedding a player
    that will not start. */
export function playableVideo(item: ShowcaseItem): ShowcaseMedia | null {
  return item.media.find((m) => m.content_type === 'video/mp4') ?? null;
}

/** Pixel size read out of an X video's own URL, which spells it out:
    .../amplify_video/<id>/vid/avc1/2160x1080/<name>.mp4. Null for
    anything else, including our S3 keys. */
export function twimgVideoSize(url: string): { width: number; height: number } | null {
  const m = url.match(/\/(\d{2,5})x(\d{2,5})\//);
  if (!m) return null;
  const width = Number(m[1]);
  const height = Number(m[2]);
  if (!width || !height) return null;
  return { width, height };
}

/** One creation, or null when the id is unknown, hidden, taken down by
    its author, or belongs to a banned account. The backend refuses all
    four identically and on purpose, so there is nothing here to tell
    apart. */
export async function fetchShowcaseItem(
  id: string | number,
  revalidate = 300,
): Promise<ShowcaseItem | null> {
  try {
    const res = await fetch(`${ITEM_URL}?id=${encodeURIComponent(String(id))}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    const data: { item?: ShowcaseItem } = await res.json();
    return data.item ?? null;
  } catch {
    return null;
  }
}
