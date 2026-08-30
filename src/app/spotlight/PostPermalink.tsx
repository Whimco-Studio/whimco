'use client';

import { useState } from 'react';
import FeedStyles from './feedStyles';
import ShareButton from './ShareButton';
import VerifiedSeal from './VerifiedSeal';
import {
  CATEGORY_LABELS, ShowcaseItem, ShowcaseMedia, cleanCaption, xLink,
} from './constants';

function Media({ item }: { item: ShowcaseMedia }) {
  const [dead, setDead] = useState(false);

  if (item.content_type?.startsWith('video')) {
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
            {item.hearts > 0 && <span className="hearts">&#9829; {item.hearts}</span>}
            <span className="tag">#{item.tag}</span>
            {x && (
              <a className="xlink" href={x} target="_blank" rel="noopener noreferrer">
                view on X &#8599;
              </a>
            )}
            <ShareButton id={item.id} authorName={item.author_name} className="permalink-share" />
          </div>
        </article>

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
