export const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1414683911404916876&permissions=326417640512&scope=bot%20applications.commands';

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

export type ShowcaseData = {
  items: ShowcaseItem[];
  page: number;
  pages: number;
  total: number;
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
  /** Up to 3 of their best-hearted images, used as the card's cover. */
  covers: string[];
};

export type CreatorsData = {
  creators: Creator[];
  page: number;
  pages: number;
  total: number;
};

/** Web likes: credentialed endpoints on the Spotlight backend. Same-site
    with whimco.com, so the claim-flow session cookie rides along on
    credentials: 'include' fetches. */
export const SPOTLIGHT_ORIGIN = new URL(SHOWCASE_API_URL).origin;
export const LIKE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/like`;
export const ME_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/me`;
export const CLAIM_START_URL = `${SPOTLIGHT_ORIGIN}/claim/start`;
export const RECATEGORIZE_URL = `${SPOTLIGHT_ORIGIN}/api/showcase/recategorize`;
