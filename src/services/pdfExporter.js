import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { CAP_HEIGHT_RATIO } from '../utils';

const hexToRgb = (hex) => {
  const cleanHex = (hex || '#000000').replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
};

function normalizeRotation(page) {
  const angle = page.getRotation().angle || 0;
  const normalized = ((angle % 360) + 360) % 360;
  return [0, 90, 180, 270].includes(normalized) ? normalized : 0;
}

function getPageBox(page) {
  const box = page.getCropBox() || page.getMediaBox();
  return {
    left: box.x,
    bottom: box.y,
    width: box.width,
    height: box.height,
    right: box.x + box.width,
    top: box.y + box.height,
  };
}

function getVisualPageSize(box, rotation) {
  return rotation === 90 || rotation === 270
    ? { visualWidth: box.height, visualHeight: box.width }
    : { visualWidth: box.width, visualHeight: box.height };
}

/**
 * Mappa una coordinata dallo spazio VISIVO (0,0 in Top-Left, Y verso il basso)
 * allo spazio NATIVO PDF del MediaBox/CropBox (Y verso l'alto).
 */
function visualPointToRaw(xVisual, yVisual, box, rotation) {
  switch (rotation) {
    case 90:
      return {
        x: box.left + yVisual,
        y: box.bottom + xVisual,
      };
    case 180:
      return {
        x: box.right - xVisual,
        y: box.bottom + yVisual,
      };
    case 270:
      return {
        x: box.right - yVisual,
        y: box.top - xVisual,
      };
    default:
      return {
        x: box.left + xVisual,
        y: box.top - yVisual,
      };
  }
}

export const buildPdf = async ({ pdfBytes, fields, signatures, pdfName }) => {
  if (!pdfBytes) throw new Error('Nessun documento PDF valido caricato.');

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const fontCache = {};

  const getFont = async (bold, italic) => {
    let type = StandardFonts.Helvetica;
    if (bold && italic) type = StandardFonts.HelveticaBoldOblique;
    else if (bold) type = StandardFonts.HelveticaBold;
    else if (italic) type = StandardFonts.HelveticaOblique;

    if (!fontCache[type]) {
      fontCache[type] = await pdfDoc.embedFont(type);
    }
    return fontCache[type];
  };

  // 1. Rendering Campi di Testo
  for (const field of fields) {
    if (!field.value) continue;
    const page = pages[field.page - 1];
    if (!page) continue;

    const box = getPageBox(page);
    const rotation = normalizeRotation(page);
    const { visualWidth, visualHeight } = getVisualPageSize(box, rotation);
    const rotateOpt = rotation ? { rotate: degrees(rotation) } : {};

    const fontSize = Number(field.fontSize) || 10;
    const font = await getFont(field.bold, field.italic);
    const textColor = hexToRgb(field.color);

    const xVisual = (field.x / 100) * visualWidth;
    const topYVisual = (field.y / 100) * visualHeight;
    const baselineYVisual = topYVisual + fontSize * CAP_HEIGHT_RATIO;

    const { x, y } = visualPointToRaw(xVisual, baselineYVisual, box, rotation);

    page.drawText(String(field.value), {
      x,
      y,
      size: fontSize,
      font,
      color: textColor,
      ...rotateOpt,
    });

    if (field.underline) {
      const textWidthVisual = font.widthOfTextAtSize(String(field.value), fontSize);
      const thickness = Math.max(0.5, fontSize * 0.06);
      const underlineYVisual = baselineYVisual + fontSize * 0.12;

      const { x: ux, y: uy } = visualPointToRaw(xVisual, underlineYVisual, box, rotation);

      page.drawRectangle({
        x: ux,
        y: uy,
        width: textWidthVisual,
        height: thickness,
        color: textColor,
        ...rotateOpt,
      });
    }
  }

// 2. Rendering Firme e Timbri
  for (const sig of signatures) {
    if (!sig.dataUrl) continue;
    const page = pages[sig.page - 1];
    if (!page) continue;

    const box = getPageBox(page);
    const rotation = normalizeRotation(page);
    const { visualWidth, visualHeight } = getVisualPageSize(box, rotation);

    const bytes = await fetch(sig.dataUrl).then((r) => r.arrayBuffer());
    const isPng = sig.dataUrl.startsWith('data:image/png');
    const image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

    const widthPtVisual = (sig.widthPct / 100) * visualWidth;
    const heightPtVisual = widthPtVisual * (image.height / image.width);

    const xVisual = (sig.x / 100) * visualWidth;
    const yVisual = (sig.y / 100) * visualHeight;

    let drawX, drawY;

    // Compensazione esatta per geometria di pagina e perno di rotazione pdf-lib
    switch (rotation) {
      case 90:
        drawX = box.left + yVisual + heightPtVisual;
        drawY = box.bottom + xVisual;
        break;
      case 180:
        drawX = box.right - xVisual;
        drawY = box.bottom + yVisual + heightPtVisual;
        break;
      case 270:
        drawX = box.right - yVisual - heightPtVisual;
        drawY = box.top - xVisual;
        break;
      default: // 0°
        drawX = box.left + xVisual;
        drawY = box.top - yVisual - heightPtVisual;
        break;
    }

    const options = {
      x: drawX,
      y: drawY,
      width: widthPtVisual,
      height: heightPtVisual,
    };

    if (rotation) {
      options.rotate = degrees(rotation);
    }

    page.drawImage(image, options);
  }

  const outBytes = await pdfDoc.save();
  const blob = new Blob([outBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `compilato_${pdfName || 'documento.pdf'}`;
  link.click();
  URL.revokeObjectURL(link.href);
};