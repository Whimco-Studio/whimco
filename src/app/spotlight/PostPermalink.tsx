'use client';

import { useState } from 'react';
import FeedStyles from './feedStyles';
import ShareButton from './ShareButton';
import useLikes from './useLikes';
import VerifiedSeal from './VerifiedSeal';
import AudioTile from './AudioTile';
import {
  CATEGORY_LABELS, ShowcaseItem, ShowcaseMedia, cleanCaption, xLink, mediaKind, mediaPath,
  SHOW_HEART_COUNTS,
} from './constants';

function Media({ item }: { item: ShowcaseMedia }) {
  const [dead, setDead] = useState(false);

  const kind = mediaKind(item);
  if (kind === 'audio') {
    return (
      <div className="permalink-audio">
        <AudioTile seed={mediaPath(item.url)} />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio src={item.url} controls preload="metadata" />
      </div>
    );
  }
  if (kind === 'video') {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video controls playsInline preload="metadata" poster={item.thumbnail}>
        <source src={item.url} type="video/mp4" />
      </video>
    );
  }
  if (dead) return <span className="dead">image unavailable</span>;
  return <img src={item.url} alt="" onError={() => setDead(true)} />;
}

/** One creation on its own page, which is the thing every share button
    points at. Deliberately not the feed card at a larger size: arriving
    here means someone followed a link to this creation specifically, so
    the media gets the room and the surrounding timeline is a link rather
    than a column to scroll. */
/** Curator only: take this post off whimco.com from its own page, with an
    undo, since the page itself is where a bad post is usually found.
    Nothing for anyone else. The Discord copies stay either way. */
function StaffRemove({ id }: { id: number }) {
  const likes = useLikes();
  const [state, setState] = useState<'idle' | 'armed' | 'busy' | 'gone' | 'failed'>('idle');
  if (!likes.isCurator) return null;

  const act = async (hidden: boolean) => {
    setState('busy');
    const ok = await likes.hide(id, hidden);
    setState(ok ? (hidden ? 'gone' : 'idle') : 'failed');
  };

  if (state === 'gone') {
    return (
      <p className="permalink-staff" role="status">
        Removed from whimco.com. It disappears from the gallery within a few minutes.
        {' '}
        <button type="button" className="permalink-staff-btn" onClick={() => act(false)}>Undo</button>
      </p>
    );
  }
  return (
    <p className="permalink-staff">
      <button
        type="button"
        className={`permalink-staff-btn ${state === 'armed' ? 'permalink-staff-armed' : ''}`}
        disabled={state === 'busy'}
        onBlur={() => { if (state === 'armed') setState('idle'); }}
        onClick={() => (state === 'armed' ? act(true) : setState('armed'))}
      >
        {state === 'armed' ? 'Press again to remove' : 'Remove from gallery (staff)'}
      </button>
      {state === 'failed' && <span role="alert"> Not removed, try again.</span>}
    </p>
  );
}

export default function PostPermalink({ item }: { item: ShowcaseItem }) {
  const caption = cleanCaption(item.content || '');
  const x = xLink(item.content || '');
  const label = item.category ? (CATEGORY_LABELS[item.category] ?? item.category) : '';
  const when = new Date(item.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="feedpage">
      <FeedStyles />
      <div className="wrap">
        <header className="masthead permalink-head">
          <p className="eyebrow">{label || 'creation'}</p>
          <h1>
            <a className="permalink-author" href={`/spotlight/@${encodeURIComponent(item.author_name)}`}>
              {item.author_name}
            </a>
            {item.author_claimed && <VerifiedSeal />}
          </h1>
          <p className="sub">{when}</p>
        </header>

        <article className="permalink">
          {item.media.length > 0 && (
            <div className="permalink-media">
              {item.media.map((m, i) => (
                <Media key={`${item.id}-${i}`} item={m} />
              ))}
            </div>
          )}

          {caption && <p className="permalink-caption">{caption}</p>}

          <div className="foot permalink-foot">
            {item.hearts > 0 && SHOW_HEART_COUNTS && <span className="hearts">&#9829; {item.hearts}</span>}
            <span className="tag">#{item.tag}</span>
            {x && (
              <a className="xlink" href={x} target="_blank" rel="noopener noreferrer">
                view on X &#8599;
              </a>
            )}
            <ShareButton id={item.id} authorName={item.author_name} className="permalink-share" />
          </div>
        </article>

        <StaffRemove id={item.id} />

        <p className="note">
          <a href={`/spotlight/feed?post=${item.id}`}>See it in the feed</a>
          {' · '}
          <a href={`/spotlight/@${encodeURIComponent(item.author_name)}`}>
            More from {item.author_name}
          </a>
        </p>
      </div>
    </div>
  );
}
