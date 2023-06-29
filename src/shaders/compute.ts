import {
  GLSL3,
  RawShaderMaterial,
} from 'three';

const vertexShader = `
precision highp float;
precision highp int;
in vec3 position;
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
precision highp int;
uniform sampler2D dataMap;
uniform sampler2D velocityMap;
uniform float delta;
out vec4 data;
void main() {
  vec4 dot = texelFetch(dataMap, ivec2(gl_FragCoord.xy), 0);
  float velocity = texture(velocityMap, dot.xy).r;

  dot.w = mix(dot.w, max(1.1 - velocity, 0.0), 1.0 - exp(-30.0 * delta));
  dot.x += dot.w * 0.1 * delta;
  if (dot.x > 1.0) {
    dot.x -= 1.0;
    dot.w = 2.0;
  }

  data = dot;
}
`;

export default new RawShaderMaterial({
  glslVersion: GLSL3,
  uniforms: {
    dataMap: { value: null },
    velocityMap: { value: null },
    delta: { value: 0.0 },
  },
  vertexShader,
  fragmentShader,
});
