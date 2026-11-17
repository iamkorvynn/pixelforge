// Transform math — rotation (90° steps) and flips on pixel buffers,
// plus the transform state the editor keeps ({ rotate: 0|90|180|270, flipH, flipV }).
export const DEFAULT_TRANSFORM = Object.freeze({ rotate: 0, flipH: false, flipV: false });

export function rotate90Clockwise(buf) {
  const { width, height, data } = buf;
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = (x * height + (height - 1 - y)) * 4;
      out[dst] = data[src]; out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2]; out[dst + 3] = data[src + 3];
    }
  }
  return { width: height, height: width, data: out };
}

export function flipHorizontal(buf) {
  const { width, height, data } = buf;
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = (y * width + (width - 1 - x)) * 4;
      out[dst] = data[src]; out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2]; out[dst + 3] = data[src + 3];
    }
  }
  return { width, height, data: out };
}

export function flipVertical(buf) {
  const { width, height, data } = buf;
  const out = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = ((height - 1 - y) * width + x) * 4;
      out[dst] = data[src]; out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2]; out[dst + 3] = data[src + 3];
    }
  }
  return { width, height, data: out };
}

// Apply a full transform state to a buffer.
export function applyTransform(buf, transform) {
  let current = buf;
  const steps = ((transform.rotate % 360) + 360) % 360 / 90;
  for (let i = 0; i < steps; i++) current = rotate90Clockwise(current);
  if (transform.flipH) current = flipHorizontal(current);
  if (transform.flipV) current = flipVertical(current);
  return current;
}

export function rotateTransform(transform) {
  return { ...transform, rotate: (transform.rotate + 90) % 360 };
}

export function isIdentityTransform(transform) {
  return transform.rotate === 0 && !transform.flipH && !transform.flipV;
}
