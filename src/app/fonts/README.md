# Vendored fonts

The three faces the site uses, served from this repo instead of fetched
from Google Fonts at build time. On 2026-10-11 a Vercel build failed
inside `next/font` because Google's font service answered with something
the loader could not parse, and a fetch failure fails the whole build.
Nothing in the code had changed. A font in the repo cannot fail that way.

Each file is the latin-subset variable woff2 that Google Fonts served for
the family on 2026-10-11, saved as-is, with the family's SIL Open Font
License beside it. All three are OFL, which permits bundling.

| file | family | axes kept | source |
|---|---|---|---|
| BricolageGrotesque-latin.woff2 | Bricolage Grotesque v9 | opsz 12..96, wght 200..800 | fonts.gstatic.com/s/bricolagegrotesque/v9 |
| JetBrainsMono-latin.woff2 | JetBrains Mono v24 | wght 100..800 | fonts.gstatic.com/s/jetbrainsmono/v24 |
| Inter-latin.woff2 | Inter v20 | opsz 14..32, wght 100..900 | fonts.gstatic.com/s/inter/v20 |

Loaded once in `src/app/fonts.ts`. Pages import `display`, `mono` and
`inter` from there rather than declaring their own, so the nine copies
of the same two declarations are gone and a future change is one edit.
