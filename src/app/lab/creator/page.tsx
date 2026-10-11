import type { Metadata } from "next";
import { display, mono } from "../../fonts";
import CreatorLab from "./CreatorLab";
import { DEFAULT_USER, getCreator } from "./creator";
import "./creator.css";

export const metadata: Metadata = {
	title: "Creator portfolio lab",
	robots: { index: false, follow: false },
	referrer: "no-referrer",
};

// Matches the live portfolio's window. Long enough that flipping layouts
// costs nothing, short enough that a creation posted mid-review shows up.
export const revalidate = 300;

export default async function CreatorLabPage({
	searchParams,
}: {
	searchParams: { u?: string };
}) {
	const username = (searchParams.u || DEFAULT_USER).replace(/^@/, "");
	const creator = await getCreator(username);
	return (
		<div className={`${display.variable} ${mono.variable}`}>
			<CreatorLab creator={creator} />
		</div>
	);
}
