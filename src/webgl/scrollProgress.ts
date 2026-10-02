/**
 * Scroll progress (0..1) of the sections the scene reacts to. Written by the
 * sections' own ScrollTriggers, read by the scene every frame: the scene never
 * reads the scroll position itself. Free of three.js imports, so sections can
 * write it without pulling the WebGL chunk into the initial bundle.
 */
export const scrollProgress = {
  hero: 0,
};
