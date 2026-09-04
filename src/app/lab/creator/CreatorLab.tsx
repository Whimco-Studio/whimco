"use client";

import { useEffect, useState } from "react";
import type { CreatorView } from "./creator";
import CardLayout from "./layouts/CardLayout";
import DisciplineLayout from "./layouts/DisciplineLayout";
import FeatureLayout from "./layouts/FeatureLayout";
import SheetLayout from "./layouts/SheetLayout";

/**
 * Four layouts for one creator's real portfolio, on one keypress.
 *
 * The slugs are stable because they are the thing a creator would be
 * choosing between if this ships: a `layout` column on ClaimedProfile
 * holding one of these four, plus `accent`. The accent picker is here for
 * the same reason. It is the cheapest axis of "make it mine" that cannot
 * take a portfolio off-brand or produce something unreadable, which a
 * free-form theme field would do on its first afternoon.
 */

const LAYOUTS = [
	{ id: "sheet", name: "Sheet", Component: SheetLayout },
	{ id: "feature", name: "Feature", Component: FeatureLayout },
	{ id: "card", name: "Card", Component: CardLayout },
	{ id: "discipline", name: "Discipline", Component: DisciplineLayout },
] as const;

const ACCENTS = [
	{ id: "pink", hex: "#ff86ff", name: "Spotlight pink" },
	{ id: "cyan", hex: "#22d3ee", name: "Cyan" },
	{ id: "lime", hex: "#a3e635", name: "Lime" },
	{ id: "amber", hex: "#fbbf24", name: "Amber" },
	{ id: "violet", hex: "#a855f7", name: "Violet" },
] as const;

const STORE = "whimco.lab.creator";

export default function CreatorLab({ creator }: { creator: CreatorView }) {
	const [n, setN] = useState(0);
	const [a, setA] = useState(0);

	// read after mount, so the server and the first client render agree
	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORE);
			if (!raw) return;
			const saved = JSON.parse(raw) as { layout?: string; accent?: string };
			const li = LAYOUTS.findIndex((l) => l.id === saved.layout);
			const ai = ACCENTS.findIndex((c) => c.id === saved.accent);
			if (li >= 0) setN(li);
			if (ai >= 0) setA(ai);
		} catch {
			/* private window, blocked site data, or a stale shape */
		}
	}, []);

	const save = (layout: number, accent: number) => {
		try {
			localStorage.setItem(
				STORE,
				JSON.stringify({
					layout: LAYOUTS[layout].id,
					accent: ACCENTS[accent].id,
				}),
			);
		} catch {
			/* nothing to do if it will not persist */
		}
	};

	const pickLayout = (i: number) => { setN(i); save(i, a); };
	const pickAccent = (i: number) => { setA(i); save(n, i); };

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const i = Number(e.key) - 1;
			if (i >= 0 && i < LAYOUTS.length) pickLayout(i);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
		// re-bound when the accent changes, because pickLayout saves both
		// and a stale closure would write back the previous swatch
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [a]);

	const { Component } = LAYOUTS[n];

	return (
		<div
			className="clab"
			style={{ "--accent": ACCENTS[a].hex } as React.CSSProperties}
		>
			<main className="clab-stage">
				{creator.found ? (
					<Component creator={creator} />
				) : (
					<div className="clab-missing">
						<h1>
							{creator.username
								? `No creator called ${creator.username}`
								: "Pick a creator"}
						</h1>
						<p>
							Add <code>?u=</code> and a Spotlight username to see that
							portfolio in all four layouts. Names come from the creator
							directory at /spotlight/creators.
						</p>
					</div>
				)}
			</main>

			<nav className="clab-bar" aria-label="Portfolio layout">
				{LAYOUTS.map((l, i) => (
					<button
						type="button"
						key={l.id}
						className="clab-tab"
						aria-pressed={i === n}
						onClick={() => pickLayout(i)}
					>
						<span className="clab-key">{i + 1}</span>
						{l.name}
					</button>
				))}

				<span className="clab-swatches">
					{ACCENTS.map((c, i) => (
						<button
							type="button"
							key={c.id}
							className="clab-swatch"
							style={{ background: c.hex }}
							aria-pressed={i === a}
							aria-label={c.name}
							title={c.name}
							onClick={() => pickAccent(i)}
						/>
					))}
				</span>

				<span className="clab-who">@{creator.name}</span>
			</nav>
		</div>
	);
}
