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
 * of a sphere: the blob is shaded like the glassy orb it replaces. `uPanel`
 * fades that look into the flat gradient of the experiences panels (CSS
 * gradient-panel): top to bottom, flipped on odd shapes as they move to the
 * right half of the screen (the right panel), blended by field where shapes meet.
 * `uHole` (center, radius) cuts a circle out of the blob.
 */
export const blobFragment = /* glsl */ `
#define SHAPES 8

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColors[3];
uniform vec4 uShapes[SHAPES];
uniform float uCorners[SHAPES];
uniform float uPanel;
uniform vec3 uHole;

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

vec3 panelGradient(float t) {
  return t < 0.55
    ? mix(uColors[0], uColors[1], t / 0.55)
    : mix(uColors[1], uColors[2], (t - 0.55) / 0.45);
}

vec3 panelColor(vec2 p) {
  vec3 sum = vec3(0.0);
  float weight = 0.0;
  for (int i = 0; i < SHAPES; i++) {
    float f = shapeField(i, p);
    if (f == 0.0) continue;
    vec4 shape = uShapes[i];
    float t = clamp((shape.y + shape.w - p.y) / max(2.0 * shape.w, 1.0), 0.0, 1.0);
    float flip = i % 2 == 1 ? smoothstep(0.0, 0.25 * uResolution.x, shape.x - 0.5 * uResolution.x) : 0.0;
    sum += panelGradient(mix(t, 1.0 - t, flip)) * f;
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

  float inside = max(f, 1.0);
  vec3 normal = vec3(-gradient / slope * sqrt(1.0 / inside), sqrt(1.0 - 1.0 / inside));
  float fresnel = pow(1.0 - normal.z, 2.5);
  float swirl = 0.5 + 0.5 * sin(normal.y * 3.0 + normal.x * 2.0 + uTime * 0.6);
  vec3 body = mix(uColors[0], uColors[1], swirl);
  vec3 color = body * (0.7 + 0.5 * fresnel) + uColors[2] * pow(fresnel, 3.0);
  if (uPanel > 0.0) color = mix(color, panelColor(p), uPanel);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
  gl_FragColor.a = coverage;
}
`;
