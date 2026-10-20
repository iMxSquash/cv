import type Lenis from "lenis";

let instance: Lenis | null = null;

/** Registered by <SmoothScroll> while smooth scroll is on; returns the unregister function. */
export function registerLenis(lenis: Lenis): () => void {
  instance = lenis;
  return () => {
    if (instance === lenis) instance = null;
  };
}

/** The page's Lenis, null under reduced motion or before it exists: sections that steer the scroll ask for it when needed. */
export function getLenis(): Lenis | null {
  return instance;
}
