/** Vertices of a wave outline: enough for a smooth edge at full-screen radius. */
const OUTLINE_POINTS = 72;
/** Wobble of the edge as a share of the radius, at the middle of the sweep. */
const MAX_AMPLITUDE = 0.17;
/** Wobble phase turned per unit of progress: how fast the ripples travel along the edge. */
const PHASE_SPEED = 7;
/** How far the wave must overshoot the farthest viewport corner to leave no gap, as a ratio. */
const OVERSHOOT = 1.1;
/** How far past the bottom-right corner the wave is born, in orb radii: the orb leaves the screen first. */
const CORNER_OUTSET = 1.5;

/** Circle a wave grows from, in px of the overlay. */
export interface WaveOrigin {
  x: number;
  y: number;
  startRadius: number;
  endRadius: number;
}

/**
 * The wave is born where the orb has gone: off screen past the bottom-right
 * corner, at the orb's size (so nothing shows yet), and ends wide enough to
 * swallow the whole viewport.
 */
export function createWaveOrigin(width: number, height: number, orbRadius: number): WaveOrigin {
  const x = width + orbRadius * CORNER_OUTSET;
  const y = height + orbRadius * CORNER_OUTSET;
  // Past the corner, the top-left one is the farthest.
  const farthestCorner = Math.hypot(x, y);
  return { x, y, startRadius: orbRadius, endRadius: farthestCorner * OVERSHOOT };
}

/** Wobble is nil at both ends, so the wave starts as the orb's circle and ends as a plain cover. */
function amplitudeAt(progress: number): number {
  return MAX_AMPLITUDE * Math.sin(Math.PI * progress) ** 0.7;
}

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

/** Closed SVG subpath of the wave edge at `progress` (0..1). `seed` makes two waves ripple differently. */
export function wavePath(origin: WaveOrigin, progress: number, seed: number): string {
  const p = clampProgress(progress);
  const radius = origin.startRadius + (origin.endRadius - origin.startRadius) * p;
  const amplitude = amplitudeAt(p);
  const phase = seed + p * PHASE_SPEED;
  let path = "";
  for (let index = 0; index < OUTLINE_POINTS; index += 1) {
    const angle = (index / OUTLINE_POINTS) * Math.PI * 2;
    const wobble =
      0.55 * Math.sin(3 * angle + phase) +
      0.3 * Math.sin(5 * angle - 1.4 * phase) +
      0.15 * Math.sin(8 * angle + 0.7 * phase);
    const edge = radius * (1 + amplitude * wobble);
    const x = origin.x + Math.cos(angle) * edge;
    const y = origin.y + Math.sin(angle) * edge;
    path += `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${path}Z`;
}

/** `clip-path` showing what the wave has covered so far. */
export function coverClip(origin: WaveOrigin, progress: number, seed: number): string {
  return `path("${wavePath(origin, progress, seed)}")`;
}

/** `clip-path` showing everything except what the wave has swept: a hole in the full rectangle. */
export function revealClip(
  origin: WaveOrigin,
  width: number,
  height: number,
  progress: number,
  seed: number,
): string {
  const rectangle = `M0 0H${width}V${height}H0Z`;
  return `path(evenodd, "${rectangle}${wavePath(origin, progress, seed)}")`;
}
