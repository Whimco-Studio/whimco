import type { Metadata } from 'next';
import { display, mono } from '../../fonts';
import GlassNav from '../../components/GlassNav';
import ReferenceBrowser from '../ReferenceBrowser';
import ReferenceStyles from '../referenceStyles';
import {
  REFERENCES_INDEXABLE, cleanSlug, fetchReferenceIndex, fetchReferencePage,
} from '../constants';

export const revalidate = 300;

type RawParams = { [key: string]: string | string[] | undefined };

function readPage(raw: RawParams): number {
  const v = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const n = Number.parseInt(v ?? '1', 10);
  return Number.isFinite(n) && n > 1 ? Math.min(n, 999) : 1;
}

export async function generateMetadata(
  { searchParams }: { searchParams: RawParams },
): Promise<Metadata> {
  const style = cleanSlug(searchParams.style);
  return {
    title: 'Roblox references, made by creators | Spotlight by Whimco',
    description: 'Browse Roblox builds, models, UI, VFX and more by subject and style, made by real '
      + 'creators across the Spotlight network. Find a reference, then see who made it.',
    alternates: { canonical: '/spotlight/references' },
    robots: { index: REFERENCES_INDEXABLE && !style && readPage(searchParams) === 1, follow: true },
    referrer: 'no-referrer',
  };
}

export default async function ReferencesPage({ searchParams }: { searchParams: RawParams }) {
  const style = cleanSlug(searchParams.style);
  const [index, page] = await Promise.all([
    fetchReferenceIndex(),
    fetchReferencePage('all', style, readPage(searchParams)),
  ]);
  return (
    <div className={`${display.variable} ${mono.variable}`} style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <GlassNav />
      <ReferenceStyles />
      <ReferenceBrowser index={index} data={page === 'missing' ? null : page} slug="all" style={style} />
    </div>
  );
}
