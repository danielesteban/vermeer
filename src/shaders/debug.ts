import {
  GLSL3,
  RawShaderMaterial,
  Vector2,
} from 'three';

const vertexShader = `
precision highp float;
precision highp int;
in vec3 position;
in vec2 uv;
uniform vec2 resolution;
uniform vec2 size;
uniform float zoom;
out vec2 vUV;
void main() {
  vUV = uv;
  gl_Position = vec4(
    (
      (position * vec3(size * 0.5, 1.0))
      / vec3(vec2(resolution.x / resolution.y, 1.0) * zoom, 1.0)
    ),
    1.0
  );
}
`;

const fragmentShader = `
precision highp float;
precision highp int;
in vec2 vUV;
uniform sampler2D image;
out vec4 color;
void main() {
  color = vec4(vec3(texture(image, vUV).r), 1.0);
}
`;

export default new RawShaderMaterial({
  glslVersion: GLSL3,
  uniforms: {
    image: { value: null },
    resolution: { value: new Vector2() },
    size: { value: new Vector2() },
    zoom: { value: 0.0 },
  },
  vertexShader,
  fragmentShader,
});
