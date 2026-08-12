/** Fragment shader: soft circular point, mint→violet by particle + depth. */
export const particlesFragmentShader: string = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying float vRandom;
varying float vDepth;
varying float vBoost;

void main() {
  vec2 offset = gl_PointCoord - vec2(0.5);
  float dist = length(offset);
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.12, dist);
  float mixFactor = clamp(vRandom * 0.6 + vDepth * 0.4, 0.0, 1.0);
  vec3 color = mix(uColorA, uColorB, mixFactor);
  color += vBoost * 0.25;

  gl_FragColor = vec4(color, alpha * uOpacity);
}
`;

export default particlesFragmentShader;
