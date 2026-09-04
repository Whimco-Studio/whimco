"use client";

import { byHearts, type CreatorView } from "../creator";
import { Avatar, CopyHandle, Hearts, Media, handleOf, label } from "../pieces";

/**
 * Discipline: the work grouped by what it is.
 *
 * Nobody opens a portfolio asking what this person posted most recently.
 * They open it asking whether this person does UI. Every creation has
 * carried a category since the taxonomy shipped and no layout had ever
 * read it, so a visitor answering that question was scrolling a mixed
 * grid and counting in their head.
 *
 * Sections run in order of how much of the body of work each is, and the
 * bar beside each heading is that share.
 */
export default function DisciplineLayout({ creator }: { creator: CreatorView }) {
	const p = creator.profile;
	const handle = handleOf(creator);
	const top = creator.disciplines[0]?.[1] ?? 1;

	return (
		<div className="dc">
			<header className="dc-head">
				<Avatar url={p?.avatar_url} className="dc-avatar" />
				<div className="dc-id">
					<h1 className="dc-name">{creator.name}</h1>
					{p?.bio ? <p className="dc-bio">{p.bio}</p> : null}
				</div>
				{p?.links.length || handle ? (
					<div className="dc-links">
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
			</header>

			{creator.disciplines.map(([code, count, hearts]) => {
				const pieces = byHearts(
					creator.items.filter((i) => i.category === code),
				);
				return (
					<section className="dc-section" key={code}>
						<div className="dc-sec-head">
							<h2 className="dc-sec-title">{label(code)}</h2>
							<span className="dc-sec-count">
								{count} {count === 1 ? "creation" : "creations"}
								{hearts > 0
									? `, ${hearts} ${hearts === 1 ? "heart" : "hearts"}`
									: ""}
							</span>
							<span
								className="dc-weight"
								aria-hidden
								style={
									{ "--w": `${Math.round((count / top) * 100)}%` } as
										React.CSSProperties
								}
							>
								<i />
							</span>
						</div>
						<div className="dc-row">
							{pieces.map((item) => (
								<a
									className="dc-piece"
									key={item.id}
									href={`/spotlight/p/${item.id}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Media item={item} />
									<span className="dc-piece-h">
										<Hearts n={item.hearts} />
									</span>
								</a>
							))}
						</div>
					</section>
				);
			})}

			<p className="dc-foot">
				{creator.creations.toLocaleString("en-US")} creations across{" "}
				{creator.disciplines.length}{" "}
				{creator.disciplines.length === 1 ? "discipline" : "disciplines"}.
				Rows are ordered by hearts within each discipline.
			</p>
		</div>
	);
}
