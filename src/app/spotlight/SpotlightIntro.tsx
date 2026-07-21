'use client';

/**
 * Spotlight-reveal intro: the page loads under darkness, a soft radial
 * gradient — transparent center feathering to black — flickers on over
 * the wordmark, revealing the real page through it, then irises open.
 * A stage-light switch SFX fires with the flicker.
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
			if (sessionStorage.getItem(SEEN_KEY)) {
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
			}, 100);
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
					__html: `try{if(sessionStorage.getItem('${SEEN_KEY}')){var e=document.getElementById('si-stage');if(e)e.style.display='none'}}catch(e){}`,
				}}
			/>
			<style>{`
        #si-stage {
          position: fixed;
          inset: 0;
          z-index: 300;
          pointer-events: none;
          overflow: hidden;
          animation: si-gone 0.01s linear 1.5s forwards;
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
          animation: si-open 0.55s ease-in 0.9s forwards;
        }
        /* Full blackout on top that flickers off — the lamp catching.
           Each off-step momentarily reveals the spotlit circle below. */
        #si-stage .si-blackout {
          position: absolute;
          inset: 0;
          background: #050508;
          animation: si-flicker 0.5s steps(1, end) 0.1s forwards;
        }
        @keyframes si-flicker {
          0% { opacity: 1; }
          14% { opacity: 0.25; }
          26% { opacity: 0.9; }
          42% { opacity: 0.1; }
          58% { opacity: 0.7; }
          74% { opacity: 0; }
          100% { opacity: 0; }
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
