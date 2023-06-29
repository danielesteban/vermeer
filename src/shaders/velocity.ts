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
uniform vec2 imageSize;
uniform vec2 size;
flat out vec2 vPixel;
out vec2 vUV;
void main() {
  vec2 outOffset;
  vec2 outSize = size;
  if (imageSize.x / imageSize.y > size.x / size.y) {
    outSize.x *= imageSize.y / imageSize.x;
    outOffset.x = size.x * 0.5 - outSize.x * 0.5;
  } else {
    outSize.y *= imageSize.x / imageSize.y;
    outOffset.y = size.y * 0.5 - outSize.y * 0.5;
  }
  outSize /= size;
  outOffset /= size;
  vPixel = outSize / size;
  vUV = uv * outSize + outOffset;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
precision highp int;
flat in vec2 vPixel;
in vec2 vUV;
uniform sampler2D image;
uniform float intensity;
out float velocity;
float lightness(in vec3 rgb) {
  float min = min(min(rgb.r, rgb.g), rgb.b);
  float max = max(max(rgb.r, rgb.g), rgb.b);
  return (min + max) / 2.0;
}
void main() {
  vec3 offset = vec3(vPixel, 0.0);
  float pixelCenter = lightness(texture(image, vUV).rgb);
  float pixelLeft   = lightness(texture(image, vUV - offset.xz).rgb);
  float pixelRight  = lightness(texture(image, vUV + offset.xz).rgb);
  float pixelUp     = lightness(texture(image, vUV + offset.zy).rgb);
  float pixelDown   = lightness(texture(image, vUV - offset.zy).rgb);
  velocity = clamp((
    abs(pixelLeft - pixelCenter)
    + abs(pixelRight - pixelCenter)
    + abs(pixelUp - pixelCenter)
    + abs(pixelDown - pixelCenter)
  ) * intensity, 0.0, 1.0);
}
`;

export default new RawShaderMaterial({
  glslVersion: GLSL3,
  uniforms: {
    image: { value: null },
    imageSize: { value: new Vector2() },
    intensity: { value: 0.0 },
    size: { value: new Vector2() },
  },
  vertexShader,
  fragmentShader,
});
