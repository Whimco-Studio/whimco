"use client";

import { byHearts, type CreatorView } from "../creator";
import { Avatar, CopyHandle, Hearts, Media, handleOf, label } from "../pieces";

/**
 * Feature: their best-hearted piece takes the fold, with their name on it.
 *
 * A GFX artist gets judged on one image. This is the layout that lets the
 * network's own hearts decide which one, and puts the identity on top of
 * it rather than above it, so the first thing a visitor sees is work
 * rather than a header.
 */
export default function FeatureLayout({ creator }: { creator: CreatorView }) {
	const p = creator.profile;
	const handle = handleOf(creator);
	const ranked = byHearts(creator.items);
	const [hero, ...rest] = ranked;

	return (
		<div className="ft">
			<header className="ft-hero">
				{hero ? (
					<div className="ft-hero-media">
						<Media item={hero} />
					</div>
				) : null}
				<div className="ft-veil" />
				<div className="ft-hero-body">
					<div className="ft-idrow">
						<Avatar url={p?.avatar_url} className="ft-avatar" />
						<h1 className="ft-name">{creator.name}</h1>
					</div>

					<p className="ft-line">
						{creator.disciplines.slice(0, 4).map(([code, n]) => (
							<span key={code}>
								{label(code)} {n}
							</span>
						))}
						{creator.hearts > 0 ? (
							<Hearts n={creator.hearts} />
						) : null}
					</p>

					{p?.bio ? <p className="ft-bio">{p.bio}</p> : null}

					{p?.links.length || handle ? (
						<div className="ft-links">
							{(p?.links ?? []).map((l, i) => (
								<a
									key={l.url}
									className={i === 0 ? undefined : "ft-ghost"}
									href={l.url}
									target="_blank"
									rel="nofollow noopener noreferrer"
								>
									{l.label}
								</a>
							))}
							{handle ? (
								<CopyHandle handle={handle} className="ft-ghost" />
							) : null}
						</div>
					) : null}
				</div>
			</header>

			<div className="ft-rest">
				{rest.map((item) => (
					<a
						className="ft-piece"
						key={item.id}
						href={`/spotlight/p/${item.id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Media item={item} />
						<span className="ft-piece-meta">
							<span>{label(item.category)}</span>
							<Hearts n={item.hearts} />
						</span>
					</a>
				))}
			</div>
		</div>
	);
}
