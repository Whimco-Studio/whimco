"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_LABELS } from "../../spotlight/constants";
import type { Creation, CreatorView } from "./creator";

/** One creation's media. Video autoplays on hover the way the real
    gallery does, and falls back to its poster where it cannot. */
export function Media({ item, className }: { item: Creation; className?: string }) {
	const ref = useRef<HTMLVideoElement>(null);
	const m = item.media[0];
	if (!m) return <span className={`clab-media ${className ?? ""}`} />;

	if (m.content_type.startsWith("video/")) {
		return (
			<>
				<video
					ref={ref}
					className={`clab-media ${className ?? ""}`}
					src={m.url}
					poster={m.thumbnail || undefined}
					muted
					loop
					playsInline
					preload="metadata"
					onMouseEnter={() => ref.current?.play().catch(() => {})}
					onMouseLeave={() => ref.current?.pause()}
				/>
				<span className="clab-vid" aria-hidden>
					▶
				</span>
			</>
		);
	}
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			className={`clab-media ${className ?? ""}`}
			src={m.url}
			alt=""
			loading="lazy"
			referrerPolicy="no-referrer"
		/>
	);
}

/** The creator's avatar, or nothing.

    Discord CDN avatar URLs expire, and a bordered empty circle reads as a
    broken page rather than a creator who has no picture. Removing the
    element on error is the only way to tell those two apart, since a
    non-null avatar_url is not a promise the image still resolves. */
export function Avatar({
	url,
	className,
}: {
	url: string | null | undefined;
	className: string;
}) {
	const [dead, setDead] = useState(false);
	if (!url || dead) return null;
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			className={className}
			src={url}
			alt=""
			referrerPolicy="no-referrer"
			onError={() => setDead(true)}
		/>
	);
}

/** Hidden at zero, the same rule the real portfolio uses: a creator with
    no hearts yet is a creator with creations, not a creator with a nought. */
export function Hearts({ n }: { n: number }) {
	if (n <= 0) return null;
	return (
		<span className="clab-hearts">
			<span aria-hidden>♥</span>
			{n}
		</span>
	);
}

export const label = (code: string) => CATEGORY_LABELS[code] ?? code;

/** Copy the Discord handle rather than link it. Discord has no public
    profile page, so a link lands most people on a login wall, and
    publishing the snowflake as an invitation is not something anyone
    agreed to by claiming a portfolio. Copying is what people want
    anyway: reaching someone means pasting the handle into Discord. */
export function CopyHandle({
	handle,
	className,
}: {
	handle: string;
	className?: string;
}) {
	const [state, setState] = useState<"idle" | "done" | "failed">("idle");
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

	const copy = async () => {
		if (timer.current) clearTimeout(timer.current);
		try {
			await navigator.clipboard.writeText(handle);
			setState("done");
		} catch {
			// no clipboard permission, or an insecure context: show the
			// handle as selectable text instead of failing silently
			setState("failed");
		}
		timer.current = setTimeout(() => setState("idle"), 2000);
	};

	return (
		<button type="button" className={className} onClick={copy}>
			{state === "done"
				? "Copied ✓"
				: state === "failed"
					? handle
					: "Copy Discord handle"}
		</button>
	);
}

/** The handle worth showing. A claimed profile is authoritative on its
    own because that username comes from OAuth and refreshes on login;
    unclaimed, it is only as good as a creation we have actually seen. */
export const handleOf = (c: CreatorView) =>
	c.profile?.username || (c.creations > 0 ? c.name : "");
