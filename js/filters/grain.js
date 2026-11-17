// Grain — film grain: add deterministic pseudo-random noise per pixel.
// Deterministic (seeded by pixel position) so the same edit always looks
// the same and exports are reproducible.
export const id = 'grain';
export const label = 'Grain';
export const description = 'Film grain for an analogue finish.';

function noiseAt(x, y) {
  // Cheap deterministic hash -> [-1, 1].
  let n = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
  n = (n ^ (n >> 13)) * 1274126177;
  n = (n ^ (n >> 16)) >>> 0;
  return n / 4294967295 * 2 - 1;
}

export function apply(buf, strength = 20) {
  const { width, height, data } = buf;
  const out = new Uint8ClampedArray(data.length);
  const amount = strength * 0.5;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const n = noiseAt(x, y) * amount;
      out[i] = data[i] + n;
      out[i + 1] = data[i + 1] + n;
      out[i + 2] = data[i + 2] + n;
      out[i + 3] = data[i + 3];
    }
  }
  return { width, height, data: out };
}
