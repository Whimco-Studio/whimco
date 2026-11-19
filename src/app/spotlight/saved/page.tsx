import type { Metadata } from 'next';
import { display, mono } from '../../fonts';
import GlassNav from '../../components/GlassNav';
import SavedList from '../SavedList';

// A private list: never indexed, and nothing on it for a crawler anyway.
export const metadata: Metadata = {
  title: 'Saved creators | Spotlight by Whimco',
  description: 'The Roblox creators you saved on Spotlight. Only you can see this list.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function SavedPage() {
  return (
    <div className={`${display.variable} ${mono.variable}`} style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <GlassNav />
      <SavedList />
    </div>
  );
}
