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
const ANY_URL_RE = /https?:\/\/[^\s]+/gi;

/** First X/Twitter link in a caption, for "view original post" links. */
export function xLink(content: string): string | null {
  const m = content.match(X_LINK_RE);
  return m ? m[0] : null;
}

/** Caption with bare URLs removed — the media already shows the content. */
export function cleanCaption(content: string): string {
  return content.replace(ANY_URL_RE, '').replace(/\s{2,}/g, ' ').trim();
}

export type ShowcaseItem = {
  id: number;
  author_name: string;
  content: string;
  tag: string;
  hearts: number;
  created_at: string;
  media: ShowcaseMedia[];
};

export type ShowcaseStats = {
  member_reach: number;
  server_count: number;
  creations: number;
  hearts_given: number;
};

export type ShowcaseData = {
  items: ShowcaseItem[];
  page: number;
  pages: number;
  total: number;
  stats: ShowcaseStats;
  tags: { tag: string; count: number }[];
};
