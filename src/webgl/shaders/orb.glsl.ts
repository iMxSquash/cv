export const orbVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(-viewPosition.xyz);
  gl_Position = projectionMatrix * viewPosition;
}
`;

// A soft glassy sphere: the palette gradient swirls over it, the rim glows (fresnel).
export const orbFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColors[3];

varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
  float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 2.5);
  float swirl = 0.5 + 0.5 * sin(vNormal.y * 3.0 + vNormal.x * 2.0 + uTime * 0.6);
  vec3 body = mix(uColors[0], uColors[1], swirl);
  vec3 color = body * (0.7 + 0.5 * fresnel) + uColors[2] * pow(fresnel, 3.0);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}
`;
