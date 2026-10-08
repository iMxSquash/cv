import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  BLOB_SHAPES,
  type BlobShape,
  ORB_SCALE,
  type OrbState,
  scrollProgress,
} from "@/webgl/scrollProgress";

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

/**
 * While the orb flows (page transition), shape `index` chases its target at a
 * speed from the first (fast, the head) to the last (slow, the tail), in 1/s.
 * The lag spreads the metaballs along the way: the orb stretches like a liquid.
 */
const FLOW_SPEED_HEAD = 16;
const FLOW_SPEED_TAIL = 5;
/** Under this distance in px every shape is considered arrived. */
const FLOW_SETTLED_PX = 0.5;

const claims = new Set<OrbClaim>();

/** Where the page transition sends the orb, null when the sections pose it. */
let flowTarget: { x: number; y: number } | null = null;
/** The orb jumps (no easing at all) wherever the transition teleports it. */
let isTeleporting = false;
/** The shapes as the flow has eased them so far; the scene eases again on top. */
const flowShapes: BlobShape[] = Array.from({ length: BLOB_SHAPES }, () => ({
  x: 0,
  y: 0,
  halfWidth: 0,
  halfHeight: 0,
  corner: 0,
}));
let isFlowing = false;

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

const drive = (_time: number, deltaMs: number) => {
  const { orb } = scrollProgress;
  const claim = findCurrentClaim();
  orb.isVisible = claim !== null || flowTarget !== null;
  orb.isLocked = isTeleporting;
  orb.hole.radius = 0;
  // The dot cloud stays inside the orb unless the pose spreads it.
  scrollProgress.particles.gather = 1;
  if (flowTarget) {
    placeOrb(orb, flowTarget.x, flowTarget.y, restingOrbRadius());
  } else {
    claim?.pose(orb);
  }
  if (isFlowing) flow(orb, deltaMs / 1000);
};

function copyShape(from: BlobShape, to: BlobShape): void {
  setShape(to, from.x, from.y, from.halfWidth, from.halfHeight, from.corner);
}

/** Eases the flow shapes towards the posed ones, each at its own speed, and poses the result. */
function flow(orb: OrbState, deltaSeconds: number): void {
  let largestGap = 0;
  orb.shapes.forEach((shape, index) => {
    const eased = flowShapes[index];
    if (isTeleporting) {
      copyShape(shape, eased);
      return;
    }
    const speed = gsap.utils.interpolate(
      FLOW_SPEED_HEAD,
      FLOW_SPEED_TAIL,
      index / (BLOB_SHAPES - 1),
    );
    const ease = 1 - Math.exp(-deltaSeconds * speed);
    for (const key of ["x", "y", "halfWidth", "halfHeight", "corner"] as const) {
      largestGap = Math.max(largestGap, Math.abs(shape[key] - eased[key]));
      eased[key] += (shape[key] - eased[key]) * ease;
    }
    copyShape(eased, shape);
  });
  // Once released and arrived, the sections' poses are exact again.
  if (!flowTarget && (!orb.isVisible || largestGap < FLOW_SETTLED_PX)) isFlowing = false;
}

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
    if (claims.size > 0 || flowTarget) return;
    gsap.ticker.remove(drive);
    scrollProgress.orb.isVisible = false;
  };
}

/**
 * Page transition: sends the orb flowing to a point of the viewport (CSS px),
 * overriding the sections' poses. Starts from where the orb is, or from the
 * point itself when it was not on screen.
 */
export function sendOrbTo(x: number, y: number): void {
  const { orb } = scrollProgress;
  if (!isFlowing) {
    if (!orb.isVisible) placeOrb(orb, x, y, restingOrbRadius());
    orb.shapes.forEach((shape, index) => copyShape(shape, flowShapes[index]));
  }
  flowTarget = { x, y };
  isTeleporting = false;
  isFlowing = true;
  gsap.ticker.add(drive);
}

/** Page transition: moves the orb to a point in one jump, unseen (the overlay covers the page). */
export function teleportOrbTo(x: number, y: number): void {
  flowTarget = { x, y };
  isTeleporting = true;
  isFlowing = true;
  gsap.ticker.add(drive);
}

/** Page transition over: the orb flows from where it is to the pose of the section it lands on. */
export function releaseOrb(): void {
  flowTarget = null;
  isTeleporting = false;
  if (claims.size > 0) return;
  gsap.ticker.remove(drive);
  isFlowing = false;
  scrollProgress.orb.isVisible = false;
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
