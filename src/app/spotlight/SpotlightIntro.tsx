/**
 * Stage-light intro for the showcase landing: a visible cone of light from
 * above strikes on with a flicker, swings into place over the wordmark,
 * pools where it lands, then the house lights come up.
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
				<div className="si-rig">
					<div className="si-cone" />
					<div className="si-pool" />
				</div>
			</div>
			<script
				dangerouslySetInnerHTML={{
					__html:
						"try{if(sessionStorage.getItem('si-seen-2')){document.getElementById('si-stage').style.display='none'}else{sessionStorage.setItem('si-seen-2','1')}}catch(e){}",
				}}
			/>
			<style>{`
        #si-stage {
          position: fixed;
          inset: 0;
          z-index: 300;
          pointer-events: none;
          overflow: hidden;
          background: #050508;
          animation: si-lift 0.5s ease-in 0.9s forwards;
        }
        /* The rig pivots at the lamp head above the viewport, so the whole
           beam swings like a light being aimed onto the stage. */
        #si-stage .si-rig {
          position: absolute;
          left: 50%;
          top: -10vh;
          width: 0;
          height: 0;
          transform: rotate(-16deg);
          animation: si-aim 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) 0.4s forwards;
        }
        /* Visible cone: apex at the lamp, widening down to the wordmark. */
        #si-stage .si-cone {
          position: absolute;
          left: 0;
          top: 0;
          width: min(58vw, 560px);
          height: 52vh;
          transform: translateX(-50%);
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
          background: linear-gradient(
            to bottom,
            rgba(255, 236, 190, 0.5) 0%,
            rgba(255, 217, 138, 0.22) 55%,
            rgba(255, 217, 138, 0.05) 100%
          );
          filter: blur(8px);
          opacity: 0;
          animation: si-strike 0.5s steps(1, end) 0.12s forwards;
        }
        /* Pool of light where the beam lands on the stage floor. */
        #si-stage .si-pool {
          position: absolute;
          left: 0;
          top: 50vh;
          width: min(64vw, 620px);
          aspect-ratio: 2.6;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(
            ellipse,
            rgba(255, 217, 138, 0.3) 0%,
            rgba(255, 217, 138, 0.08) 50%,
            transparent 75%
          );
          filter: blur(6px);
          opacity: 0;
          animation: si-strike 0.5s steps(1, end) 0.12s forwards;
        }
        /* Lamp striking: hard flicker, like the bulb catching. */
        @keyframes si-strike {
          0% { opacity: 0; }
          14% { opacity: 0.7; }
          26% { opacity: 0.15; }
          42% { opacity: 0.85; }
          58% { opacity: 0.35; }
          74% { opacity: 1; }
          100% { opacity: 1; }
        }
        /* The operator swings the lit beam onto the wordmark. */
        @keyframes si-aim {
          to { transform: rotate(0deg); }
        }
        /* House lights up. */
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
