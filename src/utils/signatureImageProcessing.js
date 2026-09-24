// Turns an uploaded signature image into something that looks like a clean
// scan: dark ink on a fully transparent background, regardless of the
// paper shade, shadows or lighting in the original photo.
//
// If the uploaded image already has real transparency (e.g. it's already a
// clean digital signature export), processing is skipped and the image is
// used as-is.

const MAX_DIMENSION = 1400; // cap resolution so processing stays fast
const BG_SAMPLE_STEP = 4 * 7; // sample every 7th pixel when checking for existing transparency

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Impossibile leggere il file immagine.'));
    img.src = src;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Impossibile leggere il file.'));
    reader.readAsDataURL(file);
  });
}

function hasRealTransparency(imageData) {
  const { data } = imageData;
  let sampled = 0;
  let transparent = 0;
  for (let i = 3; i < data.length; i += BG_SAMPLE_STEP) {
    sampled++;
    if (data[i] < 250) transparent++;
  }
  return sampled > 0 && transparent / sampled > 0.02;
}

// Separable box blur over a single-channel grid. Used to estimate the
// local background brightness (paper shade / shadow) around each pixel,
// which a single global threshold can't account for.
function boxBlur(src, width, height, radius) {
  if (radius < 1) return src.slice();
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const windowSize = radius * 2 + 1;

  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    let acc = 0;
    for (let x = -radius; x <= radius; x++) {
      acc += src[rowStart + Math.min(width - 1, Math.max(0, x))];
    }
    for (let x = 0; x < width; x++) {
      tmp[rowStart + x] = acc / windowSize;
      const xOut = Math.min(width - 1, Math.max(0, x - radius));
      const xIn = Math.min(width - 1, Math.max(0, x + radius + 1));
      acc += src[rowStart + xIn] - src[rowStart + xOut];
    }
  }

  for (let x = 0; x < width; x++) {
    let acc = 0;
    for (let y = -radius; y <= radius; y++) {
      acc += tmp[Math.min(height - 1, Math.max(0, y)) * width + x];
    }
    for (let y = 0; y < height; y++) {
      out[y * width + x] = acc / windowSize;
      const yOut = Math.min(height - 1, Math.max(0, y - radius));
      const yIn = Math.min(height - 1, Math.max(0, y + radius + 1));
      acc += tmp[yIn * width + x] - tmp[yOut * width + x];
    }
  }
  return out;
}

// Crops the canvas down to the bounding box of its non-transparent pixels
// (plus a small margin), so an upload with lots of empty paper around a
// small signature doesn't get placed tiny on the page.
function trimTransparentEdges(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  const ALPHA_THRESHOLD = 10;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      if (data[(rowOffset + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return canvas; // nothing found, leave as-is

  const padX = Math.round((maxX - minX) * 0.06) + 6;
  const padY = Math.round((maxY - minY) * 0.06) + 6;
  minX = Math.max(0, minX - padX);
  minY = Math.max(0, minY - padY);
  maxX = Math.min(width - 1, maxX + padX);
  maxY = Math.min(height - 1, maxY + padY);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = maxX - minX + 1;
  outCanvas.height = maxY - minY + 1;
  outCanvas
    .getContext('2d')
    .drawImage(canvas, minX, minY, outCanvas.width, outCanvas.height, 0, 0, outCanvas.width, outCanvas.height);
  return outCanvas;
}

/**
 * @param {string|File} source  A data URL, or a File (e.g. from an <input type="file">).
 * @param {{ forceScanEffect?: boolean }} [options]  Set forceScanEffect to
 *   re-apply the scan effect even if the source already has transparency.
 * @returns {Promise<string>} a PNG data URL
 */
export async function processSignatureImage(source, options = {}) {
  const dataUrl = source instanceof File ? await readFileAsDataUrl(source) : source;
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);

  if (hasRealTransparency(imageData) && !options.forceScanEffect) {
    // Already a clean signature (e.g. re-uploading a previous export) —
    // don't touch it, just trim any excess transparent margin.
    return trimTransparentEdges(canvas).toDataURL('image/png');
  }

  const { data } = imageData;
  const pixelCount = width * height;
  const gray = new Float32Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }

  // Large-radius blur approximates the paper's own shading/shadows, which
  // we then subtract out — an adaptive (per-area) threshold instead of one
  // fixed brightness cutoff for the whole photo.
  const radius = Math.max(8, Math.round(Math.min(width, height) / 12));
  const localBackground = boxBlur(gray, width, height, radius);

  const DARKNESS_OFFSET = 14; // how much darker than local bg counts as "ink"
  const EDGE_SOFTNESS = 22; // gray-level width of the anti-aliased edge

  const out = ctx.createImageData(width, height);
  for (let i = 0; i < pixelCount; i++) {
    const darkerThanBackgroundBy = localBackground[i] - DARKNESS_OFFSET - gray[i];
    let alpha = darkerThanBackgroundBy / EDGE_SOFTNESS;
    alpha = Math.max(0, Math.min(1, alpha));
    alpha = alpha * alpha * (3 - 2 * alpha); // smoothstep, softer stroke edges

    const o = i * 4;
    out.data[o] = 20;
    out.data[o + 1] = 20;
    out.data[o + 2] = 30; // near-black, slightly ink-blue
    out.data[o + 3] = Math.round(alpha * 255);
  }

  ctx.putImageData(out, 0, 0);
  return trimTransparentEdges(canvas).toDataURL('image/png');
}
