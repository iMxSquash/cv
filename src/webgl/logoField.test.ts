import { describe, expect, it } from "vitest";

import { signedDistanceField } from "./logoField";

const SIZE = 16;
const OUTLINE = 128;

/** A mask with a filled square from `from` (included) to `to` (excluded) on both axes. */
function squareMask(from: number, to: number): Uint8Array {
  return Uint8Array.from({ length: SIZE * SIZE }, (_, index) => {
    const x = index % SIZE;
    const y = Math.floor(index / SIZE);
    return x >= from && x < to && y >= from && y < to ? 1 : 0;
  });
}
const at = (field: Uint8Array, x: number, y: number) => field[y * SIZE + x];

describe("signedDistanceField", () => {
  it("is below the outline inside the logo and above it outside", () => {
    const field = signedDistanceField(squareMask(4, 12), SIZE);

    expect(at(field, 8, 8)).toBeLessThan(OUTLINE);
    expect(at(field, 0, 0)).toBeGreaterThan(OUTLINE);
  });

  it("grows with the distance from the logo", () => {
    const field = signedDistanceField(squareMask(6, 10), SIZE);

    expect(at(field, 2, 8)).toBeGreaterThan(at(field, 4, 8));
    expect(at(field, 4, 8)).toBeGreaterThan(at(field, 5, 8));
  });

  it("deepens towards the middle of the logo", () => {
    const field = signedDistanceField(squareMask(2, 14), SIZE);

    expect(at(field, 8, 8)).toBeLessThan(at(field, 3, 8));
  });

  it("is mirrored for a mirrored mask", () => {
    const field = signedDistanceField(squareMask(3, 9), SIZE);
    const mirrored = signedDistanceField(squareMask(SIZE - 9, SIZE - 3), SIZE);

    expect(at(field, 5, 6)).toBe(at(mirrored, SIZE - 1 - 5, SIZE - 1 - 6));
  });

  it("is far from the logo everywhere for an empty mask", () => {
    const field = signedDistanceField(new Uint8Array(SIZE * SIZE), SIZE);

    expect(field.every((cell) => cell === 255)).toBe(true);
  });
});
