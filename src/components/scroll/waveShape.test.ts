import { describe, expect, it } from "vitest";

import { createWaveOrigin, revealClip, wavePath } from "./waveShape";

const WIDTH = 1440;
const HEIGHT = 900;
const ORB_RADIUS = 63;

/** Parses the `M x yL x y…Z` outline back into points. */
function parsePoints(path: string): { x: number; y: number }[] {
  return [...path.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => ({
    x: Number(x),
    y: Number(y),
  }));
}

describe("createWaveOrigin", () => {
  it("starts at the orb's size without touching the viewport", () => {
    const origin = createWaveOrigin(WIDTH, HEIGHT, ORB_RADIUS);

    expect(origin.startRadius).toBe(ORB_RADIUS);
    expect(Math.hypot(origin.x - WIDTH, origin.y - HEIGHT)).toBeGreaterThan(origin.startRadius);
  });

  it("ends wide enough to reach the farthest viewport corner", () => {
    const origin = createWaveOrigin(WIDTH, HEIGHT, ORB_RADIUS);

    expect(origin.endRadius).toBeGreaterThan(Math.hypot(origin.x, origin.y));
  });
});

describe("wavePath", () => {
  const origin = createWaveOrigin(WIDTH, HEIGHT, ORB_RADIUS);

  it("is a plain circle of the orb's size before it moves", () => {
    const radii = parsePoints(wavePath(origin, 0, 1)).map(({ x, y }) =>
      Math.hypot(x - origin.x, y - origin.y),
    );

    radii.forEach((radius) => expect(radius).toBeCloseTo(ORB_RADIUS, 0));
  });

  it("covers every viewport corner once it is done", () => {
    const points = parsePoints(wavePath(origin, 1, 1));
    const nearestEdge = Math.min(
      ...points.map(({ x, y }) => Math.hypot(x - origin.x, y - origin.y)),
    );
    const corners = [
      [0, 0],
      [WIDTH, 0],
      [0, HEIGHT],
      [WIDTH, HEIGHT],
    ];

    corners.forEach(([x, y]) => {
      expect(Math.hypot(x - origin.x, y - origin.y)).toBeLessThan(nearestEdge);
    });
  });

  it("clamps progress outside 0..1", () => {
    expect(wavePath(origin, 3, 1)).toBe(wavePath(origin, 1, 1));
    expect(wavePath(origin, -2, 1)).toBe(wavePath(origin, 0, 1));
  });

  it("ripples differently for two seeds in mid-sweep", () => {
    expect(wavePath(origin, 0.5, 1)).not.toBe(wavePath(origin, 0.5, 4));
  });
});

describe("revealClip", () => {
  it("cuts the wave out of the full rectangle", () => {
    const origin = createWaveOrigin(WIDTH, HEIGHT, ORB_RADIUS);

    const clip = revealClip(origin, WIDTH, HEIGHT, 0.5, 1);

    expect(clip.startsWith(`path(evenodd, "M0 0H${WIDTH}V${HEIGHT}H0Z`)).toBe(true);
  });
});
