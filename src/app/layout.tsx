import type { Metadata } from "next";
import { inter } from "./fonts";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
	// Absolute base for og:image/twitter:image URLs — without it Next falls
	// back to the per-deploy *.vercel.app URL, which sits behind deployment
	// protection and 302s crawlers away from the image.
	metadataBase: new URL("https://whimco.com"),
	// Site-wide: twimg media in the Spotlight gallery 403s foreign
	// referrers, and <video> has no referrerpolicy attribute — the
	// document policy must already be no-referrer on whichever page the
	// visitor entered from before navigating to the showcase.
	referrer: "no-referrer",
	title: "Whimco",
	description: "Turning Whims into Wonders",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				{children}
				<Analytics />
			</body>
		</html>
	);
}