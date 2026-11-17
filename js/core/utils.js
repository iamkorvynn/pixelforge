// Shared numeric helpers for the PixelForge pixel pipeline.
// All functions here are pure and side-effect free so they are easy to test.
export function clamp(v, min = 0, max = 255) {
  return v < min ? min : v > max ? max : v;
}

export function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function clampByte(v) {
  return Math.round(clamp(v));
}

// Linear interpolation between a and b.
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Map a slider value in [-100, 100] to a multiplier in [0, 2].
export function sliderToFactor(v) {
  return clamp01(1 + v / 100);
}

// Create a blank RGBA pixel buffer of the given size.
export function makeBuffer(width, height, fill = [0, 0, 0, 255]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill[0]; data[i + 1] = fill[1]; data[i + 2] = fill[2]; data[i + 3] = fill[3];
  }
  return { width, height, data };
}

// Read one pixel as [r, g, b, a].
export function getPixel(buf, x, y) {
  const i = (y * buf.width + x) * 4;
  return [buf.data[i], buf.data[i + 1], buf.data[i + 2], buf.data[i + 3]];
}

// Write one pixel.
export function setPixel(buf, x, y, [r, g, b, a = 255]) {
  const i = (y * buf.width + x) * 4;
  buf.data[i] = r; buf.data[i + 1] = g; buf.data[i + 2] = b; buf.data[i + 3] = a;
}

// Deep-clone a pixel buffer (used by history snapshots).
export function cloneBuffer(buf) {
  return { width: buf.width, height: buf.height, data: new Uint8ClampedArray(buf.data) };
}
