// Generic 2-D convolution for a flat RGBA buffer.
// Kernels are square, odd-sized, and given as a flat array (row-major).
// Edge pixels are clamped to the nearest in-bounds pixel (edge replication).
import { clampByte } from './utils.js';

export function convolve(buf, kernel, divisor = 1, bias = 0) {
  const size = Math.sqrt(kernel.length);
  if (!Number.isInteger(size) || size % 2 === 0) {
    throw new Error('convolve: kernel must be a square with odd side length');
  }
  const half = (size - 1) / 2;
  const { width, height, data } = buf;
  const out = new Uint8ClampedArray(data.length);

  const at = (x, y, c) => {
    const cx = x < 0 ? 0 : x >= width ? width - 1 : x;
    const cy = y < 0 ? 0 : y >= height ? height - 1 : y;
    return data[(cy * width + cx) * 4 + c];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let acc = 0;
        for (let ky = -half; ky <= half; ky++) {
          for (let kx = -half; kx <= half; kx++) {
            const w = kernel[(ky + half) * size + (kx + half)];
            if (w !== 0) acc += at(x + kx, y + ky, c) * w;
          }
        }
        out[(y * width + x) * 4 + c] = clampByte(acc / divisor + bias);
      }
      out[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3];
    }
  }
  return { width, height, data: out };
}

// 3x3 box blur (all weights 1, divisor 9).
export const BOX_BLUR_3 = [1, 1, 1, 1, 1, 1, 1, 1, 1];

// 3x3 Gaussian-ish blur.
export const GAUSSIAN_BLUR_3 = [1, 2, 1, 2, 4, 2, 1, 2, 1];

// Classic sharpen kernel.
export const SHARPEN_3 = [0, -1, 0, -1, 5, -1, 0, -1, 0];

// Stronger sharpen.
export const SHARPEN_STRONG_3 = [-1, -1, -1, -1, 9, -1, -1, -1, -1];

// Edge detection (Laplacian) — used by the "Outline" fun filter.
export const EDGE_3 = [-1, -1, -1, -1, 8, -1, -1, -1, -1];

// Emboss.
export const EMBOSS_3 = [-2, -1, 0, -1, 1, 1, 0, 1, 2];

export function blur(buf, strength = 1) {
  // strength 1..5: repeat the 3x3 gaussian that many times.
  let current = buf;
  const n = Math.max(1, Math.min(5, Math.round(strength)));
  for (let i = 0; i < n; i++) current = convolve(current, GAUSSIAN_BLUR_3, 16);
  return current;
}

export function sharpen(buf, strength = 1) {
  const kernel = strength >= 2 ? SHARPEN_STRONG_3 : SHARPEN_3;
  return convolve(buf, kernel, 1);
}
