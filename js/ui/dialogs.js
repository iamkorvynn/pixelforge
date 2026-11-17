// Dialogs — export dialog (format + quality + filename) and the shortcuts
// help dialog. Both use native <dialog> elements defined in index.html.
import { EXPORT_FORMATS, validateExportOptions, exportFilename } from '../core/export.js';

export function buildExportDialog(dialog, onExport) {
  const form = dialog.querySelector('form');
  const formatSelect = dialog.querySelector('#export-format');
  const qualityInput = dialog.querySelector('#export-quality');
  const qualityValue = dialog.querySelector('#export-quality-value');
  const scaleSelect = dialog.querySelector('#export-scale');
  const nameInput = dialog.querySelector('#export-name');

  scaleSelect.innerHTML = [
    ['0.25', 'Quarter size (0.25×)'],
    ['0.5', 'Half size (0.5×)'],
    ['1', 'Full size (1×)'],
    ['2', 'Double size (2×)'],
  ].map(([v, label]) => `<option value="${v}"${v === '1' ? ' selected' : ''}>${label}</option>`).join('');

  formatSelect.innerHTML = Object.entries(EXPORT_FORMATS)
    .map(([id, f]) => `<option value="${id}">${f.label}</option>`)
    .join('');

  const syncQuality = () => {
    qualityValue.textContent = `${Math.round(qualityInput.value * 100)}%`;
    const isPng = formatSelect.value === 'png';
    qualityInput.disabled = isPng;
    qualityInput.closest('.field').classList.toggle('muted', isPng);
  };
  formatSelect.addEventListener('change', syncQuality);
  qualityInput.addEventListener('input', syncQuality);
  syncQuality();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const options = validateExportOptions({ format: formatSelect.value, quality: Number(qualityInput.value), scale: Number(scaleSelect.value) });
      const filename = exportFilename(nameInput.value, options.format);
      onExport({ ...options, filename });
      dialog.close();
    } catch (err) {
      dialog.querySelector('.dialog-error').textContent = err.message;
    }
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  return {
    open(defaultName) {
      if (defaultName) nameInput.value = defaultName;
      dialog.querySelector('.dialog-error').textContent = '';
      dialog.showModal();
    },
  };
}

export function buildShortcutsDialog(dialog) {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  return {
    open() { dialog.showModal(); },
  };
}
