// Transform math — rotation (90° steps) and flips on pixel buffers,
// plus the transform state the editor keeps ({ rotate: 0|90|180|270, flipH, flipV }).
// Transform state: 90° steps plus a free "straighten" angle in degrees.
export const DEFAULT_TRANSFORM = Object.freeze({ rotate: 0, angle: 0, flipH: false, flipV: false });

// Arbitrary-angle rotation with bilinear sampling. The output canvas is
// enlarged to fit the whole rotated image (no cropping). Pixels outside the
// source are transparent black.
export function rotateArbitrary(buf, degrees) {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const newWidth = Math.max(1, Math.round(buf.width * Math.abs(cos) + buf.height * Math.abs(sin)));
  const newHeight = Math.max(1, Math.round(buf.width * Math.abs(sin) + buf.height * Math.abs(cos)));
  const out = new Uint8ClampedArray(newWidth * newHeight * 4);
  const cx = buf.width / 2, cy = buf.height / 2;
  const ncx = newWidth / 2, ncy = newHeight / 2;

  const sample = (x, y, c) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const at = (px, py) => {
      if (px < 0 || py < 0 || px >= buf.width || py >= buf.height) return 0;
      return buf.data[(py * buf.width + px) * 4 + c];
    };
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
    const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  };

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      // Inverse rotation: where in the source does this destination pixel come from?
      const dx = x - ncx, dy = y - ncy;
      const sx = dx * cos + dy * sin + cx;
      const sy = -dx * sin + dy * cos + cy;
      const i = (y * newWidth + x) * 4;
      if (sx < -1 || sy < -1 || sx > buf.width || sy > buf.height) {
        out[i + 3] = 0; // outside: transparent
        continue;
      }
      out[i] = sample(sx, sy, 0);
      out[i + 1] = sample(sx, sy, 1);
      out[i + 2] = sample(sx, sy, 2);
      out[i + 3] = 255;
    }
  }
  return { width: newWidth, height: newHeight, data: out };
}

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
  if (transform.angle) current = rotateArbitrary(current, transform.angle);
  if (transform.flipH) current = flipHorizontal(current);
  if (transform.flipV) current = flipVertical(current);
  return current;
}

export function rotateTransform(transform) {
  return { ...transform, rotate: (transform.rotate + 90) % 360 };
}

export function isIdentityTransform(transform) {
  return transform.rotate === 0 && !transform.angle && !transform.flipH && !transform.flipV;
}
