import { gsap, ScrollTrigger } from "@/lib/gsap";
import { type BlobShape, ORB_SCALE, type OrbState, scrollProgress } from "@/webgl/scrollProgress";

/** Writes where the orb should be this frame (see `placeOrb`, `setShape`). */
export type OrbPose = (orb: OrbState) => void;

interface OrbClaim {
  trigger: ScrollTrigger;
  pose: OrbPose;
}

/**
 * Space kept between an orb held back on screen and the viewport edge, in px.
 * Small: an anchor still in view but close to the edge must keep the orb on it.
 */
const EDGE_GAP = 8;

const claims = new Set<OrbClaim>();

/** The claim whose start was passed last wins: the scroll position alone decides who holds the orb. */
function findCurrentClaim(): OrbClaim | null {
  let current: OrbClaim | null = null;
  for (const claim of claims) {
    const { start } = claim.trigger;
    if (start > claim.trigger.scroll()) continue;
    if (!current || start >= current.trigger.start) current = claim;
  }
  return current;
}

const drive = () => {
  const { orb } = scrollProgress;
  const claim = findCurrentClaim();
  orb.isVisible = claim !== null;
  orb.isLocked = false;
  orb.panel = 0;
  orb.hole.radius = 0;
  // The dot cloud stays inside the orb unless the pose spreads it.
  scrollProgress.particles.gather = 1;
  claim?.pose(orb);
};

/**
 * Hands the orb to `pose` once the scroll passes `start` of `trigger`, until a
 * later claim takes over. The pose runs every frame on gsap.ticker, before the
 * scene reads the orb. Returns the release function, for the motion cleanup.
 */
export function claimOrb(
  vars: { trigger: Element; start: ScrollTrigger.Vars["start"] },
  pose: OrbPose,
): () => void {
  const claim = { trigger: ScrollTrigger.create(vars), pose };
  claims.add(claim);
  if (claims.size === 1) gsap.ticker.add(drive);
  return () => {
    claim.trigger.kill();
    claims.delete(claim);
    if (claims.size > 0) return;
    gsap.ticker.remove(drive);
    scrollProgress.orb.isVisible = false;
  };
}

/** Radius of the orb at rest, in CSS px. */
export function restingOrbRadius(): number {
  return ORB_SCALE * Math.min(window.innerWidth, window.innerHeight);
}

/** Sets one shape of the orb, in viewport CSS px. */
export function setShape(
  shape: BlobShape,
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
  corner: number,
): void {
  shape.x = x;
  shape.y = y;
  shape.halfWidth = halfWidth;
  shape.halfHeight = halfHeight;
  shape.corner = corner;
}

/**
 * Radius of each of `count` stacked circles that together look like one
 * circle of `radius`: the fields add up as squared radii, so pulling the
 * stack apart splits the orb while keeping its area.
 */
export function splitRadius(radius: number, count: number): number {
  return radius / Math.sqrt(count);
}

/** Poses the orb as a single circle at a point of the viewport, in CSS px. */
export function placeOrb(orb: OrbState, x: number, y: number, radiusPx: number): void {
  const radius = splitRadius(radiusPx, orb.shapes.length);
  for (const shape of orb.shapes) setShape(shape, x, y, radius, radius, radius);
}

/**
 * Like `placeOrb`, but a point off screen holds the orb at the nearest edge
 * instead: it never leaves the page between two poses.
 */
export function holdOrbOnScreen(orb: OrbState, x: number, y: number, radiusPx: number): void {
  const margin = EDGE_GAP + radiusPx;
  const { clamp } = gsap.utils;
  placeOrb(
    orb,
    clamp(margin, window.innerWidth - margin, x),
    clamp(margin, window.innerHeight - margin, y),
    radiusPx,
  );
}

/** Center and radius of an OrbAnchor on screen, in CSS px. */
export function measureAnchor(anchor: Element): { x: number; y: number; radius: number } {
  const box = anchor.getBoundingClientRect();
  const radius = box.height / 2;
  return { x: box.left + box.width / 2, y: box.top + radius, radius };
}

/** Poses the orb on an OrbAnchor, at its size, held on screen. */
export function placeOrbOnAnchor(orb: OrbState, anchor: Element): void {
  const { x, y, radius } = measureAnchor(anchor);
  holdOrbOnScreen(orb, x, y, radius);
}
