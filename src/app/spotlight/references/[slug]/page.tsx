import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { display, mono } from '../../../fonts';
import GlassNav from '../../../components/GlassNav';
import ReferenceBrowser from '../../ReferenceBrowser';
import ReferenceStyles from '../../referenceStyles';
import {
  REFERENCES_INDEXABLE, REFERENCE_MIN_INDEX, cleanSlug, fetchReferenceIndex, fetchReferencePage,
  referencePath,
} from '../../constants';

export const revalidate = 300;

type RawParams = { [key: string]: string | string[] | undefined };

function readPage(raw: RawParams): number {
  const v = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const n = Number.parseInt(v ?? '1', 10);
  return Number.isFinite(n) && n > 1 ? Math.min(n, 999) : 1;
}

export async function generateMetadata(
  { params, searchParams }: { params: { slug: string }; searchParams: RawParams },
): Promise<Metadata> {
  const slug = cleanSlug(params.slug);
  const style = cleanSlug(searchParams.style);
  const data = slug ? await fetchReferencePage(slug, style, readPage(searchParams)) : 'missing';
  if (!data || data === 'missing') {
    return { title: 'References | Spotlight by Whimco', robots: { index: false } };
  }
  const { label, count } = data.tag;
  return {
    title: `Roblox ${label} references, made by creators | Spotlight by Whimco`,
    description: `${count.toLocaleString('en-US')} Roblox ${label.toLowerCase()} creations made by creators `
      + 'across the Spotlight network. Find a reference for what you are making, then see who made it.',
    alternates: { canonical: referencePath(slug) },
    robots: {
      index: REFERENCES_INDEXABLE && count >= REFERENCE_MIN_INDEX && !style && readPage(searchParams) === 1,
      follow: true,
    },
    referrer: 'no-referrer',
  };
}

export default async function ReferenceSubjectPage(
  { params, searchParams }: { params: { slug: string }; searchParams: RawParams },
) {
  const slug = cleanSlug(params.slug);
  if (!slug || slug === 'all') notFound();
  const style = cleanSlug(searchParams.style);
  const [index, data] = await Promise.all([
    fetchReferenceIndex(),
    fetchReferencePage(slug, style, readPage(searchParams)),
  ]);
  // The backend's 404 covers an unknown subject, an unapproved one and an
  // unknown style alike; all of them are a plain 404 here.
  if (data === 'missing') notFound();
  return (
    <div className={`${display.variable} ${mono.variable}`} style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <GlassNav />
      <ReferenceStyles />
      <ReferenceBrowser index={index} data={data} slug={slug} style={style} />
    </div>
  );
}
