/**
 * Spotlight-reveal intro: the page loads under darkness, a soft radial
 * gradient — transparent center feathering to black — flickers on over
 * the wordmark, revealing the real page through it, then irises open.
 *
 * The veil is one oversized div with a static radial-gradient background,
 * animated only with transform: scale — fully compositor-driven (no
 * per-frame gradient or shadow repaints), so the iris opens smoothly.
 *
 * Server component — pure CSS on a pointer-events-none overlay, so content
 * underneath renders and stays interactive from first paint. The inline
 * script runs during HTML parse and hides the overlay for repeat visitors
 * before anything is painted (no flash). Reduced-motion users never see it.
 */
export default function SpotlightIntro() {
	return (
		<>
			<div id="si-stage" aria-hidden="true">
				<div className="si-veil" />
				<div className="si-blackout" />
			</div>
			<script
				dangerouslySetInnerHTML={{
					__html:
						"try{if(sessionStorage.getItem('si-seen-4')){document.getElementById('si-stage').style.display='none'}else{sessionStorage.setItem('si-seen-4','1')}}catch(e){}",
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
