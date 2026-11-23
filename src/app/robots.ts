import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from './spotlight/constants';

/** Everything public is crawlable. The admin panel, sign-in and lab routes
    are not pages anyone should land on from a search, and portfolio layout
    previews are already noindexed on the page itself.

    Welcome: search engines (Googlebot, bingbot, which also feeds
    DuckDuckGo, Ecosia and Copilot), Discord's preview fetchers, and the
    AI answer crawlers that cite a page and send a reader to it
    (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot,
    Claude-User, Applebot, Amazonbot, ExaSearchBot).

    Turned away by name, since 2026-11-24: crawlers that cost uncached
    page renders and send nobody back. AI training crawlers take the
    creators' work for model training, which a creator showcase should
    not hand over (Google-Extended and Applebot-Extended are opt-out
    tokens for training only; they do not affect search). SEO tool
    crawlers only feed other people's backlink tools. Robots.txt only
    binds polite crawlers; the proxy botnet ignores it, and the view
    beacon handles that one (spotlight/arrival.ts). ElevenlabsCrawler made
    about 1,000 uncached requests in two hours on 2026-11-10. */
const AI_TRAINING = [
  'GPTBot', 'ClaudeBot', 'CCBot', 'Bytespider', 'meta-externalagent',
  'Google-Extended', 'Applebot-Extended', 'ElevenlabsCrawler',
];
const SEO_TOOLS = ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot', 'SERankingBacklinksBot'];
const UNWANTED = [...AI_TRAINING, ...SEO_TOOLS];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...UNWANTED.map((userAgent) => ({ userAgent, disallow: '/' })),
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/login', '/lab'],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
