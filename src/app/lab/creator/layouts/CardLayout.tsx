"use client";

import type { CreatorView } from "../creator";
import { Avatar, CopyHandle, Media, handleOf, label } from "../pieces";

/**
 * Card: the link-in-bio treatment.
 *
 * These portfolios exist because someone pasted the URL into Discord, so
 * most first views are one column on a phone. This layout was drawn at
 * that width rather than reduced to it, and the links are the tap targets
 * they need to be instead of a row of small text.
 */
export default function CardLayout({ creator }: { creator: CreatorView }) {
	const p = creator.profile;
	const handle = handleOf(creator);

	return (
		<div className="cd">
			<Avatar url={p?.avatar_url} className="cd-avatar" />
			<h1 className="cd-name">{creator.name}</h1>

			{creator.disciplines.length ? (
				<div className="cd-disc">
					{creator.disciplines.map(([code]) => (
						<span className="clab-chip" key={code}>
							{label(code)}
						</span>
					))}
				</div>
			) : null}

			{p?.bio ? <p className="cd-bio">{p.bio}</p> : null}

			<div className="cd-stats">
				<div className="cd-stat">
					<b>{creator.creations.toLocaleString("en-US")}</b>
					<span>creations</span>
				</div>
				{creator.hearts > 0 ? (
					<div className="cd-stat">
						<b>{creator.hearts.toLocaleString("en-US")}</b>
						<span>hearts</span>
					</div>
				) : null}
				<div className="cd-stat">
					<b>{creator.disciplines.length}</b>
					<span>disciplines</span>
				</div>
			</div>

			{p?.links.length || handle ? (
				<div className="cd-links">
					{(p?.links ?? []).map((l) => (
						<a
							key={l.url}
							href={l.url}
							target="_blank"
							rel="nofollow noopener noreferrer"
						>
							{l.label}
						</a>
					))}
					{handle ? <CopyHandle handle={handle} /> : null}
				</div>
			) : null}

			{p?.contact ? <p className="cd-contact">{p.contact}</p> : null}

			<div className="cd-grid">
				{creator.items.map((item) => (
					<a
						className="cd-cell"
						key={item.id}
						href={`/spotlight/p/${item.id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Media item={item} />
					</a>
				))}
			</div>
		</div>
	);
}
