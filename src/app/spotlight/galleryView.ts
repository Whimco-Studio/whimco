/** Reading a gallery view out of the URL and fetching it, shared by the
    live gallery and the layout demo at /lab/gallery so the two can never
    disagree about what a view is. */
import {
  CATEGORY_LABELS, SHOWCASE_API_URL, ShowcaseData, SortMode,
} from './constants';

export type RawParams = { [key: string]: string | string[] | undefined };

export type View = { page: number; category: string; sort: SortMode; q: string };

/** Reading a search param is reading attacker-controlled text, and these
    three reach a fetch URL, a page title and a canonical tag. Narrowed
    here rather than passed through: an unrecognised category becomes the
    unfiltered gallery, an unrecognised sort becomes the default, and the
    page number is bounded so a crafted ?page=1e9 cannot ask the backend
    to count its way to an offset that does not exist. */
export function readView(raw: RawParams): View {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const n = Number.parseInt(first(raw.page) ?? '1', 10);
  const category = first(raw.category) ?? '';
  return {
    page: Number.isFinite(n) && n > 1 ? Math.min(n, 999) : 1,
    category: CATEGORY_LABELS[category] ? category : '',
    sort: first(raw.sort) === 'top' ? 'top' : 'new',
    // Free text, so only trimmed and bounded; it goes to the API as a
    // query parameter and into nothing the page renders as markup.
    q: (first(raw.q) ?? '').trim().replace(/\s+/g, ' ').slice(0, 64),
  };
}

/** The path for a view, matching viewHref in GalleryBrowser. Two copies
    because one runs on the server for the canonical tag and the other in
    the browser for the controls; they are checked against each other by
    the fact that a mismatch would show up as a canonical pointing at a
    different view than the one rendered. */
export function viewPath({ page, category, sort }: Pick<View, 'page' | 'category' | 'sort'>): string {
  const p = new URLSearchParams();
  if (page > 1) p.set('page', String(page));
  if (category) p.set('category', category);
  if (sort !== 'new') p.set('sort', sort);
  const q = p.toString();
  return q ? `/spotlight/gallery?${q}` : '/spotlight/gallery';
}

export async function getShowcase(view: View): Promise<ShowcaseData | null> {
  const params = new URLSearchParams({ page: String(view.page) });
  if (view.category) params.set('category', view.category);
  if (view.sort !== 'new') params.set('sort', view.sort);
  if (view.q) params.set('q', view.q);
  try {
    const res = await fetch(`${SHOWCASE_API_URL}?${params}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Spotlight down: render the shell and let the browser retry, same as
    // the showcase and the creator directory do.
    return null;
  }
}
