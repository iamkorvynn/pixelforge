// PixelForge — main bootstrap. Wires the editor, panels, toolbar, history and
// shortcuts into one working app. Pure vanilla JS; no framework, no build.
import { Editor } from './ui/editor.js';
import { toast } from './ui/toast.js';
import { setupUpload, loadSample } from './ui/upload.js';
import { buildTransformPanel } from './ui/transformPanel.js';
import { buildSliders, syncSliders } from './ui/sliders.js';
import { buildPresetStrip, markActivePreset, renderFilterChips, buildFilterGrid } from './ui/presetsPanel.js';
import { buildRecipesPanel } from './ui/recipesPanel.js';
import { buildToolbar } from './ui/toolbar.js';
import { setupShortcuts } from './ui/shortcuts.js';
import { buildExportDialog, buildShortcutsDialog } from './ui/dialogs.js';
import { DEFAULT_ADJUSTMENTS } from './core/pixel.js';
import { createState, resetAll, setAdjustment, addFilter, removeFilter, applyRecipeToState, stateToRecipeData } from './core/state.js';
import { History } from './core/history.js';
import { describePipeline } from './core/pipeline.js';
import { rotateTransform, DEFAULT_TRANSFORM } from './core/transform.js';
import { fullCrop, clampCrop, dragCrop, ASPECT_PRESETS, centredCrop } from './core/crop.js';
import { getPreset, presetToRecipe } from './presets/index.js';
import { parseRecipe } from './core/recipes.js';

const $ = (id) => document.getElementById(id);

// --- App state ------------------------------------------------------------
const canvas = $('editor-canvas');
const editor = new Editor(canvas);
const history = new History(50);
let state = null; // created when an image loads
let fileName = 'pixelforge-edit';
let activePresetId = null;
let cropAspect = 'free';
let cropDrag = null; // { handle, startX, startY, startRect }
let panDrag = null;
let compareDrag = false;

function currentState() { return state; }

function commit(next, label) {
  state = next;
  history.push(state);
  afterStateChange(label);
}

function afterStateChange(label) {
  editor.rebuildWorking(state);
  editor.queueRender(state);
  syncSliders(sliderInputs, state.adjustments);
  transformPanel.sync(state.transform.angle || 0);
  renderFilterChips(filterChipsEl, state.filters, onRemoveFilter);
  updateStatus(label);
  updateToolbar();
}

function updateToolbar() {
  toolbar.setUndoRedo(history.canUndo(), history.canRedo());
  toolbar.setZoomLabel(editor.zoomPercent());
}

function updateStatus(note) {
  const pipeline = state ? describePipeline(state.adjustments, state.filters) : 'No image loaded';
  $('status-pipeline').textContent = pipeline;
  $('status-image').textContent = state ? `${state.imageWidth} × ${state.imageHeight} px` : '—';
  $('status-zoom').textContent = `${editor.zoomPercent()}%`;
  if (note) toast(note);
}

function loadNewImage(img, name) {
  editor.loadImage(img);
  fileName = (name || 'pixelforge-edit').replace(/\.[^.]+$/, '');
  state = createState(editor.imageWidth, editor.imageHeight);
  history.clear();
  history.push(state);
  activePresetId = null;
  markActivePreset(presetStripEl, null);
  editor.setCropRect(state.crop);
  toolbar.setEnabled(true);
  afterStateChange();
  editor.fitToView();
  updateToolbar();
  $('empty-state').classList.add('hidden');
  $('editor-wrap').classList.remove('hidden');
  toast(`Loaded ${name || 'image'} — ${editor.imageWidth} × ${editor.imageHeight}px`);
}

// --- Sliders --------------------------------------------------------------
const sliderInputs = buildSliders($('sliders'), DEFAULT_ADJUSTMENTS, (key, value) => {
  if (!state) return;
  state = setAdjustment(state, key, value);
  activePresetId = null;
  markActivePreset(presetStripEl, null);
  editor.queueRender(state);
  updateStatus();
});
// Push one history entry per slider drag (on release), not per tick.
for (const input of Object.values(sliderInputs)) {
  input.addEventListener('change', () => {
    if (state) { history.push(state); updateToolbar(); }
  });
}

// --- Straighten -----------------------------------------------------------
const transformPanel = buildTransformPanel($('transform-panel'), (angle, committed) => {
  if (!state) return;
  state = { ...state, transform: { ...state.transform, angle } };
  editor.rebuildWorking(state);
  editor.queueRender(state);
  if (committed) { history.push(state); updateToolbar(); updateStatus(); }
});

// --- Presets & filters ----------------------------------------------------
const presetStripEl = $('preset-strip');
const filterChipsEl = $('filter-chips');

function onPickPreset(id) {
  const preset = getPreset(id);
  if (!preset || !state) return;
  const recipe = presetToRecipe(preset);
  commit(applyRecipeToState(state, recipe), `Applied preset “${preset.name}”`);
  activePresetId = id;
  markActivePreset(presetStripEl, id);
}

function onPickFilter(id) {
  if (!state) return;
  commit(addFilter(state, id), `Added filter`);
}

function onRemoveFilter(index) {
  if (!state) return;
  commit(removeFilter(state, index), 'Removed filter');
}

buildPresetStrip(presetStripEl, onPickPreset);
buildFilterGrid($('filter-grid'), onPickFilter);
renderFilterChips(filterChipsEl, [], onRemoveFilter);

// --- Recipes --------------------------------------------------------------
const recipesPanel = buildRecipesPanel({
  listEl: $('recipe-list'),
  nameInput: $('recipe-name'),
  saveBtn: $('recipe-save'),
  copyBtn: $('recipe-copy'),
  importText: $('recipe-import-text'),
  importBtn: $('recipe-import'),
  downloadBtn: $('recipe-download'),
  getCurrent: () => stateToRecipeData(state),
  onApply: (recipe) => {
    if (!state) { toast('Load an image first, then apply a recipe.'); return; }
    commit(applyRecipeToState(state, recipe), `Applied recipe “${recipe.name}”`);
    activePresetId = null;
    markActivePreset(presetStripEl, null);
  },
  onStatus: (msg) => toast(msg),
});

// --- Toolbar --------------------------------------------------------------
const toolbar = buildToolbar({
  undoBtn: $('btn-undo'), redoBtn: $('btn-redo'),
  rotateBtn: $('btn-rotate'), flipHBtn: $('btn-flip-h'), flipVBtn: $('btn-flip-v'),
  cropBtn: $('btn-crop'), zoomOutBtn: $('btn-zoom-out'), zoomInBtn: $('btn-zoom-in'),
  zoomLabel: $('zoom-label'), fitBtn: $('btn-fit'), compareBtn: $('btn-compare'),
  resetBtn: $('btn-reset'), exportBtn: $('btn-export'),
}, {
  undo: doUndo,
  redo: doRedo,
  rotate: () => {
    if (!state) return;
    commit({ ...state, transform: rotateTransform(state.transform) }, 'Rotated 90°');
  },
  flipH: () => { if (state) commit({ ...state, transform: { ...state.transform, flipH: !state.transform.flipH } }, 'Flipped horizontally'); },
  flipV: () => { if (state) commit({ ...state, transform: { ...state.transform, flipV: !state.transform.flipV } }, 'Flipped vertically'); },
  toggleCrop: toggleCrop,
  zoomBy: (mult) => { editor.zoomBy(mult); editor.queueRender(state); updateToolbar(); updateStatus(); },
  fit: () => { editor.fitToView(); updateToolbar(); updateStatus(); },
  toggleCompare: toggleCompare,
  reset: () => {
    if (!state) return;
    commit(resetAll(state), 'Reset all edits');
    activePresetId = null;
    markActivePreset(presetStripEl, null);
  },
  openExport: () => exportDialog.open(fileName),
});

function doUndo() {
  if (!state) return;
  const prev = history.undo(state);
  if (!prev) return;
  state = prev;
  activePresetId = null;
  markActivePreset(presetStripEl, null);
  afterStateChange('Undid');
}

function doRedo() {
  if (!state) return;
  const next = history.redo(state);
  if (!next) return;
  state = next;
  afterStateChange('Redid');
}

// --- Crop mode ------------------------------------------------------------
const cropBar = $('crop-bar');
function toggleCrop() {
  if (!state) { toast('Load an image first.'); return; }
  editor.cropMode = !editor.cropMode;
  toolbar.setCropActive(editor.cropMode);
  cropBar.classList.toggle('hidden', !editor.cropMode);
  if (editor.cropMode) {
    editor.setCropRect(clampCrop(state.crop, editor.workBuffer.width, editor.workBuffer.height));
    editor.render(state);
  } else {
    editor.render(state);
  }
}

$('crop-apply').addEventListener('click', () => {
  const rect = editor.getCropRect();
  if (!rect || !state) return;
  // Rebuild the working buffer with this crop, then make it the new source
  // (cropping is destructive) and reset the stored crop to full-frame.
  editor.rebuildWorking({ ...state, crop: clampCrop(rect, editor.imageWidth, editor.imageHeight) });
  editor.replaceSourceWithWorking();
  const next = {
    ...state,
    crop: fullCrop(editor.imageWidth, editor.imageHeight),
    imageWidth: editor.imageWidth,
    imageHeight: editor.imageHeight,
  };
  editor.cropMode = false;
  toolbar.setCropActive(false);
  cropBar.classList.add('hidden');
  commit(next, 'Cropped');
  editor.setCropRect(state.crop);
  editor.fitToView();
  updateToolbar();
});

$('crop-cancel').addEventListener('click', () => {
  editor.cropMode = false;
  toolbar.setCropActive(false);
  cropBar.classList.add('hidden');
  editor.setCropRect(state.crop);
  editor.render(state);
});

const aspectSelect = $('crop-aspect');
aspectSelect.innerHTML = Object.entries(ASPECT_PRESETS)
  .map(([id, p]) => `<option value="${id}">${p.label}</option>`).join('');
aspectSelect.addEventListener('change', () => {
  cropAspect = aspectSelect.value;
  const ratio = ASPECT_PRESETS[cropAspect].ratio;
  editor.setCropRect(centredCrop(editor.workBuffer.width, editor.workBuffer.height, ratio));
  editor.render(state);
});

// --- Compare --------------------------------------------------------------
function toggleCompare() {
  if (!state) return;
  editor.compareX = editor.compareX === null ? 0.5 : null;
  toolbar.setCompareActive(editor.compareX !== null);
  editor.render(state);
}

function holdBefore(on) {
  if (!state) return;
  editor.compareHold = on;
  editor.render(state);
}

// --- Canvas pointer interactions ------------------------------------------
function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('pointerdown', (e) => {
  if (!state) return;
  canvas.setPointerCapture(e.pointerId);
  const p = canvasPoint(e);
  const img = editor.screenToImage(e.clientX, e.clientY);
  if (editor.cropMode && editor.getCropRect()) {
    const rect = editor.getCropRect();
    const d = editor._lastDraw;
    if (d) {
      const rx = d.ox + rect.x * (d.drawW / editor.workBuffer.width);
      const ry = d.oy + rect.y * (d.drawH / editor.workBuffer.height);
      const rw = rect.width * (d.drawW / editor.workBuffer.width);
      const rh = rect.height * (d.drawH / editor.workBuffer.height);
      const hit = editor.cropHandles(rx, ry, rw, rh).find((h) => Math.abs(h.x - p.x) <= 10 && Math.abs(h.y - p.y) <= 10);
      if (hit) { cropDrag = { handle: hit.id, startX: img.x, startY: img.y, startRect: { ...rect } }; return; }
      if (p.x >= rx && p.x <= rx + rw && p.y >= ry && p.y <= ry + rh) {
        cropDrag = { handle: 'move', startX: img.x, startY: img.y, startRect: { ...rect } };
        return;
      }
    }
  }
  if (editor.compareX !== null) {
    const d = editor._lastDraw;
    if (d) {
      const splitX = d.ox + d.drawW * editor.compareX;
      if (Math.abs(p.x - splitX) <= 16) { compareDrag = true; return; }
    }
  }
  panDrag = { startX: p.x, startY: p.y, panX: editor.panX, panY: editor.panY };
});

canvas.addEventListener('pointermove', (e) => {
  if (!state) return;
  const p = canvasPoint(e);
  const img = editor.screenToImage(e.clientX, e.clientY);
  if (cropDrag && img) {
    const ratio = ASPECT_PRESETS[cropAspect].ratio;
    const next = dragCrop(cropDrag.startRect, cropDrag.handle, img.x - cropDrag.startX, img.y - cropDrag.startY, editor.workBuffer.width, editor.workBuffer.height, ratio);
    editor.setCropRect(next);
    editor.render(state);
    return;
  }
  if (compareDrag) {
    const d = editor._lastDraw;
    if (d) {
      editor.compareX = Math.max(0, Math.min(1, (p.x - d.ox) / d.drawW));
      editor.render(state);
    }
    return;
  }
  if (panDrag) {
    editor.panX = panDrag.panX + (p.x - panDrag.startX);
    editor.panY = panDrag.panY + (p.y - panDrag.startY);
    editor.render(state);
  }
});

canvas.addEventListener('pointerup', () => { cropDrag = null; panDrag = null; compareDrag = false; });
canvas.addEventListener('wheel', (e) => {
  if (!state) return;
  e.preventDefault();
  const p = canvasPoint(e);
  editor.zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, p.x, p.y);
  editor.queueRender(state);
  updateToolbar();
  updateStatus();
}, { passive: false });

// --- Upload & samples -----------------------------------------------------
setupUpload({
  fileInput: $('file-input'),
  dropZone: $('editor-wrap'),
  onLoad: (img, name) => loadNewImage(img, name),
  onError: (msg) => toast(msg),
});
$('btn-open').addEventListener('click', () => $('file-input').click());
$('btn-open-empty').addEventListener('click', () => $('file-input').click());

const SAMPLES = [
  { url: 'samples/sunset-gradient.png', name: 'Sunset Gradient' },
  { url: 'samples/mountain-dusk.png', name: 'Mountain Dusk' },
  { url: 'samples/ocean-waves.png', name: 'Ocean Waves' },
  { url: 'samples/forest-mist.png', name: 'Forest Mist' },
  { url: 'samples/city-neon.png', name: 'City Neon' },
  { url: 'samples/desert-dunes.png', name: 'Desert Dunes' },
];
const sampleList = $('sample-list');
for (const sample of SAMPLES) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sample-btn';
  btn.innerHTML = `<img src="${sample.url}" alt="${sample.name} sample"><span>${sample.name}</span>`;
  btn.addEventListener('click', () => loadSample(sample.url, sample.name, loadNewImage, (m) => toast(m)));
  sampleList.appendChild(btn);
}

// --- Export ---------------------------------------------------------------
const exportDialog = buildExportDialog($('export-dialog'), ({ format, quality, filename }) => {
  const dataUrl = editor.exportDataUrl(state, format, quality);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
  toast(`Exported ${filename}`);
});
const shortcutsDialog = buildShortcutsDialog($('shortcuts-dialog'));
$('btn-shortcuts').addEventListener('click', () => shortcutsDialog.open());

// --- Shortcuts ------------------------------------------------------------
setupShortcuts({
  undo: doUndo,
  redo: doRedo,
  open: () => $('file-input').click(),
  openExport: () => { if (state) exportDialog.open(fileName); },
  reset: () => { if (state) commit(resetAll(state), 'Reset all edits'); },
  rotate: () => { if (state) commit({ ...state, transform: rotateTransform(state.transform) }, 'Rotated 90°'); },
  flipH: () => { if (state) commit({ ...state, transform: { ...state.transform, flipH: !state.transform.flipH } }, 'Flipped horizontally'); },
  flipV: () => { if (state) commit({ ...state, transform: { ...state.transform, flipV: !state.transform.flipV } }, 'Flipped vertically'); },
  toggleCrop,
  toggleCompare,
  fit: () => { editor.fitToView(); updateToolbar(); },
  zoom100: () => { editor.setZoom(1); editor.queueRender(state); updateToolbar(); updateStatus(); },
  zoomBy: (mult) => { editor.zoomBy(mult); editor.queueRender(state); updateToolbar(); updateStatus(); },
  holdBefore,
  showShortcuts: () => shortcutsDialog.open(),
});

// --- Boot -----------------------------------------------------------------
toolbar.setEnabled(false);
updateStatus();
window.addEventListener('resize', () => { if (state) editor.queueRender(state); });

// Auto-load the first sample so the editor is never an empty grey box.
loadSample(SAMPLES[0].url, SAMPLES[0].name, loadNewImage, (m) => toast(m));
