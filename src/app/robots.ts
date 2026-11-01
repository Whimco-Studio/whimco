import type { MetadataRoute } from 'next';
import { SITE_ORIGIN } from './spotlight/constants';

/** Everything public is crawlable. The admin panel, sign-in and lab routes
    are not pages anyone should land on from a search, and portfolio layout
    previews are already noindexed on the page itself. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/lab'],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
