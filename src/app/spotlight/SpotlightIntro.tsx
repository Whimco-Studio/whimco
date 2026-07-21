'use client';

/**
 * Spotlight-reveal intro: the page loads under darkness, then a soft
 * radial spotlight — transparent center feathering to black — cuts on
 * hard over the wordmark, revealing the real page through it, holds a
 * beat, and irises open. A stage-light switch SFX lands on the cut.
 *
 * Client component: the effect owns the once-per-session check and the
 * audio because it runs on BOTH full loads and App Router client-side
 * navigations — an inline script only executes on the former, and the
 * nav-click case is precisely where browsers allow audio (a user gesture
 * already happened; fresh direct loads are autoplay-muted regardless).
 * The parse-time script below remains as the no-flash guard so repeat
 * visitors on a full load never see the dark overlay paint.
 *
 * The veil is one oversized div with a static radial-gradient background,
 * animated only with transform: scale — fully compositor-driven, so the
 * iris opens without repaint stutter. Reduced-motion users skip it all.
 */
import { useEffect, useState } from 'react';

const SEEN_KEY = 'si-seen-5';

export default function SpotlightIntro() {
	const [show, setShow] = useState(true);

	useEffect(() => {
		try {
			// ?intro forces a replay — demo/testing hook.
			const force = new URLSearchParams(location.search).has('intro');
			if (!force && sessionStorage.getItem(SEEN_KEY)) {
				setShow(false);
				return;
			}
			sessionStorage.setItem(SEEN_KEY, '1');
			if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
				setShow(false);
				return;
			}
			const audio = new Audio('/spotlight-strike.mp3');
			audio.volume = 0.55;
			const timer = setTimeout(() => {
				audio.play().then(
					() => console.debug('[spotlight-intro] sfx playing'),
					(err) =>
						console.debug(
							'[spotlight-intro] sfx blocked by autoplay policy:',
							err?.name,
						),
				);
			}, 150);
			return () => clearTimeout(timer);
		} catch {
			// Storage unavailable (some private modes): play it visually.
		}
	}, []);

	if (!show) return null;

	return (
		<>
			<div id="si-stage" aria-hidden="true">
				<div className="si-veil" />
				<div className="si-blackout" />
			</div>
			<script
				dangerouslySetInnerHTML={{
					__html: `try{if(location.search.indexOf('intro')<0&&sessionStorage.getItem('${SEEN_KEY}')){var e=document.getElementById('si-stage');if(e)e.style.display='none'}}catch(e){}`,
				}}
			/>
			<style>{`
        #si-stage {
          position: fixed;
          inset: 0;
          z-index: 300;
          pointer-events: none;
          overflow: hidden;
          animation: si-gone 0.01s linear 1.3s forwards;
        }
        /* The darkness: transparent core over the wordmark, feathered edge,
           solid black beyond. Oversized so its edges never enter the
           viewport while the scale-up runs. */
        #si-stage .si-veil {
          position: absolute;
          left: 50%;
          top: 27vh;
          width: 160vmax;
          height: 160vmax;
          transform: translate(-50%, -50%) scale(1);
          will-change: transform;
          background: radial-gradient(
            circle,
            transparent 0 150px,
            #050508 330px
          );
          animation: si-open 0.55s ease-in 0.7s forwards;
        }
        /* Full blackout on top that cuts off in one hard step — the
           spotlight snapping on. */
        #si-stage .si-blackout {
          position: absolute;
          inset: 0;
          background: #050508;
          animation: si-cut 0.01s steps(1, end) 0.25s forwards;
        }
        @keyframes si-cut {
          to { opacity: 0; }
        }
        /* Iris opens: pure transform scale, feathered edge grows with it. */
        @keyframes si-open {
          to { transform: translate(-50%, -50%) scale(10); }
        }
        @keyframes si-gone {
          to { opacity: 0; visibility: hidden; }
        }
        @media (prefers-reduced-motion: reduce) {
          #si-stage { display: none; }
        }
      `}</style>
		</>
	);
}
