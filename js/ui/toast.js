// Toast — small transient status messages (bottom centre).
export function toast(message, ms = 2600) {
  let el = document.querySelector('.pf-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'pf-toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), ms);
}
