import type { Metadata } from "next";
import HomePage from "./HomePage";

// The home page is a client component, which cannot export metadata, so
// this server wrapper carries its canonical URL.
export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

export default function Page() {
	return <HomePage />;
}
