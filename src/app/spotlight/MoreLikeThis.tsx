import ReferenceTile from './ReferenceTile';
import ReferenceStyles from './referenceStyles';
import { fetchMoreLikeThis } from './constants';

/** Creations sharing confirmed reference tags with this one, under the
    permalink. Renders nothing until the creation has confirmed tags. */
export default async function MoreLikeThis({ id }: { id: number }) {
  const items = await fetchMoreLikeThis(id);
  if (items.length === 0) return null;
  return (
    <section className="rf-like" aria-label="More like this">
      <ReferenceStyles />
      <h2>More like this</h2>
      <div className="rf-grid">
        {items.map((it) => <ReferenceTile key={it.id} item={it} />)}
      </div>
    </section>
  );
}
