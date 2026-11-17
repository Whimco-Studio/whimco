import { redirect } from 'next/navigation';
import { RawParams } from '../../spotlight/galleryView';

export const dynamic = 'force-dynamic';

/** The Pinterest-shaped demo became the live gallery on 2026-11-17, so
    any link to the demo goes there, filters and search kept. */
export default function GalleryDemoPage({ searchParams }: { searchParams: RawParams }) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams ?? {})) {
    if (typeof v === 'string') qs.set(k, v);
  }
  const tail = qs.toString();
  redirect(`/spotlight/gallery${tail ? `?${tail}` : ''}`);
}
