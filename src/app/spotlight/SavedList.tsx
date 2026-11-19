'use client';

import { CLAIM_START_URL } from './constants';
import useSaved from './useSaved';

const CATEGORY_NAMES: Record<string, string> = {
  gfx: 'GFX', '2d': '2D Art', build: 'Build', ui: 'UI', model: '3D Model',
  animation: 'Animation', vfx: 'VFX', clothing: 'Clothing', clip: 'Video',
  game: 'Game', scripting: 'Scripting', audio: 'Audio', logo: 'Logo',
};

/**
 * whimco.com/spotlight/saved: the viewer's saved creators, a private
 * rolodex. Each row opens the creator's portfolio, where Say hello is.
 */
export default function SavedList() {
  const saved = useSaved();

  const signIn = () => {
    const next = encodeURIComponent(window.location.href);
    window.location.href = `${CLAIM_START_URL}?next=${next}`;
  };

  return (
    <main className="sv">
      <style>{`
        .sv { max-width: 860px; margin: 0 auto; padding: 7rem 16px 4rem; color: #e8e8f0;
              font-family: var(--font-mono), monospace; }
        .sv h1 { font-family: var(--font-display), sans-serif; font-size: clamp(1.8rem, 4vw, 2.6rem);
                 margin: 0 0 0.4rem; letter-spacing: -0.01em; }
        .sv-sub { color: #9ba0b4; font-size: 0.8rem; letter-spacing: 0.06em; line-height: 1.7; margin: 0 0 2rem; }
        .sv-sub button { background: none; border: 0; color: #ffd98a; font: inherit; cursor: pointer;
                         padding: 0; text-decoration: underline; }
        .sv-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.8rem; }
        .sv-row { display: flex; gap: 1rem; align-items: center; padding: 0.9rem; border-radius: 14px;
                  border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02);
                  text-decoration: none; color: inherit; transition: border-color 0.16s ease; }
        .sv-row:hover { border-color: rgba(255,217,138,0.45); }
        .sv-av { width: 44px; height: 44px; border-radius: 50%; background: #1a1a24; flex: none; object-fit: cover; }
        .sv-who { flex: 1; min-width: 0; }
        .sv-name { font-size: 1rem; color: #fff; }
        .sv-meta { font-size: 0.72rem; color: #9ba0b4; letter-spacing: 0.06em; margin-top: 0.2rem; }
        .sv-covers { display: flex; gap: 6px; flex: none; }
        .sv-covers img { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; background: #1a1a24; }
        .sv-empty { color: #9ba0b4; line-height: 1.8; font-size: 0.85rem; }
        .sv-empty a { color: #ffd98a; }
        @media (max-width: 640px) { .sv-covers img:nth-child(n+2) { display: none; } }
      `}</style>
      <h1>Saved creators</h1>
      {saved.ready && (
        <p className="sv-sub">
          Only you can see this list.{' '}
          {saved.signedIn
            ? 'Saves from Discord and from here land in the same place, and the list is in your Spotlight DMs too.'
            : (<>It is kept in this browser for now. <button type="button" onClick={signIn}>Sign in with Discord</button> to keep it everywhere and get it in your DMs.</>)}
        </p>
      )}
      {saved.ready && saved.items.length === 0 && (
        <p className="sv-empty">
          Nobody saved yet. Open a creator from the <a href="/spotlight/gallery">gallery</a> or
          the <a href="/spotlight/creators">creators directory</a> and press Save creator.
          In Discord, it is the Save creator button on a creator&apos;s card.
        </p>
      )}
      <ul className="sv-list">
        {saved.items.map((c) => (
          <li key={c.handle}>
            <a className="sv-row" href={`/spotlight/@${encodeURIComponent(c.handle)}`}>
              {c.avatar
                ? <img className="sv-av" src={c.avatar} alt="" />
                : <span className="sv-av" aria-hidden />}
              <span className="sv-who">
                <span className="sv-name">{c.handle}</span>
                <span className="sv-meta" style={{ display: 'block' }}>
                  {c.creations} creation{c.creations === 1 ? '' : 's'}
                  {c.categories.length ? ` · ${c.categories.map((k) => CATEGORY_NAMES[k] ?? k).join(', ')}` : ''}
                </span>
              </span>
              <span className="sv-covers">
                {c.covers.map((u) => <img key={u} src={u} alt="" loading="lazy" />)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
