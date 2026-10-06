/** On-screen box of an element in CSS px, with its corner radius. */
export interface FrameBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  radius: number;
}

/** One shape of the orb: a rounded box in viewport CSS px (a circle when both half sizes equal the corner radius). */
export interface BlobShape {
  x: number;
  y: number;
  halfWidth: number;
  halfHeight: number;
  corner: number;
}

/** Shapes the orb is made of: enough to split it three times in two. */
export const BLOB_SHAPES = 8;

/**
 * Scroll state of the sections the scene reacts to. Written by the sections'
 * own ScrollTriggers, read by the scene every frame: the scene never reads the
 * scroll position itself. Free of three.js imports, so sections can write it
 * without pulling the WebGL chunk into the initial bundle.
 */
export const scrollProgress = {
  /** Hero pin progress, 0..1. */
  hero: 0,
  /**
   * On-screen box of the hero frame: the gradient only paints inside it.
   * Null while unmeasured (no motion): the gradient fills the canvas.
   */
  heroFrame: null as FrameBox | null,
  /**
   * The orb, the page's single protagonist (src/components/scroll/orbDirector.ts
   * hands it from section to section). Its shapes melt into one another like
   * drops (metaballs), so moving them apart splits it and bringing them
   * together merges it. `panel` (0..1) turns its glassy look into the flat
   * gradient of the experiences panels. `hole` carves a circle out of it (CSS
   * px, radius 0 for none). The scene eases towards these values, unless
   * `isLocked` pins it exactly there.
   */
  orb: {
    isVisible: false,
    isLocked: false,
    panel: 0,
    hole: { x: 0, y: 0, radius: 0 },
    shapes: Array.from({ length: BLOB_SHAPES }, (): BlobShape => ({
      x: 0,
      y: 0,
      halfWidth: 0,
      halfHeight: 0,
      corner: 0,
    })),
  },
};

export type OrbState = typeof scrollProgress.orb;

/** Orb radius at rest, as a share of the smaller viewport side. */
export const ORB_SCALE = 0.07;

/** Hero pin progress over which the centered monogram shrinks while the orb grows out of it. */
export const HERO_COLLAPSE = { from: 0.6, to: 0.85 };
