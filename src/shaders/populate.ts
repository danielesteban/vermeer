import {
  GLSL3,
  RawShaderMaterial,
} from 'three';

const vertexShader = `
precision highp float;
precision highp int;
in vec3 position;
in vec2 uv;
out vec2 vUV;
void main() {
  vUV = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
precision highp int;
in vec2 vUV;
out vec4 data;
void main() {
  data = vec4(vUV, 0.0, 2.0);
}
`;

export default new RawShaderMaterial({
  glslVersion: GLSL3,
  vertexShader,
  fragmentShader,
});
