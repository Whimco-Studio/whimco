/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // /spotlight/feed, the live timeline, was retired on 2026-11-24: the
      // gallery opens newest first and covers it. A link to one post in
      // the feed goes to that post's own page; anything else to the gallery.
      {
        source: '/spotlight/feed',
        has: [{ type: 'query', key: 'post', value: '(?<post>[0-9]+)' }],
        destination: '/spotlight/p/:post',
        permanent: true,
      },
      { source: '/spotlight/feed', destination: '/spotlight/gallery', permanent: true },
    ];
  },
};

module.exports = nextConfig
