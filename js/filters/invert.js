// Invert — photographic negative.
export const id = 'invert';
export const label = 'Invert';
export const description = 'Negative: every channel flipped.';

export function invertPixel(r, g, b) {
  return [255 - r, 255 - g, 255 - b];
}

export function apply(buf) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    out[i] = 255 - buf.data[i];
    out[i + 1] = 255 - buf.data[i + 1];
    out[i + 2] = 255 - buf.data[i + 2];
    out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
