import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import CreatorLab from "./CreatorLab";
import { DEFAULT_USER, getCreator } from "./creator";
import "./creator.css";

// The same two faces the live portfolio loads, so a layout that looks
// better here is not just a different typeface winning.
const display = Bricolage_Grotesque({
	subsets: ["latin"],
	weight: ["500", "700", "800"],
	variable: "--font-display",
	display: "swap",
});
const mono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	variable: "--font-mono",
	display: "swap",
});

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
