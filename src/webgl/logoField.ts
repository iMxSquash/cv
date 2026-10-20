/** Side of a logo's distance field, in texels. */
export const LOGO_FIELD_SIZE = 512;
/** Share of the field's side the logo is drawn over: the rest is room for the shape to melt in and out. */
export const LOGO_CONTENT_SHARE = 0.7;
/** Distances are stored within ±`LOGO_MAX_DISTANCE` texels, 0.5 in the field being the outline. */
export const LOGO_MAX_DISTANCE = 64;

const FAR = 1e20;

function intersection(line: Float32Array, q: number, p: number): number {
  return (line[q] + q * q - (line[p] + p * p)) / (2 * q - 2 * p);
}

/** Scratch buffers of one distance transform, sized for a `size`-sided grid. */
interface Scratch {
  vertices: Int32Array;
  bounds: Float32Array;
  line: Float32Array;
  source: Float32Array;
}

/** Squared distance to the nearest zero of `scratch.line` (Felzenszwalb's lower envelope of parabolas), in place. */
function squaredDistances({ line, source, vertices, bounds }: Scratch): void {
  const size = line.length;
  let k = 0;
  vertices[0] = 0;
  bounds[0] = -FAR;
  bounds[1] = FAR;
  for (let q = 1; q < size; q++) {
    let s = intersection(line, q, vertices[k]);
    while (s <= bounds[k]) {
      k--;
      s = intersection(line, q, vertices[k]);
    }
    k++;
    vertices[k] = q;
    bounds[k] = s;
    bounds[k + 1] = FAR;
  }
  source.set(line);
  k = 0;
  for (let q = 0; q < size; q++) {
    while (bounds[k + 1] < q) k++;
    const gap = q - vertices[k];
    line[q] = gap * gap + source[vertices[k]];
  }
}

/** Distance of every cell of a `size`-sided grid to the nearest cell whose mask value is `target`, in cells. */
function distancesTo(mask: Uint8Array, target: 0 | 1, size: number): Float32Array {
  const grid = new Float32Array(mask.length);
  for (let i = 0; i < grid.length; i++) grid[i] = mask[i] === target ? 0 : FAR;
  const scratch: Scratch = {
    vertices: new Int32Array(size),
    bounds: new Float32Array(size + 1),
    line: new Float32Array(size),
    source: new Float32Array(size),
  };
  const { line } = scratch;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) line[y] = grid[y * size + x];
    squaredDistances(scratch);
    for (let y = 0; y < size; y++) grid[y * size + x] = line[y];
  }
  for (let y = 0; y < size; y++) {
    line.set(grid.subarray(y * size, (y + 1) * size));
    squaredDistances(scratch);
    grid.set(line, y * size);
  }
  for (let i = 0; i < grid.length; i++) grid[i] = Math.sqrt(grid[i]);
  return grid;
}

/**
 * Signed distance field of a mask (1 where the logo is), one byte per cell: 0.5 (128) on the outline,
 * towards 255 outside and 0 inside, saturating at `LOGO_MAX_DISTANCE` cells. Sampled with filtering,
 * it lets a shape morph into the logo by interpolating distances instead of cross-fading masks.
 */
export function signedDistanceField(mask: Uint8Array, size: number): Uint8Array {
  const toLogo = distancesTo(mask, 1, size);
  const toOutside = distancesTo(mask, 0, size);
  const field = new Uint8Array(mask.length);
  for (let i = 0; i < field.length; i++) {
    const scaled = 0.5 + (toLogo[i] - toOutside[i]) / (2 * LOGO_MAX_DISTANCE);
    field[i] = Math.round(255 * Math.min(1, Math.max(0, scaled)));
  }
  return field;
}
