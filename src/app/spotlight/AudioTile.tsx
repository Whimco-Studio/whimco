/** The network's tile for a sound.

    A track has no frame of its own, and the alternative (a browser's
    broken-image icon, which is what an .mp3 in an <img> produces) is
    what got 22 of the first 30 audio creations denied as broken media.
    So the tile is drawn, not loaded: a row of beam-coloured bars on the
    stage colour, in the site's own two tokens, with the bar heights
    seeded from the file path so two tracks on one page do not wear the
    same wave and one track wears the same wave on every visit. The
    Spotlight feed page draws the same tile from the same hash, so a
    creation looks like itself on both hosts. */

const BARS = 28;

/** FNV-1a over the seed, then an xorshift-style step per bar. Kept
    identical to the feed page's copy. */
export function wave(seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  const out: number[] = [];
  for (let i = 0; i < BARS; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    out.push((h % 1000) / 1000);
  }
  return out;
}

export default function AudioTile({ seed, className = '' }: { seed: string; className?: string }) {
  const amps = wave(seed);
  const W = 320;
  const H = 180;
  const step = (W - 28) / BARS;
  return (
    <svg
      className={`audio-tile ${className}`.trim()}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Audio"
    >
      <rect width={W} height={H} fill="var(--stage, #0a0a0f)" />
      <g fill="var(--beam, #ffd98a)" opacity="0.9">
        {amps.map((a, i) => {
          const h = 10 + a * 70;
          return (
            <rect
              key={i}
              x={(14 + i * step).toFixed(1)}
              y={(H / 2 - h / 2).toFixed(1)}
              width="4"
              height={h.toFixed(1)}
              rx="2"
            />
          );
        })}
      </g>
    </svg>
  );
}
