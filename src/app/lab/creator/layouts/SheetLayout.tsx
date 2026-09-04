"use client";

import type { CreatorView } from "../creator";
import { Avatar, CopyHandle, Hearts, Media, handleOf, label } from "../pieces";

/**
 * Sheet: a contact sheet with the identity parked in a rail.
 *
 * No card, no border, no caption under the work. Almost every creation
 * in this network has an empty caption, so the current card frame is
 * chrome drawn around nothing; here the grid is uninterrupted and the
 * category and hearts surface on hover instead.
 */
export default function SheetLayout({ creator }: { creator: CreatorView }) {
	const p = creator.profile;
	const handle = handleOf(creator);

	return (
		<div className="sh">
			<aside className="sh-rail">
				<Avatar url={p?.avatar_url} className="sh-avatar" />
				<h1 className="sh-name">{creator.name}</h1>

				<div className="sh-counts">
					<div className="sh-count">
						<b>{creator.creations.toLocaleString("en-US")}</b>
						<span>creations</span>
					</div>
					{creator.hearts > 0 ? (
						<div className="sh-count">
							<b>{creator.hearts.toLocaleString("en-US")}</b>
							<span>hearts</span>
						</div>
					) : null}
				</div>

				{creator.disciplines.length ? (
					<div className="sh-disc">
						{creator.disciplines.map(([code, n]) => (
							<span className="clab-chip" key={code}>
								{label(code)} {n}
							</span>
						))}
					</div>
				) : null}

				{p?.bio ? <p className="sh-bio">{p.bio}</p> : null}

				{p?.links.length || handle ? (
					<div className="sh-links">
						{(p?.links ?? []).map((l) => (
							<a
								key={l.url}
								href={l.url}
								target="_blank"
								rel="nofollow noopener noreferrer"
							>
								{l.label} ↗
							</a>
						))}
						{handle ? <CopyHandle handle={handle} /> : null}
					</div>
				) : null}

				{p?.contact ? <p className="sh-contact">{p.contact}</p> : null}
			</aside>

			<div className="sh-grid">
				{creator.items.map((item) => (
					<a
						className="sh-cell"
						key={item.id}
						href={`/spotlight/p/${item.id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Media item={item} />
						<span className="sh-meta">
							<span>{label(item.category)}</span>
							<Hearts n={item.hearts} />
						</span>
					</a>
				))}
			</div>
		</div>
	);
}
