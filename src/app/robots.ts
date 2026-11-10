import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from './spotlight/constants';

/** Everything public is crawlable. The admin panel, sign-in and lab routes
    are not pages anyone should land on from a search, and portfolio layout
    previews are already noindexed on the page itself.

    Crawlers that cost page renders and send nothing back are turned away
    by name. ElevenlabsCrawler made about 1,000 uncached requests in two
    hours on 2026-11-10 and is neither a search engine nor an answer
    engine. Search and AI-answer crawlers (Googlebot, bingbot, ClaudeBot,
    Amazonbot) stay welcome: they are how a creator's page gets found. */
const UNWANTED = ['ElevenlabsCrawler'];

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
