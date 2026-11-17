// Solarize — flip channels above the midpoint (classic darkroom effect).
export const id = 'solarize';
export const label = 'Solarize';
export const description = 'Darkroom solarisation: tones above mid-grey flip.';

export function apply(buf, threshold = 128) {
  const out = new Uint8ClampedArray(buf.data.length);
  for (let i = 0; i < buf.data.length; i += 4) {
    out[i] = buf.data[i] > threshold ? 255 - buf.data[i] : buf.data[i];
    out[i + 1] = buf.data[i + 1] > threshold ? 255 - buf.data[i + 1] : buf.data[i + 1];
    out[i + 2] = buf.data[i + 2] > threshold ? 255 - buf.data[i + 2] : buf.data[i + 2];
    out[i + 3] = buf.data[i + 3];
  }
  return { width: buf.width, height: buf.height, data: out };
}
