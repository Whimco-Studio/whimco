import type { Metadata } from 'next';
import { display, mono } from '../../fonts';
import GlassNav from '../../components/GlassNav';
import JobsBoard from './JobsBoard';

// A demo, not a launch: nothing links here, it is not in the sitemap,
// and it stays out of the index until the listings come from the box
// with expiry, owner opt-in and the hirer check behind them.
export const metadata: Metadata = {
  title: 'Roblox Jobs: Spotlight | Whimco',
  description: 'Roblox jobs read from the hiring channels of the servers Spotlight broadcasts into.',
  robots: { index: false, follow: false },
};

export default function JobsPage() {
  return (
    <div
      className={`${display.variable} ${mono.variable}`}
      style={{ background: '#0a0a0f', minHeight: '100vh' }}
    >
      <GlassNav />
      <JobsBoard />
    </div>
  );
}
