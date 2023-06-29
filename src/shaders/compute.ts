import {
  GLSL3,
  RawShaderMaterial,
  Vector2,
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
uniform vec2 direction;
out vec4 data;
void main() {
  vec4 dot = texelFetch(dataMap, ivec2(gl_FragCoord.xy), 0);
  float velocity = texture(velocityMap, dot.xy).r;

  dot.w = mix(dot.w, max(1.1 - velocity, 0.0), 1.0 - exp(-30.0 * delta));
  dot.xy += direction * dot.w * delta;
  if (dot.x < 0.0) {
    dot.x += 1.0;
  }
  if (dot.x > 1.0) {
    dot.x -= 1.0;
  }
  if (dot.y < 0.0) {
    dot.y += 1.0;
  }
  if (dot.y > 1.0) {
    dot.y -= 1.0;
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
    direction: { value: new Vector2() },
  },
  vertexShader,
  fragmentShader,
});
