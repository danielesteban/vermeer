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
uniform sampler2D colorMap;
uniform sampler2D dataMap;
uniform int stride;
uniform vec2 size;
uniform float zoom;
out vec3 vColor;
out vec2 vUV;
void main() {
  vec4 color = texelFetch(colorMap, ivec2(gl_InstanceID % stride, gl_InstanceID / stride), 0);
  vec4 data = texelFetch(dataMap, ivec2(gl_InstanceID % stride, gl_InstanceID / stride), 0);
  vColor = color.rgb * (1.0 - pow(data.w, 2.0));
  vUV = (uv - 0.5) * 2.0;
  gl_Position = vec4(
    (
      (position.xy * color.a + data.xy * size - size * 0.5)
      / vec2(resolution.x / resolution.y, 1.0)
      / zoom
    ),
    0.0,
    1.0
  );
}
`;

const fragmentShader = `
precision highp float;
precision highp int;
in vec3 vColor;
in vec2 vUV;
out vec4 color;
void main() {
  float d = min(length(vUV), 1.0);
  color = vec4(vColor * (1.0 - d), smoothstep(1.0, 0.8, d));
}
`;

export default new RawShaderMaterial({
  glslVersion: GLSL3,
  transparent: true,
  uniforms: {
    colorMap: { value: null },
    dataMap: { value: null },
    resolution: { value: new Vector2() },
    size: { value: new Vector2() },
    stride: { value: 0 },
    zoom: { value: 0.0 },
  },
  vertexShader,
  fragmentShader,
});
