/**
 * Lamp warm-up intro for the showcase landing: the stage starts dark, the
 * spotlight strikes with a theatrical flicker over the wordmark, then the
 * light spreads and the darkness lifts.
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
				<div className="si-beam" />
			</div>
			<script
				dangerouslySetInnerHTML={{
					__html:
						"try{if(sessionStorage.getItem('si-seen')){document.getElementById('si-stage').style.display='none'}else{sessionStorage.setItem('si-seen','1')}}catch(e){}",
				}}
			/>
			<style>{`
        #si-stage {
          position: fixed;
          inset: 0;
          z-index: 300;
          pointer-events: none;
          background: #050508;
          opacity: 1;
          animation: si-lift 0.45s ease-in 0.55s forwards;
        }
        #si-stage .si-beam {
          position: absolute;
          left: 50%;
          top: 26vh;
          width: min(72vw, 640px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%) scale(0.55);
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 217, 138, 0.32) 0%,
            rgba(255, 217, 138, 0.1) 38%,
            transparent 68%
          );
          opacity: 0;
          animation: si-strike 0.55s steps(1, end) 0.12s forwards,
            si-spread 0.5s ease-out 0.55s forwards;
        }
        /* Lamp striking: hard flicker steps, like a bulb catching. */
        @keyframes si-strike {
          0% { opacity: 0; }
          14% { opacity: 0.7; }
          26% { opacity: 0.15; }
          42% { opacity: 0.85; }
          58% { opacity: 0.35; }
          74% { opacity: 1; }
          100% { opacity: 1; }
        }
        /* Light settles and blooms outward as the darkness lifts. */
        @keyframes si-spread {
          from { transform: translate(-50%, -50%) scale(0.55); }
          to { transform: translate(-50%, -50%) scale(1.6); }
        }
        @keyframes si-lift {
          to { opacity: 0; visibility: hidden; }
        }
        @media (prefers-reduced-motion: reduce) {
          #si-stage { display: none; }
        }
      `}</style>
		</>
	);
}
