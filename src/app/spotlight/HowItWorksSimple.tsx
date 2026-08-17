'use client';

import useInviteUrl from './useInviteUrl';

/** One eight-second loop replacing a ten-scene, sixty-four-second
 *  slideshow.
 *
 *  The old section explained the system: broadcast detection, moderation,
 *  the flag pipeline, the architecture. None of that is what someone
 *  deciding whether to add a bot needs, and none of it survives a reader
 *  who leaves after eight seconds.
 *
 *  The loop is pure CSS keyframes on one shared timeline rather than a
 *  JS-driven sequence. It cannot desync, it costs no library, and it
 *  keeps running correctly if React never rehydrates.
 *
 *  Styles are `global` and namespaced under `.hiw`. Scoped `<style jsx>`
 *  only reaches elements in the component's own JSX, so any selector
 *  targeting markup from a child component silently matches nothing. */

type Stats = {
  server_count: number;
  member_reach: number;
} | null;

const DESTINATIONS = ['#showcase', '#creations', '#art-share'];

export default function HowItWorksSimple({
  stats, sample,
}: {
  stats?: Stats;
  /** A real creation from the network, so the loop demonstrates the
   *  product rather than diagramming it. Optional: if the API is down
   *  the panels still render with a gradient stand-in. */
  sample?: { image: string; author: string } | null;
}) {
  const inviteUrl = useInviteUrl();
  const reach = stats?.member_reach
    ? stats.member_reach.toLocaleString('en-US')
    : null;

  return (
    <section className="hiw" id="how-it-works" aria-label="How Spotlight works">
      <div className="hiw-stage" aria-hidden>
        <div className="hiw-side">
          <p className="hiw-label">A creator posts once</p>
          <div className="hiw-server hiw-source">
            <span className="hiw-server-name">#creations</span>
            <div className="hiw-msg hiw-msg-origin">
              <span className="hiw-avatar" />
              <span className="hiw-lines">
                <span className="hiw-who">
                  {sample?.author ?? 'a creator'}
                </span>
                {sample?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    className="hiw-art"
                    src={sample.image}
                    alt=""
                    /* twimg 403s any request carrying a foreign Referer,
                       matching what Gallery does for the same media. */
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="hiw-art hiw-art-blank" />
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="hiw-beam">
          <span className="hiw-beam-line" />
          <span className="hiw-pulse" />
        </div>

        <div className="hiw-side hiw-side-right">
          <p className="hiw-label">Spotlight carries it everywhere</p>
          <div className="hiw-targets">
            {DESTINATIONS.map((name, i) => (
              <div
                key={name}
                className="hiw-server hiw-target"
                style={{ ['--i' as string]: i }}
              >
                <span className="hiw-server-name">{name}</span>
                <div className="hiw-msg">
                  <span className="hiw-avatar" />
                  <span className="hiw-lines">
                    <span className="hiw-who">
                      {sample?.author ?? 'a creator'}
                    </span>
                    {sample?.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        className="hiw-art"
                        src={sample.image}
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="hiw-art hiw-art-blank" />
                    )}
                  </span>
                </div>
                <span className="hiw-heart">♥</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deliberately no server count, and please do not add one back.
          Servers that hold the bot and servers that hold a showcase
          channel are different populations, so any count here is larger
          than what a creator can see landing in their own feed, and the
          gap reads as a broken promise. Member reach does not have that
          problem and is the figure to quote. */}
      <p className="hiw-caption">
        {reach ? (
          <>
            One post, every showcase channel on the network, in front of{' '}
            <b>{reach} members</b>. The creator keeps their name on it, and
            every creation links back to their portfolio.
          </>
        ) : (
          <>
            One post, every showcase channel on the network. The creator keeps
            their name on it, and every creation links back to their portfolio.
          </>
        )}
      </p>

      <div className="hiw-setup">
        <p className="hiw-setup-kicker">Two commands, once</p>
        <div className="hiw-cmds">
          <div className="hiw-cmd">
            <code>/spotlight_send</code>
            <span>the channel your members post creations in</span>
          </div>
          <div className="hiw-cmd">
            <code>/spotlight_receive</code>
            <span>where the network&apos;s work should show up</span>
          </div>
        </div>
        <a
          className="hiw-cta"
          href={inviteUrl}
          target="_blank"
          // nofollow so a crawler walking this page does not press the
          // button. The counter behind it drops obvious agents anyway,
          // and two defences cost nothing here.
          rel="noopener noreferrer nofollow"
        >
          Add Spotlight to Discord
        </a>
        <p className="hiw-note">Free. Takes about a minute.</p>
      </div>

      <style jsx global>{`
        .hiw {
          --hiw-panel: #14141d;
          --hiw-edge: rgba(255, 255, 255, 0.08);
          --hiw-beam: #ffd98a;
          --hiw-blurple: #5865f2;
          --hiw-text: #f4f5fa;
          --hiw-dim: #9ba0b4;
          background: #0a0a0f;
          padding: 2rem 1.5rem 6rem;
          max-width: 1080px;
          margin: 0 auto;
          font-family: var(--font-display), system-ui, sans-serif;
        }

        /* ---- the loop ---- */
        .hiw-stage {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 1.5rem;
          padding: 2.5rem 2rem;
          border: 1px solid var(--hiw-edge);
          border-radius: 18px;
          background:
            radial-gradient(ellipse at 30% 0%, rgba(255, 217, 138, 0.05), transparent 60%),
            var(--hiw-panel);
        }
        .hiw-side { display: flex; flex-direction: column; gap: 0.85rem; max-width: 260px; }
        .hiw-side-right { margin-left: auto; }
        .hiw-label {
          font-family: var(--font-mono), monospace;
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--hiw-dim);
          margin: 0;
        }

        .hiw-server {
          border: 1px solid var(--hiw-edge);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.025);
          padding: 0.7rem 0.75rem 0.75rem;
          position: relative;
        }
        .hiw-server-name {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 0.6rem;
          color: var(--hiw-dim);
          margin-bottom: 0.5rem;
        }

        .hiw-msg { display: flex; gap: 0.5rem; }
        .hiw-avatar {
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--hiw-blurple); flex-shrink: 0;
        }
        .hiw-lines { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
        .hiw-who {
          font-family: var(--font-mono), monospace;
          font-size: 0.62rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1;
        }
        .hiw-art {
          display: block;
          width: 100%;
          max-width: 190px;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          border-radius: 6px;
          background: #0d0d14;
        }
        .hiw-art-blank {
          background: linear-gradient(135deg, rgba(88, 101, 242, 0.55), rgba(255, 217, 138, 0.3));
        }

        /* Origin message types itself in at the top of every cycle. */
        .hiw-msg-origin { animation: hiwOrigin 8s ease-in-out infinite; }
        @keyframes hiwOrigin {
          0%, 4%   { opacity: 0; transform: translateY(5px); }
          10%, 88% { opacity: 1; transform: none; }
          96%, 100% { opacity: 0; transform: translateY(5px); }
        }
        .hiw-source { animation: hiwSourceGlow 8s ease-in-out infinite; }
        @keyframes hiwSourceGlow {
          0%, 8%, 40%, 100% { border-color: var(--hiw-edge); }
          16%, 30% { border-color: rgba(255, 217, 138, 0.4); }
        }

        .hiw-beam {
          position: relative;
          width: 92px; height: 2px;
          background: linear-gradient(90deg, rgba(255, 217, 138, 0.1), rgba(255, 217, 138, 0.03));
          border-radius: 2px;
        }
        .hiw-beam-line {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, var(--hiw-beam), rgba(255, 217, 138, 0.25));
          border-radius: 2px;
          transform-origin: left center;
          animation: hiwBeam 8s ease-in-out infinite;
        }
        @keyframes hiwBeam {
          0%, 12%  { transform: scaleX(0); opacity: 0; }
          22%, 84% { transform: scaleX(1); opacity: 1; }
          94%, 100% { transform: scaleX(1); opacity: 0; }
        }
        .hiw-pulse {
          position: absolute; top: -2px; left: 0;
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--hiw-beam);
          box-shadow: 0 0 10px 2px rgba(255, 217, 138, 0.6);
          animation: hiwPulse 8s ease-in-out infinite;
        }
        @keyframes hiwPulse {
          0%, 12%  { opacity: 0; transform: translateX(0); }
          16%      { opacity: 1; }
          30%      { opacity: 1; transform: translateX(86px); }
          34%, 100% { opacity: 0; transform: translateX(86px); }
        }

        .hiw-targets { display: flex; flex-direction: column; gap: 0.5rem; }
        /* Each destination lands a beat after the pulse arrives, staggered
           so it reads as a fan-out rather than three things blinking. */
        .hiw-target {
          opacity: 0;
          animation: hiwLand 8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.18s);
        }
        @keyframes hiwLand {
          0%, 28%  { opacity: 0; transform: translateX(-6px) scale(0.985); }
          36%, 86% { opacity: 1; transform: none; }
          94%, 100% { opacity: 0; transform: translateX(-6px) scale(0.985); }
        }
        .hiw-heart {
          position: absolute; right: 0.6rem; bottom: 0.55rem;
          font-size: 0.72rem; color: #ed4245;
          opacity: 0;
          animation: hiwHeart 8s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.18s);
        }
        @keyframes hiwHeart {
          0%, 48%  { opacity: 0; transform: scale(0.6); }
          56%, 86% { opacity: 1; transform: scale(1); }
          94%, 100% { opacity: 0; transform: scale(0.6); }
        }

        .hiw-caption {
          text-align: center;
          max-width: 640px;
          margin: 1.9rem auto 0;
          font-size: 0.93rem;
          line-height: 1.68;
          color: var(--hiw-dim);
        }
        .hiw-caption b { color: var(--hiw-text); font-weight: 700; }

        /* ---- setup ---- */
        .hiw-setup { margin-top: 3rem; text-align: center; }
        .hiw-setup-kicker {
          font-family: var(--font-mono), monospace;
          font-size: 0.64rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--hiw-dim);
          margin: 0 0 1.1rem;
        }
        .hiw-cmds {
          display: flex; justify-content: center; gap: 0.85rem;
          flex-wrap: wrap; margin-bottom: 1.9rem;
        }
        .hiw-cmd {
          display: flex; flex-direction: column; gap: 0.4rem;
          align-items: flex-start; text-align: left;
          background: var(--hiw-panel);
          border: 1px solid var(--hiw-edge);
          border-radius: 12px;
          padding: 0.95rem 1.15rem;
          min-width: 268px;
        }
        .hiw-cmd code {
          font-family: var(--font-mono), monospace;
          font-size: 0.87rem;
          color: var(--hiw-beam);
        }
        .hiw-cmd span {
          font-size: 0.79rem; color: var(--hiw-dim); line-height: 1.5;
        }
        .hiw-cta {
          display: inline-block;
          background: var(--hiw-blurple);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          padding: 0.85rem 1.8rem; border-radius: 11px;
          text-decoration: none;
          transition: filter 0.15s ease, transform 0.15s ease;
        }
        .hiw-cta:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .hiw-note {
          font-size: 0.76rem; color: var(--hiw-dim); margin: 0.85rem 0 0;
        }

        /* Declared at top level, not nested inside the media query below.
           A @keyframes inside @media parses in browsers but trips some
           CSS pipelines, and a dropped rule there would take every
           declaration after it with it. */
        @keyframes hiwBeamVertical {
          0%, 12%  { transform: scaleY(0); opacity: 0; }
          22%, 84% { transform: scaleY(1); opacity: 1; }
          94%, 100% { transform: scaleY(1); opacity: 0; }
        }

        @media (max-width: 820px) {
          .hiw-stage { grid-template-columns: 1fr; gap: 1.1rem; padding: 1.75rem 1.25rem; }
          .hiw-beam { width: 2px; height: 40px; justify-self: center; }
          .hiw-beam-line {
            transform-origin: center top;
            animation-name: hiwBeamVertical;
          }
          .hiw-pulse { animation: none; opacity: 0; }
        }

        /* A reader who asked for less motion gets the finished frame,
           not an empty stage waiting on an animation that never runs. */
        @media (prefers-reduced-motion: reduce) {
          .hiw-msg-origin, .hiw-source, .hiw-beam-line,
          .hiw-target, .hiw-heart {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .hiw-pulse { display: none; }
        }
      `}</style>
    </section>
  );
}
