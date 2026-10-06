// The plane ignores the camera: it always covers the whole viewport, behind everything.
export const heroGradientVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

// 3D simplex noise by Ian McEwan and Stefan Gustavson (Ashima Arts), MIT license.
const simplexNoise3d = /* glsl */ `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/*
 * Mesh gradient: four color blobs drifting over a dark base, in a noise-warped
 * space. Colors arrive in linear space; the luminance clamp keeps the hero text
 * readable over every frame (see MAX_GRADIENT_LUMINANCE in HeroGradient.ts).
 * Only the hero frame is painted (uFrame, in drawing buffer pixels, rounded by
 * uFrameRadius): the canvas stays transparent around it, so the orb can roam the page.
 */
export const heroGradientFragment = /* glsl */ `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec3 uBase;
uniform vec3 uColors[4];
uniform float uMaxLuminance;
uniform vec4 uFrame;
uniform float uFrameRadius;

varying vec2 vUv;

${simplexNoise3d}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

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
  float t = uTime * 0.04;

  vec2 warp = vec2(snoise(vec3(p * 1.1, t)), snoise(vec3(p * 1.1 + 5.2, t + 3.7)));
  vec2 q = p + 0.35 * warp + uPointer * 0.04;

  vec3 color = uBase;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 center = 0.55 * vec2(aspect * sin(t * (1.3 + 0.2 * fi) + fi * 1.7), cos(t * (1.1 + 0.3 * fi) + fi * 2.3));
    vec2 d = q - center;
    color = mix(color, uColors[i], exp(-dot(d, d) * 2.4) * 0.85);
  }

  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color *= min(1.0, uMaxLuminance / max(luminance, 1e-4));

  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>

  // Dither after sRGB encoding, where banding shows: +-1.5/255 stays within the contrast margin.
  gl_FragColor.rgb += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * (3.0 / 255.0);
  gl_FragColor.a = coverage;
}
`;
