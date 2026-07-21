/**
 * Spotlight-reveal intro: the page loads under darkness, a soft-edged
 * circle of light snaps on over the wordmark with a flicker — revealing
 * the real page through it — holds a beat, then irises open to full.
 *
 * The "hole" is a transparent circle whose enormous soft box-shadow is the
 * darkness, so the reveal is genuine page content, not a glow overlay.
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
				<div className="si-hole" />
				<div className="si-blackout" />
			</div>
			<script
				dangerouslySetInnerHTML={{
					__html:
						"try{if(sessionStorage.getItem('si-seen-3')){document.getElementById('si-stage').style.display='none'}else{sessionStorage.setItem('si-seen-3','1')}}catch(e){}",
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
        /* Transparent circle over the wordmark; its huge blurred shadow is
           the darkness, so the page shows through the soft-edged hole. */
        #si-stage .si-hole {
          position: absolute;
          left: 50%;
          top: 27vh;
          width: min(64vw, 380px);
          aspect-ratio: 1;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(1);
          box-shadow: 0 0 90px 200vmax #050508;
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
        /* Iris opens: the hole grows until the darkness is pushed off
           screen; the shadow blur scales with it, keeping the edge soft. */
        @keyframes si-open {
          to { transform: translate(-50%, -50%) scale(14); }
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
