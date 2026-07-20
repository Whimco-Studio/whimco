import GlassNav from "./components/GlassNav";

/** Shared shell for the legal pages — server-rendered, dark, readable. */
export default function LegalPage({
	title,
	updated,
	children,
}: {
	title: string;
	updated: string;
	children: React.ReactNode;
}) {
	return (
		<main className="min-h-screen bg-[#0a0a0f] text-slate-200">
			<GlassNav />
			<article className="mx-auto max-w-3xl px-6 pb-24 pt-36">
				<h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
				<p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
				<div
					className="legal mt-10 space-y-4 text-[15px] leading-7 text-slate-300
						[&_a]:text-amber-300 [&_a]:underline-offset-2 hover:[&_a]:underline
						[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white
						[&_li]:ml-5 [&_li]:list-disc"
				>
					{children}
				</div>
			</article>
		</main>
	);
}
