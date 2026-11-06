import type { Metadata } from "next";

// The page is a client component, which cannot export metadata, so its
// canonical URL lives here.
export const metadata: Metadata = {
	alternates: { canonical: "/experiences" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
