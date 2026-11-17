// Upload — file input, drag & drop, paste, and bundled sample photos.
export function setupUpload({ fileInput, dropZone, onLoad, onError }) {
  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      onError('That file is not an image. Try a PNG, JPEG or WebP.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => onLoad(img, file.name);
      img.onerror = () => onError('Could not read that image file.');
      img.src = reader.result;
    };
    reader.onerror = () => onError('Could not read that file.');
    reader.readAsDataURL(file);
  };

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) readFile(fileInput.files[0]);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) => dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.add('dragging');
  }));
  ['dragleave', 'drop'].forEach((evt) => dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragging');
  }));
  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
  });

  // Paste an image straight from the clipboard.
  document.addEventListener('paste', (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
    if (item) readFile(item.getAsFile());
  });

  return { readFile };
}

// Load a bundled sample photo by URL.
export function loadSample(url, name, onLoad, onError) {
  const img = new Image();
  img.onload = () => onLoad(img, name);
  img.onerror = () => onError(`Could not load sample image: ${name}`);
  img.src = url;
}
