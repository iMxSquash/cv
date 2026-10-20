import { LOGO_FIELD_SIZE, LOGO_MAX_DISTANCE } from "../logoField";
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
 * `uHole` (center, radius) cuts a circle out of the blob. `uLogoMix` morphs the
 * orb from one shape to another, each being the round orb or a logo: a logo's
 * texture is a signed distance field (see logoField.ts), so interpolating the two
 * shapes' distances moves the outline continuously from one to the other (a logo
 * to the next one directly) instead of cross-fading two masks.
 * The distance is then turned back into a field that is 1 on the outline.
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
// The orb morphs from one shape to the other (uHasFrom / uHasTo: a logo, else the round orb) by uLogoMix
// (0..1). A logo's distance field, its image and the share of the field the image covers per axis are given
// per shape; the field's center and half side are shared, in drawing buffer pixels.
uniform float uLogoActive;
uniform float uLogoMix;
uniform vec3 uLogoBox;
uniform float uHasFrom;
uniform sampler2D uFieldFrom;
uniform sampler2D uImageFrom;
uniform vec2 uFitFrom;
uniform float uHasTo;
uniform sampler2D uFieldTo;
uniform sampler2D uImageTo;
uniform vec2 uFitTo;

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

const float LOGO_FIELD_SIZE = ${LOGO_FIELD_SIZE.toFixed(1)};
const float LOGO_MAX_DISTANCE = ${LOGO_MAX_DISTANCE.toFixed(1)};
// Distance (px) over which the morphing field goes from 1 (outline) to 0; wider than the antialiasing.
const float MORPH_FALLOFF = 64.0;

// Signed distance (px) to the logo, positive outside; beyond the texture, the distance to its box adds up.
// The field's texels only know the outline to within a texel; along it, the image's own antialiased alpha
// is exact, so it takes over within a couple of pixels of the outline (an edge pixel of coverage a lies
// 0.5 - a px from the contour). The orb's edge is then as sharp as the image, with no switch to see.
float logoDistance(sampler2D fieldTexture, sampler2D imageTexture, vec2 fit, vec2 p) {
  vec2 local = p - uLogoBox.xy;
  float halfSide = uLogoBox.z;
  float texel = 2.0 * halfSide / LOGO_FIELD_SIZE;
  float stored = texture2D(fieldTexture, local / (2.0 * halfSide) + 0.5).r;
  float beyond = length(max(abs(local) - halfSide, 0.0));
  float coarse = (stored * 2.0 - 1.0) * LOGO_MAX_DISTANCE * texel + beyond;

  // Sampled before any branch: derivatives (hence the mip level) need uniform control flow.
  vec2 uv = (local / (2.0 * halfSide)) / fit + 0.5;
  float alpha = texture2D(imageTexture, clamp(uv, 0.0, 1.0)).a;
  vec2 isInside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  alpha *= isInside.x * isInside.y;
  float fine = alpha >= 1.0 ? min(coarse, -0.5) : (alpha <= 0.0 ? max(coarse, 0.5) : 0.5 - alpha);
  return abs(coarse) < 2.0 ? fine : coarse;
}

float orbField(vec2 p) {
  if (uLogoActive < 0.5) return field(p);
  // The stacked circles of a posed orb add up to one circle of this radius.
  float roundDistance = length(p - uShapes[0].xy) - uShapes[0].z * sqrt(float(SHAPES));
  // Only the shapes that weigh anything are sampled: at rest, one.
  float from = roundDistance;
  float to = roundDistance;
  if (uLogoMix < 1.0 && uHasFrom > 0.5) from = logoDistance(uFieldFrom, uImageFrom, uFitFrom, p);
  if (uLogoMix > 0.0 && uHasTo > 0.5) to = logoDistance(uFieldTo, uImageTo, uFitTo, p);
  return 1.0 - mix(from, to, uLogoMix) / MORPH_FALLOFF;
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

// The gradient of the first shape, unweighted: a logo reaches where no round shape does.
vec3 logoColor(vec2 p) {
  vec4 shape = uShapes[0];
  float size = max(min(shape.z, shape.w), 1.0);
  return meshGradient((p - shape.xy) / size * ORB_ZOOM + ORB_OFFSET, 1.0, uTime * 0.05);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float f = orbField(p);
  if (f < 0.5) discard;
  float coverage;
  if (uLogoActive > 0.5) {
    // A morphing orb's field is a distance (see orbField), whose steps along the logo's edge would skew a slope
    // taken from neighbouring pixels: its coverage reads the distance itself, one pixel wide.
    coverage = clamp(0.5 - (1.0 - f) * MORPH_FALLOFF, 0.0, 1.0);
  } else {
    // One pixel of antialiasing along the outline.
    vec2 gradient = vec2(orbField(p + vec2(1.0, 0.0)), orbField(p + vec2(0.0, 1.0))) - f;
    coverage = clamp((f - 1.0) / max(length(gradient), 1e-4) + 0.5, 0.0, 1.0);
  }
  if (uHole.z > 0.0) coverage *= clamp(length(p - uHole.xy) - uHole.z + 0.5, 0.0, 1.0);
  if (coverage == 0.0) discard;

  vec3 color = uLogoActive > 0.5 ? logoColor(p) : auroraColor(p);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
  gl_FragColor.rgb += filmGrain(gl_FragCoord.xy);
  gl_FragColor.a = coverage;
}
`;
