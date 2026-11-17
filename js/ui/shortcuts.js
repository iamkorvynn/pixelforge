// Keyboard shortcuts — one place for every shortcut in the app.
// Shortcuts are ignored while the user is typing in an input/textarea.
export const SHORTCUTS = [
  { keys: 'Ctrl/⌘ + Z', action: 'Undo' },
  { keys: 'Ctrl/⌘ + Shift + Z / Ctrl + Y', action: 'Redo' },
  { keys: 'Ctrl/⌘ + O', action: 'Open image' },
  { keys: 'Ctrl/⌘ + S', action: 'Export image' },
  { keys: 'Ctrl/⌘ + E', action: 'Export image' },
  { keys: 'R', action: 'Rotate 90°' },
  { keys: 'H', action: 'Flip horizontal' },
  { keys: 'V', action: 'Flip vertical' },
  { keys: 'C', action: 'Toggle crop mode' },
  { keys: 'B (hold)', action: 'Hold to see the original (before)' },
  { keys: 'A', action: 'Toggle before/after split slider' },
  { keys: 'F', action: 'Fit image to view' },
  { keys: '0', action: 'Zoom to 100%' },
  { keys: '+ / -', action: 'Zoom in / out' },
  { keys: 'Ctrl/⌘ + 0', action: 'Reset all edits' },
  { keys: '?', action: 'Show this shortcut list' },
];

export function setupShortcuts(actions) {
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    if (mod && key === 'z' && !e.shiftKey) { e.preventDefault(); actions.undo(); return; }
    if ((mod && key === 'y') || (mod && e.shiftKey && key === 'z')) { e.preventDefault(); actions.redo(); return; }
    if (mod && key === 'o') { e.preventDefault(); actions.open(); return; }
    if (mod && (key === 's' || key === 'e')) { e.preventDefault(); actions.openExport(); return; }
    if (mod && key === '0') { e.preventDefault(); actions.reset(); return; }
    if (mod) return;

    if (key === 'r') actions.rotate();
    else if (key === 'h') actions.flipH();
    else if (key === 'v') actions.flipV();
    else if (key === 'c') actions.toggleCrop();
    else if (key === 'a') actions.toggleCompare();
    else if (key === 'f') actions.fit();
    else if (key === '0') actions.zoom100();
    else if (key === '+' || key === '=') actions.zoomBy(1.25);
    else if (key === '-' || key === '_') actions.zoomBy(1 / 1.25);
    else if (key === '?') actions.showShortcuts();
    else if (key === 'b') actions.holdBefore(true);
  });
  document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'b') actions.holdBefore(false);
  });
}
