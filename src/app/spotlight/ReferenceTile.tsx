import AudioTile from './AudioTile';
import { ShowcaseItem, mediaKind, mediaPath, portfolioPath, postPath } from './constants';

/** One creation in the reference grid: the work uncropped at its own
    shape, and the creator's name under it at all times. The name is the
    point: a reference that leads back to whoever made it is a visit to
    their portfolio. No hooks, so it renders on the server too (the
    permalink's "More like this" row). */
export default function ReferenceTile({ item }: { item: ShowcaseItem }) {
  const m = item.media[0];
  const ratio = m?.w && m?.h ? `${m.w} / ${m.h}` : undefined;
  const kind = m ? mediaKind(m) : 'other';
  let visual: React.ReactNode = <span className="rf-empty">no preview</span>;
  if (m && kind === 'audio') {
    visual = <AudioTile seed={mediaPath(m.url)} />;
  } else if (m && kind === 'video') {
    visual = m.thumbnail
      ? <img src={m.thumbnail} alt="" loading="lazy" />
      // eslint-disable-next-line jsx-a11y/media-has-caption
      : <video src={m.url} muted playsInline preload="metadata" />;
  } else if (m) {
    visual = <img src={m.thumb || m.url} alt="" loading="lazy" />;
  }
  return (
    <figure className="rf-tile">
      <a className="rf-media" href={postPath(item.id)} style={ratio ? { aspectRatio: ratio } : undefined}
         aria-label={`Creation by ${item.author_name}`}>
        {visual}
        {kind === 'video' && <span className="rf-badge">clip</span>}
      </a>
      <figcaption>
        <a href={portfolioPath(item.author_name)}>{item.author_name}</a>
      </figcaption>
    </figure>
  );
}
