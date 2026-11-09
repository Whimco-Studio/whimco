'use client';

import { useEffect, useMemo, useState } from 'react';
import ShowcaseStyles from '../styles';
import JobsStyles from './jobsStyles';
import { DEMO_AS_OF, DEMO_JOBS, DemoJob } from './demoJobs';
import { SHOWCASE_API_URL } from '../constants';

/** What the key-gated /api/jobs/demo adds to a job. Fetched in the
    browser with the ?k= the operator opened the page with, so no name,
    avatar or image is ever committed to this public repo. */
type Live = {
  hirer: {
    name: string;
    avatar: string;
    discord_age_days: number | null;
    roblox_linked: boolean;
    jobs_posted: number;
    jobs_filled: number;
    backing: string;
  };
  images: string[];
};

function useLive(): Record<number, Live> {
  const [live, setLive] = useState<Record<number, Live>>({});
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get('k');
    if (!k) return;
    const base = new URL(SHOWCASE_API_URL).origin;
    fetch(`${base}/api/jobs/demo?k=${encodeURIComponent(k)}`, { cache: 'no-store', referrerPolicy: 'no-referrer' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { jobs: ({ id: number } & Live)[] } | null) => {
        if (!d) return;
        const byId: Record<number, Live> = {};
        d.jobs.forEach((j) => { byId[j.id] = { hirer: j.hirer, images: j.images }; });
        setLive(byId);
      })
      .catch(() => {});
  }, []);
  return live;
}

function years(days: number | null): string {
  if (days === null) return 'ACCOUNT AGE UNKNOWN';
  if (days < 60) return `${days}D OLD ACCOUNT`;
  if (days < 730) return `${Math.round(days / 30)}MO OLD ACCOUNT`;
  return `${Math.floor(days / 365)}Y OLD ACCOUNT`;
}

/** Facts only, never a verdict: creators judge the hirer themselves. */
function Hirer({ h }: { h: Live['hirer'] }) {
  const facts = [
    years(h.discord_age_days),
    h.roblox_linked ? 'ROBLOX LINKED' : 'NO ROBLOX LINK',
    `${h.jobs_filled} OF ${h.jobs_posted} FILLED`,
  ];
  return (
    <div className="jb-hirer">
      {h.avatar
        // eslint-disable-next-line @next/next/no-img-element
        ? <img className="jb-ava" src={h.avatar} alt="" referrerPolicy="no-referrer" />
        : <span className="jb-ava jb-ava-empty" aria-hidden="true">{(h.name[0] ?? '?').toUpperCase()}</span>}
      <div className="jb-hirer-text">
        <b>{h.name || 'Unknown hirer'}</b>
        <span>{facts.join(' · ')}</span>
      </div>
      {h.backing === 'refused' && <span className="jb-note jb-note-flag">Blacklight record</span>}
    </div>
  );
}

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const mid = (j: DemoJob) => (j.usdLo + j.usdHi) / 2;

function age(posted: string): string {
  const d = Math.round(
    (Date.parse(`${DEMO_AS_OF}T12:00:00Z`) - Date.parse(`${posted}T12:00:00Z`)) / 864e5,
  );
  if (d <= 0) return 'TODAY';
  if (d === 1) return 'YESTERDAY';
  return `${d} DAYS AGO`;
}

/** Notes are what the standard record noticed about a post. Price and
    scope problems are the ones a creator most needs before replying. */
function tone(note: string): string {
  if (/below|vague/i.test(note)) return 'jb-note jb-note-flag';
  if (/rush|share|not a deliverable/i.test(note)) return 'jb-note jb-note-warn';
  return 'jb-note';
}

/** Layout C: pay is the headline, since it is what a creator opens a
    job board for. The cashed-out dollar figure leads; what the hirer
    actually wrote sits under it, so nothing is hidden by the conversion.
    Only notes that change a decision (price, rush, scope) make the tile. */
function JobTile({ job, live }: { job: DemoJob; live?: Live }) {
  const flags = job.notes.filter((n) => tone(n) !== 'jb-note');
  return (
    <article className="jb-tile">
      <span className="jb-glow" aria-hidden="true" />
      {live && live.images.length > 0 && (
        <div className="jb-shot">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={live.images[0]} alt={`Reference for ${job.title}`} loading="lazy" referrerPolicy="no-referrer" />
          {live.images.length > 1 && <span className="jb-shot-count">+{live.images.length - 1}</span>}
        </div>
      )}
      <div className="jb-tile-head">
        <span className="jb-role">{job.role}</span>
        <span className={`jb-status${job.status === 'Open' ? ' jb-live' : ''}`}>
          <span className="jb-dot" aria-hidden="true" />
          {job.status === 'Open' ? 'OPEN' : 'TALKING'}
        </span>
      </div>
      <div className="jb-big">
        {usd(mid(job))}
        <small>{job.pay.toUpperCase()}</small>
      </div>
      <h2 className="jb-title">{job.title}</h2>
      {flags.length > 0 && (
        <div className="jb-notes">
          {flags.map((n) => <span key={n} className={tone(n)}>{n}</span>)}
        </div>
      )}
      {live && <Hirer h={live.hirer} />}
      <p className="jb-meta">
        <span>{age(job.posted)}</span>
        {job.due && <span>DUE {job.due.toUpperCase()}</span>}
        {job.portfolio && <span className="jb-strong">PORTFOLIO</span>}
      </p>
      <button type="button" className="jb-btn" disabled title="Demo">I&apos;M INTERESTED</button>
    </article>
  );
}

export default function JobsBoard() {
  const [role, setRole] = useState('All');
  const [sort, setSort] = useState<'new' | 'pay'>('pay');
  const live = useLive();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    DEMO_JOBS.forEach((j) => { c[j.role] = (c[j.role] ?? 0) + 1; });
    return c;
  }, []);
  const roles = ['All', ...Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))];

  const stats = useMemo(() => {
    const m = DEMO_JOBS.map(mid).sort((a, b) => a - b);
    return {
      median: m[Math.floor(m.length / 2)],
      robux: DEMO_JOBS.filter((j) => j.unit === 'R$').length,
      servers: new Set(DEMO_JOBS.map((j) => j.server)).size,
    };
  }, []);

  const jobs = DEMO_JOBS
    .filter((j) => role === 'All' || j.role === role)
    .sort(sort === 'pay'
      ? (a, b) => mid(b) - mid(a)
      : (a, b) => b.posted.localeCompare(a.posted) || b.id - a.id);

  return (
    <div className="showcase">
      <ShowcaseStyles />
      <JobsStyles />

      <header className="jb-head">
        <a className="pf-back" href="/spotlight">← THE SHOWCASE</a>
        <span className="jb-demo">DEMO · NOT LIVE</span>
        <h1 className="jb-h1">THE JOBS</h1>
        <p className="jb-sub">
          Hiring posts from the servers Spotlight broadcasts into, read as
          they were written and checked before they show here. Hirers post
          where they always have.
        </p>
      </header>

      <div className="jb-rail">
        <div className="jb-stat"><b>{DEMO_JOBS.length}</b><span>OPEN JOBS</span></div>
        <div className="jb-stat"><b>{usd(stats.median)}</b><span>MEDIAN OFFER</span></div>
        <div className="jb-stat"><b>{stats.robux}/{DEMO_JOBS.length}</b><span>PAID IN ROBUX</span></div>
        <div className="jb-stat"><b>{stats.servers}</b><span>SERVERS</span></div>
      </div>

      <div className="jb-bar">
        <div className="jb-filters" role="group" aria-label="Filter by role">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              className="jb-chip"
              aria-pressed={r === role}
              onClick={() => setRole(r)}
            >
              {r.toUpperCase()} <small>{r === 'All' ? DEMO_JOBS.length : counts[r]}</small>
            </button>
          ))}
        </div>
        <label className="jb-sort" htmlFor="jb-sort">
          SORT
          <select id="jb-sort" value={sort} onChange={(e) => setSort(e.target.value as 'new' | 'pay')}>
            <option value="pay">Highest pay</option>
            <option value="new">Newest</option>
          </select>
        </label>
      </div>

      <section className="jb-grid" aria-label="Jobs">
        {jobs.map((j) => <JobTile key={j.id} job={j} live={live[j.id]} />)}
      </section>

      <footer className="jb-foot">
        <p>
          Robux are shown in dollars at the DevEx rate ($0.0038 per Robux),
          what a creator actually gets when they cash out.
        </p>
        <p>
          Demo built from {DEMO_JOBS.length} real posts read between Oct 30 and
          Nov 8. Poster names and handles are left out. Listings would close
          after 14 days or when the hirer marks the job filled.
        </p>
      </footer>
    </div>
  );
}
