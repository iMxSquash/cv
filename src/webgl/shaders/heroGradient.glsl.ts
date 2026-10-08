import { filmGrain, meshGradient, simplexNoise3d } from "./meshGradient.glsl";

// The plane ignores the camera: it always covers the whole viewport, behind everything.
export const heroGradientVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

/*
 * Fluid mesh gradient: three wide bands (periwinkle halo around a mint core)
 * drifting over a deep navy base, in a noise-warped space, with a static film
 * grain. Colors arrive in linear space.
 * Only the hero frame is painted (uFrame, in drawing buffer pixels, rounded by
 * uFrameRadius): the canvas stays transparent around it, so the orb can roam the page.
 */
export const heroGradientFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec3 uBase;
// mint core, periwinkle halo, light cyan edge
uniform vec3 uColors[3];
uniform vec4 uFrame;
uniform float uFrameRadius;

varying vec2 vUv;

${simplexNoise3d}
${meshGradient}
${filmGrain}

// Signed distance to a rounded box centered on the origin (Inigo Quilez).
float roundedBoxDistance(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

void main() {
  // One pixel of antialiasing along the frame edge; nothing to compute outside it.
  vec2 frameCenter = (uFrame.xy + uFrame.zw) * 0.5;
  vec2 frameHalfSize = (uFrame.zw - uFrame.xy) * 0.5;
  float coverage = clamp(0.5 - roundedBoxDistance(gl_FragCoord.xy - frameCenter, frameHalfSize, uFrameRadius), 0.0, 1.0);
  if (coverage == 0.0) discard;

  float aspect = uResolution.x / uResolution.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * 0.05;

  vec3 color = meshGradient(p + uPointer * 0.04, aspect, t);

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>

  gl_FragColor.rgb += filmGrain(gl_FragCoord.xy);
  gl_FragColor.a = coverage;
}
`;
