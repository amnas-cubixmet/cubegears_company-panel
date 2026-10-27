/**
 * Convert any browser-decodable local image to a safe document logo.
 * File picker has no displayed file-size restriction: optimize locally before
 * uploading, retaining transparency via WebP where the browser supports it.
 * The server still checks the bounded, optimized image it receives.
 */
const MAX_LOGO_BYTES = 250 * 1024;
const MAX_LOGO_EDGE = 2048;

const readImage = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  const dispose = () => URL.revokeObjectURL(url);
  image.onload = () => {
    dispose();
    if (!image.naturalWidth || !image.naturalHeight) {
      reject(new Error('Unable to read the selected image.'));
      return;
    }
    resolve(image);
  };
  image.onerror = () => {
    dispose();
    reject(new Error('Unable to read the selected image.'));
  };
  image.src = url;
});

const encodeCanvas = (canvas, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Unable to prepare this image.'));
      return;
    }
    resolve(blob);
  }, 'image/webp', quality);
});

const blobAsDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to prepare this image.'));
  reader.readAsDataURL(blob);
});

export async function optimizeDocumentLogo(file) {
  if (!file) throw new Error('Choose a logo image.');
  const image = await readImage(file);
  const originalWidth = image.naturalWidth;
  const originalHeight = image.naturalHeight;
  const scale = Math.min(1, MAX_LOGO_EDGE / originalWidth, MAX_LOGO_EDGE / originalHeight);
  let width = Math.max(1, Math.round(originalWidth * scale));
  let height = Math.max(1, Math.round(originalHeight * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to prepare this image.');

  // Reduce dimensions as needed rather than rejecting an otherwise valid image.
  for (let step = 0; step < 16; step += 1) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    for (const quality of [0.86, 0.7, 0.55, 0.4, 0.28]) {
      const blob = await encodeCanvas(canvas, quality);
      if (blob.size > MAX_LOGO_BYTES) continue;
      if (!['image/webp', 'image/png', 'image/jpeg'].includes(blob.type)) continue;
      return blobAsDataUrl(blob);
    }
    if (width === 1 && height === 1) break;
    width = Math.max(1, Math.round(width * 0.76));
    height = Math.max(1, Math.round(height * 0.76));
  }
  throw new Error('Unable to prepare this image. Please choose another image.');
}
