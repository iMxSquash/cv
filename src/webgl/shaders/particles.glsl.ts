/*
 * Dotted sheet of the skills section. Each particle only knows its place on a
 * grid (aGrid, 0..1) and a random seed: the four formations are computed from
 * it. `uShape` (1..3) morphs grid -> wave -> torus, `uGather` (0..1) pulls
 * every particle back into the orb at `uOrigin`, fading it out. The seed
 * staggers both, so the sheet ripples from one form into the next.
 */
export const particlesVertex = /* glsl */ `
#define TAU 6.28318530718

attribute vec2 aGrid;
attribute float aSeed;

uniform float uTime;
uniform float uShape;
uniform float uGather;
uniform vec3 uOrigin;
uniform vec2 uView;
uniform float uPointSize;
uniform float uPixelRatio;
uniform vec3 uColors[3];

varying vec3 vColor;
varying float vAlpha;

vec3 rotateX(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

// Design: a flat, even grid over the whole view.
vec3 gridPosition() {
  return vec3((aGrid - 0.5) * uView * 0.94, 0.0);
}

// Development: a dotted floor seen in perspective, a swell rolling across it.
vec3 wavePosition() {
  float x = (aGrid.x - 0.5) * uView.x * 1.6;
  float z = mix(1.4, -3.5, aGrid.y);
  float swell = sin(aGrid.x * 9.0 - uTime * 0.8) * 0.16 + cos(aGrid.y * 7.0 + uTime * 0.6) * 0.1;
  return vec3(x, -0.5 * uView.y * 0.5 + swell, z);
}

// Tools: a tilted torus, slowly turning.
vec3 torusPosition() {
  float size = min(uView.x, uView.y);
  float major = size * 0.3;
  float minor = size * 0.12;
  float u = aGrid.x * TAU + uTime * 0.15;
  float v = aGrid.y * TAU;
  vec3 p = vec3((major + minor * cos(v)) * cos(u), (major + minor * cos(v)) * sin(u), minor * sin(v));
  return rotateY(rotateX(p, 1.1), uTime * 0.1);
}

float stagger(float progress) {
  float delay = aSeed * 0.35;
  return smoothstep(delay, delay + 0.65, clamp(progress, 0.0, 1.0));
}

void main() {
  vec3 p = gridPosition();
  p = mix(p, wavePosition(), stagger(uShape - 1.0));
  p = mix(p, torusPosition(), stagger(uShape - 2.0));
  float gathered = stagger(uGather);
  p = mix(p, uOrigin + (vec3(aSeed, fract(aSeed * 7.31), fract(aSeed * 3.17)) - 0.5) * 0.02, gathered);

  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  // Sized for the plane of the orb (4 units away), nearer dots look bigger.
  gl_PointSize = uPointSize * uPixelRatio * (4.0 / max(-viewPosition.z, 0.5));

  float t = aGrid.x;
  vColor = t < 0.5 ? mix(uColors[0], uColors[1], t * 2.0) : mix(uColors[1], uColors[2], t * 2.0 - 1.0);
  vAlpha = 1.0 - gathered;
}
`;

export const particlesFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  float coverage = smoothstep(0.5, 0.38, length(gl_PointCoord - 0.5)) * vAlpha;
  if (coverage <= 0.0) discard;
  gl_FragColor = vec4(vColor, 1.0);
  #include <colorspace_fragment>
  gl_FragColor.a = coverage;
}
`;
