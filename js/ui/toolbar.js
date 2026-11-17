// Toolbar — top bar actions: undo/redo, rotate/flip, crop, zoom, compare,
// reset, and export. Each button is wired once here and calls back into main.
export function buildToolbar(els, actions) {
  const {
    undoBtn, redoBtn, rotateBtn, flipHBtn, flipVBtn, cropBtn,
    zoomOutBtn, zoomInBtn, zoomLabel, fitBtn, compareBtn, resetBtn, exportBtn,
  } = els;

  undoBtn.addEventListener('click', actions.undo);
  redoBtn.addEventListener('click', actions.redo);
  rotateBtn.addEventListener('click', actions.rotate);
  flipHBtn.addEventListener('click', actions.flipH);
  flipVBtn.addEventListener('click', actions.flipV);
  cropBtn.addEventListener('click', actions.toggleCrop);
  zoomOutBtn.addEventListener('click', () => actions.zoomBy(1 / 1.25));
  zoomInBtn.addEventListener('click', () => actions.zoomBy(1.25));
  fitBtn.addEventListener('click', actions.fit);
  compareBtn.addEventListener('click', actions.toggleCompare);
  resetBtn.addEventListener('click', actions.reset);
  exportBtn.addEventListener('click', actions.openExport);

  return {
    setUndoRedo(canUndo, canRedo) {
      undoBtn.disabled = !canUndo;
      redoBtn.disabled = !canRedo;
    },
    setZoomLabel(percent) { zoomLabel.textContent = `${percent}%`; },
    setCropActive(active) {
      cropBtn.classList.toggle('active', active);
      cropBtn.setAttribute('aria-pressed', String(active));
    },
    setCompareActive(active) {
      compareBtn.classList.toggle('active', active);
      compareBtn.setAttribute('aria-pressed', String(active));
    },
    setEnabled(enabled) {
      for (const btn of [undoBtn, redoBtn, rotateBtn, flipHBtn, flipVBtn, cropBtn, zoomOutBtn, zoomInBtn, fitBtn, compareBtn, resetBtn, exportBtn]) {
        btn.disabled = !enabled && btn !== undoBtn && btn !== redoBtn;
      }
      if (!enabled) { undoBtn.disabled = true; redoBtn.disabled = true; }
    },
  };
}
