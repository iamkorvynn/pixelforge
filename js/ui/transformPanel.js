// Transform panel — the Straighten slider (-45°..+45°) for free rotation.
// Live-updates the angle while dragging; history is pushed on release.
export function buildTransformPanel(container, onAngle) {
  container.innerHTML = `
    <div class="slider-row">
      <div class="slider-head">
        <label for="straighten-slider">Straighten</label>
        <button class="slider-reset" type="button" id="straighten-reset" title="Reset straighten to 0°">×</button>
        <span class="slider-value" id="straighten-value">0°</span>
      </div>
      <input type="range" id="straighten-slider" min="-45" max="45" step="0.5" value="0" aria-label="Straighten angle">
    </div>
    <p class="recipe-hint">Rotate freely to level a horizon. 90° steps are on the toolbar (R).</p>`;
  const input = container.querySelector('#straighten-slider');
  const value = container.querySelector('#straighten-value');
  input.addEventListener('input', () => {
    value.textContent = `${Number(input.value)}°`;
    onAngle(Number(input.value), false);
  });
  input.addEventListener('change', () => onAngle(Number(input.value), true));
  container.querySelector('#straighten-reset').addEventListener('click', () => {
    input.value = 0;
    value.textContent = '0°';
    onAngle(0, true);
  });
  return {
    sync(angle) {
      input.value = angle;
      value.textContent = `${angle}°`;
    },
  };
}
