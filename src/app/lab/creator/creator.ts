import type {
	ShowcaseData,
	ShowcaseItem,
	ShowcaseProfile,
} from "../../spotlight/constants";
import { SHOWCASE_API_URL } from "../../spotlight/constants";

/**
 * Reads one creator's whole portfolio for the layout lab.
 *
 * Live, never a fixture. Baking a snapshot of creator names, bios and
 * contact strings into this repo was considered once for the creators
 * directory and rejected: the repo is public and permanent, so a creator
 * who deletes their work or gets banned stops being served by the API
 * while a committed copy keeps their bio in git history forever. The
 * same reasoning applies to a demo page, which is why the only creator
 * detail in this repo is a default username in a query string.
 *
 * The real portfolio page paginates. The lab pulls every page instead,
 * because one of the layouts groups by discipline and a creator's
 * disciplines are wrong if you only counted the first sixteen items.
 */

export type Creation = ShowcaseItem;

export interface CreatorView {
	username: string;
	name: string;
	creations: number;
	hearts: number;
	profile: ShowcaseProfile | null;
	items: Creation[];
	/** Discipline code to [count, hearts], the creator's own mix. */
	disciplines: [string, number, number][];
	found: boolean;
}

/** No default creator. The whimco repo is public and permanent, and the
 * decision not to commit creator names to it holds for a demo default as
 * much as it did for the creators directory snapshot: a creator who
 * deletes their work or gets banned stops being served by the API, while
 * a name committed here stays in git history forever. The lab asks for a
 * username instead. */
export const DEFAULT_USER = "";

const MAX_PAGES = 6;

async function page(name: string, n: number): Promise<ShowcaseData | null> {
	try {
		const res = await fetch(
			`${SHOWCASE_API_URL}?author=${encodeURIComponent(name)}&page=${n}`,
			{ next: { revalidate: 300 } },
		);
		if (!res.ok) return null;
		return (await res.json()) as ShowcaseData;
	} catch {
		return null;
	}
}

export async function getCreator(username: string): Promise<CreatorView> {
	const empty: CreatorView = {
		username,
		name: username,
		creations: 0,
		hearts: 0,
		profile: null,
		items: [],
		disciplines: [],
		found: false,
	};
	if (!username) return empty;

	const first = await page(username, 1);
	if (!first) return empty;

	const items = [...first.items];
	// Sequential rather than Promise.all: pages is known only after the
	// first response, and a creator with 27 creations needs one more call,
	// not six speculative ones.
	for (let n = 2; n <= Math.min(first.pages, MAX_PAGES); n += 1) {
		const next = await page(username, n);
		if (!next) break;
		items.push(...next.items);
	}

	const tally = new Map<string, [number, number]>();
	for (const it of items) {
		const [c, h] = tally.get(it.category) ?? [0, 0];
		tally.set(it.category, [c + 1, h + it.hearts]);
	}

	return {
		username,
		name: first.author?.name || username,
		creations: first.author?.creations ?? items.length,
		hearts: first.author?.hearts ?? 0,
		profile: first.profile ?? null,
		items,
		// Array.from rather than spreading the iterator: this repo targets
		// es5 without downlevelIteration, so [...map.entries()] will not
		// compile even though it runs fine.
		disciplines: Array.from(tally.entries())
			.map(([code, [c, h]]) => [code, c, h] as [string, number, number])
			.sort((a, b) => b[1] - a[1]),
		found: Boolean(first.author && first.author.creations > 0) || items.length > 0,
	};
}

/** Best-hearted first, newest breaking the tie. */
export const byHearts = (items: Creation[]) =>
	[...items].sort(
		(a, b) =>
			b.hearts - a.hearts ||
			Date.parse(b.created_at) - Date.parse(a.created_at),
	);

export const firstImage = (item: Creation) =>
	item.media.find((m) => m.content_type.startsWith("image/")) ?? item.media[0];
