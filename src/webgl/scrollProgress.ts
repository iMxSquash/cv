/**
 * Scroll state of the sections the scene reacts to. Written by the sections'
 * own ScrollTriggers, read by the scene every frame: the scene never reads the
 * scroll position itself. Free of three.js imports, so sections can write it
 * without pulling the WebGL chunk into the initial bundle.
 */
export const scrollProgress = {
  /** Hero pin progress, 0..1. */
  hero: 0,
  /** Orb of the closing section: shown while its stage is on screen, at the head of the sentence (NDC). `radiusPx` grows it to that on-screen radius (the footer card opens as the orb itself); null keeps its resting size. */
  orb: { isVisible: false, x: 0, y: 0, radiusPx: null as number | null },
};

/** Orb radius, as a share of the smaller viewport side: the footer reveal grows from this size. */
export const ORB_SCALE = 0.07;
