// Editor — owns the canvases, the render pipeline, zoom/pan, crop mode and
// the before/after compare slider. DOM bindings live in js/ui/*; this class
// only knows about pixels and geometry.
import { runPipeline } from '../core/pipeline.js';
import { applyTransform, isIdentityTransform } from '../core/transform.js';
import { cropBuffer, fullCrop, clampCrop } from '../core/crop.js';
import { cloneBuffer } from '../core/utils.js';

export class Editor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    // Offscreen working canvases (never shown directly).
    this.sourceCanvas = document.createElement('canvas'); // original upload
    this.workCanvas = document.createElement('canvas'); // after transform+crop
    this.editCanvas = document.createElement('canvas'); // after pipeline
    this.sourceBuffer = null; // { width, height, data }
    this.workBuffer = null;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.cropMode = false;
    this.compareX = null; // null = compare off; 0..1 = divider position
    this.compareHold = false; // hold-to-compare (shows original while held)
    this.onCropChange = null; // callback(rect)
    this._renderQueued = false;
  }

  get hasImage() { return !!this.sourceBuffer; }
  get imageWidth() { return this.sourceBuffer ? this.sourceBuffer.width : 0; }
  get imageHeight() { return this.sourceBuffer ? this.sourceBuffer.height : 0; }

  // Load an HTMLImageElement (or canvas) as the new source image.
  loadImage(img) {
    this.sourceCanvas.width = img.naturalWidth || img.width;
    this.sourceCanvas.height = img.naturalHeight || img.height;
    const ctx = this.sourceCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, this.sourceCanvas.width, this.sourceCanvas.height);
    this.sourceBuffer = {
      width: imageData.width,
      height: imageData.height,
      data: new Uint8ClampedArray(imageData.data),
    };
    this.workBuffer = cloneBuffer(this.sourceBuffer);
    this.zoom = 1; this.panX = 0; this.panY = 0;
    this.compareX = null; this.compareHold = false;
  }

  // Recompute the working buffer from source + transform + crop.
  rebuildWorking(state) {
    if (!this.sourceBuffer) return;
    let buf = this.sourceBuffer;
    if (!isIdentityTransform(state.transform)) buf = applyTransform(buf, state.transform);
    const crop = state.crop || fullCrop(buf.width, buf.height);
    const clamped = clampCrop(crop, buf.width, buf.height);
    if (clamped.width !== buf.width || clamped.height !== buf.height || clamped.x !== 0 || clamped.y !== 0) {
      buf = cropBuffer(buf, clamped);
    }
    this.workBuffer = buf;
  }

  // Fit the image into the canvas element (CSS pixels).
  fitToView() {
    if (!this.workBuffer) return;
    const rect = this.canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / this.workBuffer.width, rect.height / this.workBuffer.height, 1);
    this.zoom = Math.max(0.05, scale);
    this.panX = 0; this.panY = 0;
    this.render();
  }

  // Queue a render on the next animation frame (coalesces slider drags).
  queueRender(state) {
    this._pendingState = state;
    if (this._renderQueued) return;
    this._renderQueued = true;
    requestAnimationFrame(() => {
      this._renderQueued = false;
      this.render(this._pendingState);
    });
  }

  // Full render: pipeline -> edit canvas -> draw to screen with zoom/pan.
  render(state) {
    if (!this.workBuffer) return;
    const edited = state ? runPipeline(this.workBuffer, state.adjustments, state.filters) : this.workBuffer;
    this._putBuffer(this.editCanvas, edited);

    const dpr = window.devicePixelRatio || 1;
    const cssW = this.canvas.clientWidth, cssH = this.canvas.clientHeight;
    if (this.canvas.width !== Math.round(cssW * dpr) || this.canvas.height !== Math.round(cssH * dpr)) {
      this.canvas.width = Math.round(cssW * dpr);
      this.canvas.height = Math.round(cssH * dpr);
    }
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#101014';
    ctx.fillRect(0, 0, cssW, cssH);

    const drawW = this.workBuffer.width * this.zoom;
    const drawH = this.workBuffer.height * this.zoom;
    const ox = (cssW - drawW) / 2 + this.panX;
    const oy = (cssH - drawH) / 2 + this.panY;

    // Checkerboard behind transparent pixels.
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, drawW, drawH);
    ctx.clip();
    this._drawChecker(ctx, ox, oy, drawW, drawH);
    ctx.drawImage(this.editCanvas, ox, oy, drawW, drawH);
    // Compare: draw the unedited working image on the left of the divider.
    if (this.compareHold || this.compareX !== null) {
      const splitX = this.compareHold ? cssW : ox + drawW * this.compareX;
      ctx.save();
      ctx.beginPath();
      ctx.rect(ox, oy, Math.max(0, splitX - ox), drawH);
      ctx.clip();
      this._putBuffer(this.workCanvas, this.workBuffer);
      ctx.drawImage(this.workCanvas, ox, oy, drawW, drawH);
      ctx.restore();
      if (this.compareX !== null && !this.compareHold) {
        ctx.strokeStyle = '#ff4d2e';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(splitX, oy); ctx.lineTo(splitX, oy + drawH); ctx.stroke();
        ctx.fillStyle = '#ff4d2e';
        ctx.beginPath(); ctx.arc(splitX, oy + drawH / 2, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('◂ ▸', splitX, oy + drawH / 2);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(ox + 6, oy + 6, 62, 20);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
        ctx.fillText('BEFORE', ox + 12, oy + 16);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(ox + drawW - 56, oy + 6, 50, 20);
        ctx.fillStyle = '#fff';
        ctx.fillText('AFTER', ox + drawW - 50, oy + 16);
      }
    }
    ctx.restore();

    if (this.cropMode) this._drawCropOverlay(ctx, ox, oy, drawW, drawH);
    this._lastDraw = { ox, oy, drawW, drawH };
  }

  _putBuffer(canvas, buf) {
    if (canvas.width !== buf.width || canvas.height !== buf.height) {
      canvas.width = buf.width; canvas.height = buf.height;
    }
    const ctx = canvas.getContext('2d');
    ctx.putImageData(new ImageData(new Uint8ClampedArray(buf.data), buf.width, buf.height), 0, 0);
  }

  _drawChecker(ctx, x, y, w, h) {
    const s = 16;
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#232329';
    for (let row = 0; row * s < h; row++) {
      for (let col = 0; col * s < w; col++) {
        if ((row + col) % 2 === 0) ctx.fillRect(x + col * s, y + row * s, s, s);
      }
    }
  }

  // --- Crop overlay -------------------------------------------------------
  _drawCropOverlay(ctx, ox, oy, drawW, drawH) {
    const rect = this._cropRect;
    if (!rect) return;
    const scaleX = drawW / this.workBuffer.width;
    const scaleY = drawH / this.workBuffer.height;
    const rx = ox + rect.x * scaleX, ry = oy + rect.y * scaleY;
    const rw = rect.width * scaleX, rh = rect.height * scaleY;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(ox, oy, drawW, ry - oy);
    ctx.fillRect(ox, ry + rh, drawW, oy + drawH - (ry + rh));
    ctx.fillRect(ox, ry, rx - ox, rh);
    ctx.fillRect(rx + rw, ry, ox + drawW - (rx + rw), rh);
    // Rule-of-thirds grid.
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(rx + (rw * i) / 3, ry); ctx.lineTo(rx + (rw * i) / 3, ry + rh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx, ry + (rh * i) / 3); ctx.lineTo(rx + rw, ry + (rh * i) / 3); ctx.stroke();
    }
    ctx.strokeStyle = '#ff4d2e';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);
    // Handles.
    const handles = this.cropHandles(rx, ry, rw, rh);
    ctx.fillStyle = '#fff';
    for (const h of handles) {
      ctx.fillRect(h.x - 5, h.y - 5, 10, 10);
      ctx.strokeStyle = '#ff4d2e';
      ctx.strokeRect(h.x - 5, h.y - 5, 10, 10);
    }
  }

  cropHandles(rx, ry, rw, rh) {
    return [
      { id: 'nw', x: rx, y: ry }, { id: 'n', x: rx + rw / 2, y: ry },
      { id: 'ne', x: rx + rw, y: ry }, { id: 'e', x: rx + rw, y: ry + rh / 2 },
      { id: 'se', x: rx + rw, y: ry + rh }, { id: 's', x: rx + rw / 2, y: ry + rh },
      { id: 'sw', x: rx, y: ry + rh }, { id: 'w', x: rx, y: ry + rh / 2 },
    ];
  }

  // Convert a screen point (CSS px, relative to the canvas) to image coords.
  screenToImage(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const d = this._lastDraw;
    if (!d) return null;
    const x = (clientX - rect.left - d.ox) / this.zoom;
    const y = (clientY - rect.top - d.oy) / this.zoom;
    return { x, y };
  }

  setCropRect(rect) { this._cropRect = rect; }
  getCropRect() { return this._cropRect; }

  setZoom(factor, centreX, centreY) {
    const old = this.zoom;
    this.zoom = Math.max(0.05, Math.min(20, factor));
    if (centreX !== undefined && centreY !== undefined) {
      const k = this.zoom / old;
      this.panX = centreX - (centreX - this.panX) * k;
      this.panY = centreY - (centreY - this.panY) * k;
    }
  }

  zoomBy(mult, centreX, centreY) {
    this.setZoom(this.zoom * mult, centreX, centreY);
  }

  zoomPercent() { return Math.round(this.zoom * 100); }

  // Export the current edited image as a data URL (full resolution).
  exportDataUrl(state, format, quality) {
    const edited = runPipeline(this.workBuffer, state.adjustments, state.filters);
    this._putBuffer(this.editCanvas, edited);
    const mime = format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    return this.editCanvas.toDataURL(mime, quality);
  }
}
