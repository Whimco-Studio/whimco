'use client';

import React, { useEffect, useRef, useState } from 'react';
import VerifiedSeal from './VerifiedSeal';
import {
  CATEGORY_LABELS, CLAIM_URL, PortfolioLayout, ShowcaseItem, ShowcaseProfile,
} from './constants';

/** The creator's Discord handle, click to copy.

    Deliberately not a link. Discord has no public profile page, and
    discord.com/users/<id> only resolves into a popout for a viewer already
    signed in on that device, so most clicks would land on a login wall.
    Linking would also mean publishing the Discord snowflake as an
    invitation, which nobody agreed to by claiming a portfolio.

    Copying is the thing people actually want anyway: reaching a creator
    means pasting the handle into Discord's own search. Never the free-text
    contact line, which is whatever the creator typed and is often an email.

    Shown for unclaimed creators too, from author_name captured when the bot
    broadcast the post. This publishes nothing new either way: the handle is
    already the page title and the byline under every card, and the button
    copies what is on screen. The Discord user id stays out of the payload. */
export function DiscordHandle({ handle }: { handle: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(handle);
      setState('copied');
    } catch {
      // No clipboard permission, or an insecure context. Falling back to
      // the handle in selectable text, because a button that silently does
      // nothing reads as broken and leaves them no way to reach anyone.
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  return (
    <span className="pf-copy-wrap">
      <button
        type="button"
        className={`pf-copy ${state === 'copied' ? 'pf-copy-done' : ''}`}
        onClick={copy}
        title={`Copy ${handle} to your clipboard`}
        aria-live="polite"
      >
        {state === 'copied' ? 'Copied ✓' : 'Discord ⧉'}
      </button>
      {state === 'failed' && <span className="pf-copy-fail">{handle}</span>}
    </span>
  );
}

/** Discord CDN avatar URLs expire, and a bordered empty circle reads as a
    broken page rather than a creator with no picture. A non-null
    avatar_url is not a promise the image still resolves, so the only way
    to tell those apart is to drop the element when it fails. */
export function Avatar({ url, className }: {
  url: string | null | undefined; className: string;
}) {
  const [dead, setDead] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The server renders this img, so a 404 can land before React hydrates
  // and fires its error event into no handler at all. onError catches the
  // slow failures; this catches the ones that already happened, which on
  // an expired Discord avatar is most of them.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setDead(true);
  }, [url]);

  if (!url || dead) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      className={className}
      src={url}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setDead(true)}
    />
  );
}

export type Discipline = [code: string, count: number, hearts: number];

/** What this creator makes, biggest body of work first. Counted from the
    creations actually loaded, so it grows as "show more" is pressed. */
export function disciplinesOf(items: ShowcaseItem[]): Discipline[] {
  const tally = new Map<string, [number, number]>();
  items.forEach((i) => {
    const [c, h] = tally.get(i.category) ?? [0, 0];
    tally.set(i.category, [c + 1, h + i.hearts]);
  });
  return Array.from(tally.entries())
    .map(([code, [c, h]]) => [code, c, h] as Discipline)
    .sort((a, b) => b[1] - a[1]);
}

export const catLabel = (code: string) => CATEGORY_LABELS[code] ?? code;

export type HeaderProps = {
  layout: PortfolioLayout;
  name: string;
  profile?: ShowcaseProfile | null;
  author?: { name: string; creations: number; hearts: number } | null;
  handle: string;
  disciplines: Discipline[];
  hero?: ShowcaseItem;
  /** The pencil, when the reader owns this portfolio. A slot rather than
      a flag: the button carries the editor's state, which belongs to
      Portfolio, and every layout only has to say where it sits. */
  editControl?: React.ReactNode;
};

/** The counts line. Hearts drop out entirely at zero rather than reading
    "0 hearts from the network" under someone's name, which says the
    network saw their work and passed. A creator with no hearts yet is
    simply a creator with creations. */
function Counts({ author }: { author: HeaderProps['author'] }) {
  if (!author) return null;
  return (
    <p className="pf-sub">
      <b>{author.creations.toLocaleString('en-US')}</b> creation
      {author.creations === 1 ? '' : 's'} broadcast
      {author.hearts > 0 && (
        <>
          {' · '}
          <b>{author.hearts.toLocaleString('en-US')}</b> heart
          {author.hearts === 1 ? '' : 's'} from the network
        </>
      )}
    </p>
  );
}

/** The link row, which is also where the Discord handle lives so it reads
    as one more way to reach this person. Renders for a creator with no
    links, and for an unclaimed one who has no profile block at all. */
function Links({ profile, handle, className }: {
  profile?: ShowcaseProfile | null; handle: string; className: string;
}) {
  if (!profile?.links.length && !handle) return null;
  return (
    <p className={className}>
      {(profile?.links ?? []).map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="nofollow noopener noreferrer">
          {l.label} ↗
        </a>
      ))}
      {!!handle && <DiscordHandle handle={handle} />}
    </p>
  );
}

/** Shown even at zero creations: the welcome DM sends first-time creators
    straight here, and the showcase API and this page's ISR each cache for
    five minutes, so their first creation has not landed yet. Gating on
    creations > 0 hid the claim from exactly the people it was written for. */
function ClaimCta({ profile, author }: {
  profile?: ShowcaseProfile | null; author: HeaderProps['author'];
}) {
  if (profile || !author) return null;
  return (
    <p className="pf-claim-cta">
      <span>Is this you?</span>
      <a href={CLAIM_URL}>CLAIM THIS PORTFOLIO</a>
    </p>
  );
}

function Chips({ disciplines, withCounts }: {
  disciplines: Discipline[]; withCounts: boolean;
}) {
  if (!disciplines.length) return null;
  return (
    <p className="pl-chips">
      {disciplines.map(([code, n]) => (
        <span className="pl-chip" key={code}>
          {catLabel(code)}{withCounts ? ` ${n}` : ''}
        </span>
      ))}
    </p>
  );
}

/**
 * The portfolio header, in whichever arrangement the creator chose.
 *
 * Only the identity block changes here. The creations underneath are the
 * same GalleryGrid in every layout, so hearts, the lightbox and the
 * owner's remove button behave identically no matter what is picked. A
 * layout that reimplemented the grid would have to reimplement those too,
 * and would drift the first time one of them changed.
 */
export default function PortfolioHeader(props: HeaderProps) {
  const { layout } = props;
  if (layout === 'sheet') return <SheetHead {...props} />;
  if (layout === 'feature') return <FeatureHead {...props} />;
  if (layout === 'card') return <CardHead {...props} />;
  if (layout === 'discipline') return <DisciplineHead {...props} />;
  return <ClassicHead {...props} />;
}

function ClassicHead({ name, profile, author, handle, editControl }: HeaderProps) {
  return (
    <header className="pf-head">
      <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
      <div className="pf-name-row">
        <Avatar url={profile?.avatar_url} className="pf-avatar" />
        <h1 className="pf-name">{name}</h1>
        {profile && <VerifiedSeal className="pf-verified" />}
        {editControl}
      </div>
      <Counts author={author} />
      {profile?.bio && <p className="pf-bio">{profile.bio}</p>}
      <Links profile={profile} handle={handle} className="pf-links" />
      {profile?.contact && <p className="pf-contact">{profile.contact}</p>}
      <ClaimCta profile={profile} author={author} />
    </header>
  );
}

function SheetHead({ name, profile, author, handle, disciplines, editControl }: HeaderProps) {
  return (
    <header className="pf-head pl-rail">
      <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
      <Avatar url={profile?.avatar_url} className="pf-avatar pl-rail-avatar" />
      <div className="pf-name-row">
        <h1 className="pf-name">{name}</h1>
        {profile && <VerifiedSeal className="pf-verified" />}
        {editControl}
      </div>
      <Counts author={author} />
      <Chips disciplines={disciplines} withCounts />
      {profile?.bio && <p className="pf-bio">{profile.bio}</p>}
      <Links profile={profile} handle={handle} className="pf-links pl-rail-links" />
      {profile?.contact && <p className="pf-contact">{profile.contact}</p>}
      <ClaimCta profile={profile} author={author} />
    </header>
  );
}

function FeatureHead({
  name, profile, author, handle, disciplines, hero, editControl,
}: HeaderProps) {
  const shot = hero?.media.find((m) => m.content_type.startsWith('image/'))
    ?? hero?.media[0];
  const still = shot?.content_type.startsWith('video/')
    ? shot.thumbnail
    : shot?.url;

  return (
    <header className="pf-head pl-hero">
      {still && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pl-hero-shot" src={still} alt="" referrerPolicy="no-referrer" />
      )}
      <span className="pl-hero-veil" aria-hidden />
      <div className="pl-hero-body">
        <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
        <div className="pf-name-row">
          <Avatar url={profile?.avatar_url} className="pf-avatar" />
          <h1 className="pf-name pl-hero-name">{name}</h1>
          {profile && <VerifiedSeal className="pf-verified" />}
        {editControl}
        </div>
        <Counts author={author} />
        <Chips disciplines={disciplines} withCounts={false} />
        {profile?.bio && <p className="pf-bio">{profile.bio}</p>}
        <Links profile={profile} handle={handle} className="pf-links" />
        {profile?.contact && <p className="pf-contact">{profile.contact}</p>}
        <ClaimCta profile={profile} author={author} />
      </div>
    </header>
  );
}

function CardHead({ name, profile, author, handle, disciplines, editControl }: HeaderProps) {
  return (
    <header className="pf-head pl-card">
      <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
      <Avatar url={profile?.avatar_url} className="pf-avatar pl-card-avatar" />
      <div className="pf-name-row">
        <h1 className="pf-name">{name}</h1>
        {profile && <VerifiedSeal className="pf-verified" />}
        {editControl}
      </div>
      <Chips disciplines={disciplines} withCounts={false} />
      {profile?.bio && <p className="pf-bio">{profile.bio}</p>}
      <Counts author={author} />
      <Links profile={profile} handle={handle} className="pf-links pl-card-links" />
      {profile?.contact && <p className="pf-contact">{profile.contact}</p>}
      <ClaimCta profile={profile} author={author} />
    </header>
  );
}

function DisciplineHead({ name, profile, author, handle, editControl }: HeaderProps) {
  return (
    <header className="pf-head pl-compact">
      <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
      <div className="pl-compact-row">
        <Avatar url={profile?.avatar_url} className="pf-avatar" />
        <div className="pl-compact-id">
          <div className="pf-name-row">
            <h1 className="pf-name">{name}</h1>
            {profile && <VerifiedSeal className="pf-verified" />}
        {editControl}
          </div>
          <Counts author={author} />
          {profile?.bio && <p className="pf-bio">{profile.bio}</p>}
        </div>
        <Links profile={profile} handle={handle} className="pf-links" />
      </div>
      {profile?.contact && <p className="pf-contact">{profile.contact}</p>}
      <ClaimCta profile={profile} author={author} />
    </header>
  );
}
