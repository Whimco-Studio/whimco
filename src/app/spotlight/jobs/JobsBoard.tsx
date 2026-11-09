'use client';

import { useMemo, useState } from 'react';
import ShowcaseStyles from '../styles';
import JobsStyles from './jobsStyles';
import { DEMO_AS_OF, DEMO_JOBS, DemoJob } from './demoJobs';

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

function JobCard({ job }: { job: DemoJob }) {
  const converted =
    job.unit === 'USD'
      ? null
      : `≈ ${usd(job.usdLo)}${job.usdHi !== job.usdLo ? `–${usd(job.usdHi)}` : ''} CASHED OUT`;
  return (
    <article className="jb-card">
      <div className="jb-top">
        <div className="jb-what">
          <span className="jb-role">{job.role}</span>
          <h2 className="jb-title">{job.title}</h2>
        </div>
        <div className="jb-pay">
          <b>{job.pay}</b>
          {converted && <span>{converted}</span>}
        </div>
      </div>

      <p className="jb-meta">
        <span>{age(job.posted)} · {job.server.toUpperCase()}</span>
        {job.due && <span>DUE {job.due.toUpperCase()}</span>}
        <span>{job.basis.toUpperCase()}</span>
        {job.portfolio && <span className="jb-strong">PORTFOLIO REQUIRED</span>}
      </p>

      {job.notes.length > 0 && (
        <div className="jb-notes">
          {job.notes.map((n) => <span key={n} className={tone(n)}>{n}</span>)}
        </div>
      )}

      <div className="jb-actions">
        <span className={`jb-status${job.status === 'Open' ? ' jb-live' : ''}`}>
          <span className="jb-dot" aria-hidden="true" />
          {job.status.toUpperCase()}
        </span>
        <div className="jb-buttons">
          <button type="button" className="jb-btn jb-btn-ghost" disabled title="Demo">MATCHING WORK</button>
          <button type="button" className="jb-btn" disabled title="Demo">I&apos;M INTERESTED</button>
        </div>
      </div>
    </article>
  );
}

export default function JobsBoard() {
  const [role, setRole] = useState('All');
  const [sort, setSort] = useState<'new' | 'pay'>('new');

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
            <option value="new">Newest</option>
            <option value="pay">Highest pay</option>
          </select>
        </label>
      </div>

      <section className="jb-list" aria-label="Jobs">
        {jobs.map((j) => <JobCard key={j.id} job={j} />)}
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
