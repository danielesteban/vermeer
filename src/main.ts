import './main.css';
import {
  Camera,
  DataTexture,
  FloatType,
  InstancedBufferGeometry,
  Mesh,
  TextureLoader,
  WebGLRenderer,
  WebGLRenderTarget,
  PlaneGeometry,
  SRGBColorSpace,
  RGBAFormat,
  RedFormat,
  Vector2,
} from 'three';
import Compute from './shaders/compute';
// import Debug from './shaders/debug';
import Dots from './shaders/dots';
import Velocity from './shaders/velocity';

// @ts-ignore
import Art from './art.jpg';

const size = new Vector2(512, 512);
const dotsSize = new Vector2(128, 256);
const zoom = size.y;

const viewport = document.getElementById('viewport')!;
const prevent = (e: DragEvent | MouseEvent | TouchEvent) => e.preventDefault();
window.addEventListener('contextmenu', prevent);
window.addEventListener('dragenter', prevent);
window.addEventListener('dragover', prevent);
window.addEventListener('touchstart', prevent);

const renderer = new WebGLRenderer({
  alpha: false,
  depth: false,
  stencil: false,
  powerPreference: 'high-performance',
});
viewport.appendChild(renderer.domElement);
const resolution = new Vector2();
const resize = () => {
  const { width, height } = viewport.getBoundingClientRect();
  resolution.set(width, height);
  renderer.setSize(width, height);
};
window.addEventListener('resize', resize);
resize();

// @ts-ignore
const camera = new Camera();
camera.position.z = 1;
const plane = new PlaneGeometry(2, 2, 1, 1);
const screen = new Mesh(plane);

{
  const colors = new Float32Array(dotsSize.x * dotsSize.y * 4);
  for (let i = 0, y = 0; y < dotsSize.y; y++) {
    for (let x = 0; x < dotsSize.x; x++, i+=4) {
      colors[i] = Math.random();
      colors[i + 1] = Math.random();
      colors[i + 2] = Math.random();
      colors[i + 3] = 1.0;
    }
  }
  const colorMap = new DataTexture(colors, dotsSize.x, dotsSize.y, RGBAFormat, FloatType);
  colorMap.needsUpdate = true;
  Dots.uniforms.colorMap.value = colorMap;
  Dots.uniforms.resolution.value = resolution;
  Dots.uniforms.size.value = size;
  Dots.uniforms.stride.value = dotsSize.x;
  Dots.uniforms.zoom.value = zoom * 0.5;
}

const dot = new InstancedBufferGeometry();
dot.instanceCount = dotsSize.x * dotsSize.y;
dot.setAttribute('position', plane.getAttribute('position'));
dot.setAttribute('uv', plane.getAttribute('uv'));
dot.setIndex(plane.getIndex());
const dots = new Mesh(dot, Dots);

const targets = Array.from({ length: 2 }, () => (
  new WebGLRenderTarget(dotsSize.x, dotsSize.y, { depthBuffer: false, type: FloatType })
));

let current = 0;
const step = (delta: number) => {
  Compute.uniforms.dataMap.value = targets[current].texture;
  Compute.uniforms.delta.value = delta;
  current = (current + 1) % 2;
  screen.material = Compute;
  renderer.setRenderTarget(targets[current]);
  renderer.render(screen, camera);
  renderer.setRenderTarget(null);
};

const load = async (url: string) => {
  const target = new WebGLRenderTarget(size.x, size.y, { depthBuffer: false, format: RedFormat, type: FloatType });
  const texture = await (new TextureLoader()).loadAsync(url);
  texture.colorSpace = SRGBColorSpace;
  Velocity.uniforms.image.value = texture;
  Velocity.uniforms.imageSize.value.set(texture.image.width, texture.image.height);
  Velocity.uniforms.size.value.copy(size);
  screen.material = Velocity;
  renderer.setRenderTarget(target);
  renderer.render(screen, camera);
  renderer.setRenderTarget(null);

  const initialData = new Float32Array(dotsSize.x * dotsSize.y * 4);
  for (let i = 0, y = 0; y < dotsSize.y; y++) {
    for (let x = 0; x < dotsSize.x; x++, i+=4) {
      initialData[i] = x / (dotsSize.x - 1);
      initialData[i + 1] = y / (dotsSize.y - 1);
      initialData[i + 2] = 0.0;
      initialData[i + 3] = 2.0;
    }
  }
  const initialDataMap = new DataTexture(initialData, dotsSize.x, dotsSize.y, RGBAFormat, FloatType);
  initialDataMap.needsUpdate = true;
  Compute.uniforms.dataMap.value = initialDataMap;
  if (Compute.uniforms.velocityMap.value) {
    Compute.uniforms.velocityMap.value.dispose();
  }
  Compute.uniforms.velocityMap.value = target.texture;
  Compute.uniforms.delta.value = 0.0;
  current = 0;
  screen.material = Compute;
  renderer.setRenderTarget(targets[current]);
  renderer.render(screen, camera);
  renderer.setRenderTarget(null);
  Compute.uniforms.dataMap.value.dispose();
  Dots.uniforms.dataMap.value = targets[current].texture;
  return target.texture;
};

// load(Art).then((velocityMap) => {
//   Debug.uniforms.image.value = velocityMap;
//   Debug.uniforms.resolution.value = resolution;
//   Debug.uniforms.size.value = size;
//   Debug.uniforms.zoom.value = zoom * 0.5;
//   screen.material = Debug;
//   renderer.render(screen, camera);
// });

load(Art).then(() => {
  let lastTick = performance.now();
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const delta = Math.min((now - lastTick) / 1000, 0.2);
    lastTick = now;
    step(delta);
    Dots.uniforms.dataMap.value = targets[current].texture;
    renderer.render(dots, camera);
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const [file] = e.dataTransfer?.files || [];
    if (file && file.type.indexOf('image/') === 0) {
      const url = URL.createObjectURL(file);
      load(url).finally(() => URL.revokeObjectURL(url));
    }
  });
});