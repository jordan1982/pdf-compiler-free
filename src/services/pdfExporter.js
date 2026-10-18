import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { CAP_HEIGHT_RATIO } from '../utils';

const hexToRgb = (hex) => {
  const cleanHex = (hex || '#FFFFFF').replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
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

function visualPointToRaw(xVisual, yVisual, box, rotation) {
  switch (rotation) {
    case 90:
      return { x: box.left + yVisual, y: box.bottom + xVisual };
    case 180:
      return { x: box.right - xVisual, y: box.bottom + yVisual };
    case 270:
      return { x: box.right - yVisual, y: box.top - xVisual };
    default:
      return { x: box.left + xVisual, y: box.top - yVisual };
  }
}

export const buildPdf = async ({ pdfBytes, fields, signatures, redactions = [], pdfName }) => {
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

  // 1. Rendering Rettangoli di Copertura (100% Opachi e disposti sotto i testi)
  for (const red of redactions) {
    const page = pages[red.page - 1];
    if (!page) continue;

    const box = getPageBox(page);
    const rotation = normalizeRotation(page);
    const { visualWidth, visualHeight } = getVisualPageSize(box, rotation);

    const xVisual = (red.x / 100) * visualWidth;
    const yVisual = (red.y / 100) * visualHeight;
    const wVisual = ((red.widthPct || 15) / 100) * visualWidth;
    const hVisual = ((red.heightPct || 5) / 100) * visualHeight;

    let drawX, drawY;

    switch (rotation) {
      case 90:
        drawX = box.left + yVisual;
        drawY = box.bottom + xVisual;
        break;
      case 180:
        drawX = box.right - xVisual - wVisual;
        drawY = box.bottom + yVisual;
        break;
      case 270:
        drawX = box.right - yVisual - hVisual;
        drawY = box.top - xVisual - wVisual;
        break;
      default: // 0°
        drawX = box.left + xVisual;
        drawY = box.top - yVisual - hVisual;
        break;
    }

    const rectColor = hexToRgb(red.color || '#FFFFFF');

    page.drawRectangle({
      x: drawX,
      y: drawY,
      width: wVisual,
      height: hVisual,
      color: rectColor,
      borderColor: rectColor,
      borderWidth: 0.5,
      opacity: 1,
      rotate: rotation ? degrees(rotation) : undefined,
    });
  }

  // 2. Rendering Campi di Testo (Allineamento Millimetrico per X e Marcatura)
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

    // COMPENSAZIONE ALLINEAMENTO MATEMATICO:
    // +0.25 pt su X per annullare il padding di React
    // CapHeight * 0.78 su Y per portare il top-box esattamente alla baseline PDF
    const calibratedX = xVisual + 0.25;
    const capRatio = CAP_HEIGHT_RATIO || 0.7;
    const baselineYVisual = topYVisual + (fontSize * capRatio);

    const { x, y } = visualPointToRaw(calibratedX, baselineYVisual, box, rotation);

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

      const { x: ux, y: uy } = visualPointToRaw(calibratedX, underlineYVisual, box, rotation);

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

  // 3. Rendering Firme e Timbri
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