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
 * Asks the scene for a snapshot of the orb swollen to a circle (center and
 * radius in CSS px, possibly off screen), drawn into a 2D `canvas`. The page
 * transition clips it into waves: the wave is made of the orb's own look.
 */
export interface CoverRequest {
  canvas: HTMLCanvasElement;
  x: number;
  y: number;
  radius: number;
  /** Size the gradient is scaled to, in CSS px: the orb's own radius gives its look, a larger one stretches it. */
  gradientSize: number;
}

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
   * together merges it. `hole` carves a circle out of it (CSS
   * px, radius 0 for none). The scene eases towards these values, unless
   * `isLocked` pins it exactly there.
   */
  orb: {
    isVisible: false,
    isLocked: false,
    hole: { x: 0, y: 0, radius: 0 },
    shapes: Array.from({ length: BLOB_SHAPES }, (): BlobShape => ({
      x: 0,
      y: 0,
      halfWidth: 0,
      halfHeight: 0,
      corner: 0,
    })),
  },
  /**
   * The orb burst into a cloud of dots (skills section). `origin` is where it
   * bursts from and gathers back to (CSS px), `shape` the formation (1 grid,
   * 2 wave, 3 torus), `gather` 1 while it is all inside the orb, 0 once spread.
   * The scene eases towards these values.
   */
  particles: { originX: 0, originY: 0, shape: 1, gather: 1 },
  /** Pending orb snapshot for the page transition; the scene serves it on its next frame and clears it. */
  coverRequest: null as CoverRequest | null,
};

export type OrbState = typeof scrollProgress.orb;
export type ParticlesState = typeof scrollProgress.particles;

/** Orb radius at rest, as a share of the smaller viewport side. */
export const ORB_SCALE = 0.07;

/** Hero pin progress over which the centered monogram shrinks while the orb grows out of it. */
export const HERO_COLLAPSE = { from: 0.6, to: 0.85 };
