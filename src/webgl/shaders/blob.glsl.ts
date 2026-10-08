import { filmGrain, meshGradient, simplexNoise3d } from "./meshGradient.glsl";

// The plane ignores the camera: it covers the whole viewport, the shapes are found per pixel.
export const blobVertex = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/*
 * Metaballs: each rounded box adds a field (s / (s + d))², d its signed
 * distance and s its corner radius, so the field is 1 on its outline and the
 * shapes melt into one another where their fields add up. For a lone circle the
 * field is r² / distance², hence z = sqrt(1 - 1 / field) is exactly the height
 * of a sphere, which gives the surface normal. The orb is painted with the
 * hero's mesh gradient (navy base, mint bands, periwinkle halo) and a static
 * film grain. The experiences panels are this same orb split in two.
 * `uHole` (center, radius) cuts a circle out of the blob.
 */
export const blobFragment = /* glsl */ `
#define SHAPES 8

// Window onto the hero's mesh gradient: zoom (smaller is bigger) and where it looks.
const float ORB_ZOOM = 0.22;
const vec2 ORB_OFFSET = vec2(-0.3, 0.12);

uniform float uTime;
uniform vec3 uColors[3];
uniform vec3 uBase;
uniform vec4 uShapes[SHAPES];
uniform float uCorners[SHAPES];
uniform vec3 uHole;
// When above 0, size the gradient on this instead of each shape's own size (page transition cover).
uniform float uGradientSize;

${simplexNoise3d}
${meshGradient}
${filmGrain}

// Signed distance to a rounded box centered on the origin (Inigo Quilez).
float roundedBoxDistance(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float shapeField(int i, vec2 p) {
  float corner = uCorners[i];
  if (corner < 0.5) return 0.0;
  float d = roundedBoxDistance(p - uShapes[i].xy, uShapes[i].zw, corner);
  // Capped deep inside, where only the outline matters.
  float x = corner / max(corner + d, 0.1 * corner);
  return x * x;
}

float field(vec2 p) {
  float sum = 0.0;
  for (int i = 0; i < SHAPES; i++) sum += shapeField(i, p);
  return sum;
}

vec3 auroraColor(vec2 p) {
  float flowTime = uTime * 0.05;
  vec3 sum = vec3(0.0);
  float weight = 0.0;
  for (int i = 0; i < SHAPES; i++) {
    float f = shapeField(i, p);
    // A faraway shape weighs under 1% of the blend: not worth two noise calls.
    if (f < 0.01) continue;
    vec4 shape = uShapes[i];
    // The same mesh gradient as the hero background, seen through the shape. Sized on its short side, zoomed in
    // and shifted: a round orb or a tall panel both show big, bright bands instead of the navy between them.
    float size = uGradientSize > 0.0 ? uGradientSize : max(min(shape.z, shape.w), 1.0);
    vec2 local = (p - shape.xy) / size * ORB_ZOOM + ORB_OFFSET;
    sum += meshGradient(local, 1.0, flowTime) * f;
    weight += f;
  }
  return sum / max(weight, 1e-4);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float f = field(p);
  if (f < 0.5) discard;
  vec2 gradient = vec2(field(p + vec2(1.0, 0.0)), field(p + vec2(0.0, 1.0))) - f;
  float slope = max(length(gradient), 1e-4);
  // One pixel of antialiasing along the outline.
  float coverage = clamp((f - 1.0) / slope + 0.5, 0.0, 1.0);
  if (uHole.z > 0.0) coverage *= clamp(length(p - uHole.xy) - uHole.z + 0.5, 0.0, 1.0);
  if (coverage == 0.0) discard;

  vec3 color = auroraColor(p);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
  gl_FragColor.rgb += filmGrain(gl_FragCoord.xy);
  gl_FragColor.a = coverage;
}
`;
