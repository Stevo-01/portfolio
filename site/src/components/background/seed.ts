import type { IconName } from '../../types/icons';

/**
 * Deterministic seeding for the drift layer. Owned by slice 02.
 *
 * ── WHY THIS IS DETERMINISTIC ────────────────────────────────────────────
 * The seeds are computed in the component's frontmatter, at build time, and
 * baked into the HTML as inline transforms. `Math.random()` would produce one
 * set of positions in the built markup and a different set the moment the
 * script ran, so every icon would jump on load.
 *
 * Baking them also means the reduced-motion path needs no JavaScript at all:
 * the icons are already sitting at their seed positions in the served HTML.
 */

/** mulberry32. Small, fast, and good enough for scattering decorative sprites. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The default drift set: the stack this site is actually about.
 *
 * The brief's default list belongs to a backend and cloud portfolio (Go,
 * Terraform, Kafka, Prometheus). Reusing it would decorate an ML engineer's
 * hero with someone else's tools, which is worse than having no icons.
 */
export const DEFAULT_DRIFT_ICONS: IconName[] = [
  'python',
  'tensorflow',
  'huggingface',
  'fastapi',
  'docker',
  'kubernetes',
  'postgres',
  'mongodb',
  'gcp',
  'mlflow',
];

export interface DriftSeed {
  name: IconName;
  /** Percentage of the host box, so the seed survives any viewport width. */
  x: number;
  y: number;
  /** px per second. */
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  /** deg per second, signed. */
  spin: number;
  /** 0 = far (slow, blurred), 1 = near. Drives the parallax. */
  depth: number;
}

/**
 * The centre of the hero belongs to the H1. An icon tracking across it reads as
 * a rendering bug rather than as atmosphere.
 *
 * This is used twice, and both uses are needed. `seedIcons` rejects starting
 * positions inside it, and the drift loop treats it as a solid obstacle. Seed
 * filtering alone is not enough: sprites drift, so without the collider they
 * simply wander into the headline a few seconds after load, which is worse than
 * starting there because it looks intermittent.
 *
 * Percentages of the host box, so it tracks the hero at any width.
 *
 * The values are measured rather than guessed. Hero copy sits inside
 * `--container`, which is narrower than the full-bleed hero, but the headline
 * still spans roughly 12% to 88% of the host at 1440px with the kicker and lead
 * occupying 31% to 69% vertically. An earlier 26–74% horizontal box looked
 * generous and was not: the headline ran past both edges, so a sprite parked
 * against the boundary sat on top of the last word.
 *
 * The shape is therefore a wide band, not a centred block. Sprites live in the
 * strips above and below the copy, which works at every width, where side
 * gutters would vanish the moment the container stops being narrower than the
 * viewport.
 *
 * The vertical bounds were widened from 26–74 when the hero became centred:
 * centring stacks the pill, greeting, headline, lead, location and CTA row
 * around the middle, which grew the occupied band to 23–77 and left an icon
 * crossing the buttons. 20–80 restores the margin.
 */
export const EXCLUSION = { x0: 8, x1: 92, y0: 20, y1: 80 };

function outsideExclusion(x: number, y: number): boolean {
  return x < EXCLUSION.x0 || x > EXCLUSION.x1 || y < EXCLUSION.y0 || y > EXCLUSION.y1;
}

export function seedIcons(icons: IconName[], seed = 20260902): DriftSeed[] {
  const rand = rng(seed);
  const range = (lo: number, hi: number) => lo + rand() * (hi - lo);

  return icons.map((name) => {
    let x = range(4, 96);
    let y = range(6, 92);

    // Re-roll toward an edge rather than looping forever: a bounded number of
    // attempts keeps build time constant even if the exclusion box grows.
    for (let i = 0; i < 12 && !outsideExclusion(x, y); i++) {
      x = range(4, 96);
      y = range(6, 92);
    }

    const depth = range(0, 1);
    const angle = range(0, Math.PI * 2);
    // Far icons move slower. Same vector, scaled by depth, which is what makes
    // the field read as layered instead of as one flat swarm.
    const speed = range(8, 22) * (0.45 + depth * 0.55);

    return {
      name,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.round(range(26, 46)),
      opacity: Number(range(0.1, 0.22).toFixed(3)),
      rotation: Math.round(range(0, 360)),
      spin: Number(range(-6, 6).toFixed(2)),
      depth: Number(depth.toFixed(3)),
    };
  });
}
