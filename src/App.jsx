import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { FileText, Download, AlertCircle, Plus, Keyboard, Info } from 'lucide-react';

import { clamp, getPointerPos, CAP_HEIGHT_RATIO } from './utils';
import PageToolbar from './components/PageToolbar';
import FieldOverlay from './components/Fieldoverlay';
import SignatureOverlay from './components/SignatureOverlay';
import SignatureSlot from './components/SignatureSlot';
import FieldRow from './components/Fieldrow';
import WelcomePage from './components/WelcomePage';

const SIG_PREFIX = 'sig_';
const makeSignature = (page) => ({
  id: `${SIG_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  dataUrl: null,
  page,
  x: 50,
  y: 82,
  widthPct: 22,
});

const hexToRgb = (hex) => {
  const cleanHex = (hex || '#000000').replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0;
  return rgb(r, g, b);
};

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function App() {
  const [pdfBytes, setPdfBytes] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImages, setPageImages] = useState({});
  const [pageSizes, setPageSizes] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(1.4);

  const [fields, setFields] = useState([
    { id: 'data', label: 'Data', page: 1, x: 10, y: 85, value: new Date().toISOString().slice(0, 10), fontSize: 10, bold: false, italic: false, underline: false, color: '#000000' },
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [signatures, setSignatures] = useState([makeSignature(1)]);

  const [draggingId, setDraggingId] = useState(null);
  const [resizingId, setResizingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const pageRef = useRef(null);
  const [renderedPageWidth, setRenderedPageWidth] = useState(0);

  useEffect(() => {
    // Rileva se il dispositivo supporta il puntatore di precisione (Mouse / Desktop)
    setIsDesktop(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setRenderedPageWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageImages, currentPage]);

  /* ---- Spostamento Tastiera ---- */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!selectedId) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      
      e.preventDefault();
      const step = e.shiftKey ? 1 : 0.2;
      const delta = { x: 0, y: 0 };
      if (e.key === 'ArrowUp') delta.y = -step;
      if (e.key === 'ArrowDown') delta.y = step;
      if (e.key === 'ArrowLeft') delta.x = -step;
      if (e.key === 'ArrowRight') delta.x = step;

      if (selectedId.startsWith(SIG_PREFIX)) {
        setSignatures((prev) =>
          prev.map((s) => (s.id === selectedId ? { ...s, x: clamp(s.x + delta.x, 0, 100), y: clamp(s.y + delta.y, 0, 100) } : s))
        );
      } else {
        setFields((prev) =>
          prev.map((f) => (f.id === selectedId ? { ...f, x: clamp(f.x + delta.x, 0, 100), y: clamp(f.y + delta.y, 0, 100) } : f))
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  const currentPageSize = pageSizes[currentPage];

  /* ---- Handlers PDF ---- */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    setErrorMessage('');
    setIsLoadingPdf(true);
    try {
      const buffer = await file.arrayBuffer();
      setPdfName(file.name);
      setPdfBytes(buffer);
      await renderAllPages(buffer);
    } catch (err) {
      console.error(err);
      setErrorMessage('Errore durante la lettura del PDF.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const renderAllPages = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
    setNumPages(pdf.numPages);

    const images = {};
    const sizes = {};
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const renderViewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
      images[i] = canvas.toDataURL();

      const baseViewport = page.getViewport({ scale: 1 });
      sizes[i] = { widthPt: baseViewport.width, heightPt: baseViewport.height };
    }
    setPageImages(images);
    setPageSizes(sizes);
    setCurrentPage(1);
  };

  const resetDocument = () => {
    setPdfBytes(null);
    setPdfName('');
    setPageImages({});
    setPageSizes({});
    setNumPages(0);
    setCurrentPage(1);
    setErrorMessage('');
  };

  /* ---- Handlers Campi ---- */
  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const id = `f_${Date.now()}`;
    setFields((prev) => [...prev, { id, label: newFieldName.trim(), page: currentPage, x: 40, y: 50, value: '', fontSize: 10, bold: false, italic: false, underline: false, color: '#000000' }]);
    setNewFieldName('');
    setSelectedId(id);
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateField = (id) => {
    const source = fields.find((f) => f.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: `f_${Date.now()}`,
      label: `${source.label} (copia)`,
      x: clamp(source.x + 3, 0, 100),
      y: clamp(source.y + 3, 0, 100),
    };
    setFields((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const updateField = (id, key, val) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  };

  /* ---- Dragging & Resizing ---- */
  const handlePointerDown = (id, e) => {
    e.stopPropagation();
    setDraggingId(id);
    setSelectedId(id);
  };

  const handleResizeStart = (id, e) => {
    e.stopPropagation();
    setResizingId(id);
    setSelectedId(id);
  };

  const handlePointerMove = (e) => {
    if (!pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const { x: clientX, y: clientY } = getPointerPos(e);
    if (clientX === undefined || clientY === undefined) return;

    if (draggingId) {
      e.preventDefault();
      const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

      if (draggingId.startsWith(SIG_PREFIX)) {
        setSignatures((prev) => prev.map((s) => (s.id === draggingId ? { ...s, page: currentPage, x, y } : s)));
      } else {
        setFields((prev) => prev.map((f) => (f.id === draggingId ? { ...f, page: currentPage, x, y } : f)));
      }
    } else if (resizingId) {
      e.preventDefault();
      if (resizingId.startsWith(SIG_PREFIX)) {
        const sig = signatures.find((s) => s.id === resizingId);
        if (!sig) return;
        const currentX = (sig.x / 100) * rect.width;
        const newWidthPx = clientX - (rect.left + currentX);
        const newWidthPct = clamp((newWidthPx / rect.width) * 100, 5, 80);
        setSignatures((prev) => prev.map((s) => (s.id === resizingId ? { ...s, widthPct: newWidthPct } : s)));
      } else {
        const field = fields.find((f) => f.id === resizingId);
        if (!field) return;
        const currentX = (field.x / 100) * rect.width;
        const newWidthPx = clientX - (rect.left + currentX);
        const newWidthPct = clamp((newWidthPx / rect.width) * 100, 5, 80);
        setFields((prev) => prev.map((f) => (f.id === resizingId ? { ...f, widthPct: newWidthPct } : f)));
      }
    }
  };

  const handlePointerUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  /* ---- Signatures ---- */
  const addSignature = () => {
    const sig = makeSignature(currentPage);
    setSignatures((prev) => [...prev, sig]);
    setSelectedId(sig.id);
  };

  const removeSignature = (id) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateSignature = (id) => {
    const source = signatures.find((s) => s.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: `${SIG_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      x: clamp(source.x + 6, 0, 100),
      y: clamp(source.y + 6, 0, 100),
    };
    setSignatures((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const updateSignature = (id, key, val) => {
    setSignatures((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  };

  const fontPxFor = (fontSizePt) => {
    if (!currentPageSize || !renderedPageWidth) return fontSizePt;
    return fontSizePt * (renderedPageWidth / currentPageSize.widthPt);
  };

  /* ---- Export PDF ---- */
  const generatePDF = async () => {
    if (!pdfBytes) return;
    setErrorMessage('');
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const fontCache = {};
      const getFont = async (bold, italic) => {
        let type = StandardFonts.Helvetica;
        if (bold && italic) type = StandardFonts.HelveticaBoldOblique;
        else if (bold) type = StandardFonts.HelveticaBold;
        else if (italic) type = StandardFonts.HelveticaOblique;
        if (!fontCache[type]) fontCache[type] = await pdfDoc.embedFont(type);
        return fontCache[type];
      };

      for (const field of fields) {
        if (!field.value) continue;
        const page = pages[field.page - 1];
        if (!page) continue;
        const { width, height } = page.getSize();
        const fontSize = Number(field.fontSize) || 10;
        const font = await getFont(field.bold, field.italic);
        const textColor = hexToRgb(field.color);

        const x = (field.x / 100) * width;
        const topY = height - (field.y / 100) * height;
        const baselineY = topY - fontSize * CAP_HEIGHT_RATIO;

        page.drawText(String(field.value), { x, y: baselineY, size: fontSize, font, color: textColor });

        if (field.underline) {
          const textWidth = font.widthOfTextAtSize(String(field.value), fontSize);
          page.drawLine({
            start: { x, y: baselineY - fontSize * 0.12 },
            end: { x: x + textWidth, y: baselineY - fontSize * 0.12 },
            thickness: Math.max(0.5, fontSize * 0.06),
            color: textColor,
          });
        }
      }

      for (const sig of signatures) {
        if (!sig.dataUrl) continue;
        const page = pages[sig.page - 1];
        if (!page) continue;
        const { width, height } = page.getSize();
        const bytes = await fetch(sig.dataUrl).then((r) => r.arrayBuffer());
        const isPng = sig.dataUrl.startsWith('data:image/png');
        const image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

        const widthPt = (sig.widthPct / 100) * width;
        const heightPt = widthPt * (image.height / image.width);
        const x = (sig.x / 100) * width;
        const y = height - (sig.y / 100) * height - heightPt;

        page.drawImage(image, { x, y, width: widthPt, height: heightPt });
      }

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `compilato_${pdfName || 'documento.pdf'}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      setErrorMessage('Errore imprevisto durante la generazione del PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const fieldsOnPage = fields.filter((f) => f.page === currentPage);
  const signaturesOnPage = signatures.filter((s) => s.page === currentPage);

  return (
    <div
      className="min-h-screen bg-slate-50 p-3 sm:p-6 max-w-7xl mx-auto font-sans pb-16 text-slate-800"
      onClick={() => setSelectedId(null)}
    >
      <header className="mb-6 text-center">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Compilatore &amp; Firmatario PDF</h1>
      </header>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="flex-shrink-0" size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {!pdfBytes ? (
        <WelcomePage onFileUpload={handleFileUpload} isLoading={isLoadingPdf} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="text-indigo-600 flex-shrink-0" size={18} />
                <span className="text-xs font-semibold text-slate-700 truncate">{pdfName}</span>
              </div>
              <button onClick={resetDocument} className="text-xs font-medium text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors" title="Carica un nuovo file PDF">
                Cambia file
              </button>
            </div>

            <PageToolbar
              currentPage={currentPage}
              numPages={numPages}
              zoomLevel={zoomLevel}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              onZoom={(d) => setZoomLevel((z) => clamp(z + d, 1, 2.5))}
            />

            {/* Banner Informativo Tasti Direzionali (Solo Desktop se un elemento è selezionato) */}
            {isDesktop && selectedId && (
              <div className="bg-indigo-50/80 border border-indigo-200 text-indigo-900 px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm animate-fade-in">
                <Keyboard className="text-indigo-600 flex-shrink-0" size={16} />
                <span>Usa le <strong>frecce della tastiera</strong> per spostare con precisione l'elemento selezionato (usa <strong>Shift + Freccia</strong> per spostamenti più veloci).</span>
              </div>
            )}

            {pageImages[currentPage] && (
              <div className="border border-slate-200 rounded-2xl overflow-auto shadow-inner bg-slate-200/60 h-[65vh] lg:h-[72vh] relative">
                <div
                  ref={pageRef}
                  onMouseMove={handlePointerMove}
                  onTouchMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchEnd={handlePointerUp}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: `${zoomLevel * 100}%` }}
                  className="relative bg-white cursor-default origin-top-left shadow-lg mx-auto"
                >
                  <img src={pageImages[currentPage]} alt={`Pagina ${currentPage}`} className="w-full h-auto block pointer-events-none select-none" draggable={false} />

                  {fieldsOnPage.map((field) => (
                    <FieldOverlay
                      key={field.id}
                      field={field}
                      fontPx={fontPxFor(field.fontSize || 10)}
                      selected={selectedId === field.id}
                      dragging={draggingId === field.id}
                      onPointerDown={handlePointerDown}
                      onResizeStart={handleResizeStart}
                    />
                  ))}

                  {signaturesOnPage.map((sig) => (
                    <SignatureOverlay
                      key={sig.id}
                      signature={sig}
                      selected={selectedId === sig.id}
                      dragging={draggingId === sig.id}
                      onPointerDown={handlePointerDown}
                      onResizeStart={handleResizeStart}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleAddField} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2">
              <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Aggiungi campo</span>
                <span className="text-[10px] text-slate-400 font-normal">Es. Codice Fiscale, Luogo</span>
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome campo"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors shadow-sm" title="Aggiungi nuovo campo di testo">
                  <Plus size={14} /> <span>Crea</span>
                </button>
              </div>
            </form>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 max-h-[36vh] overflow-y-auto">
              <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Campi e formattazione</h2>
              {fields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  numPages={numPages}
                  selected={selectedId === field.id}
                  onSelect={setSelectedId}
                  onUpdate={updateField}
                  onRemove={removeField}
                  onDuplicate={duplicateField}
                />
              ))}
              {fields.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Nessun campo. Aggiungine uno sopra.</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Firme</h2>
                <button
                  type="button"
                  onClick={addSignature}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  title="Aggiungi una nuova firma o timbro"
                >
                  <Plus size={14} /> Aggiungi firma
                </button>
              </div>
              {signatures.map((sig, i) => (
                <SignatureSlot
                  key={sig.id}
                  signature={sig}
                  index={i}
                  numPages={numPages}
                  selected={selectedId === sig.id}
                  onSelect={setSelectedId}
                  onUpdate={(key, val) => updateSignature(sig.id, key, val)}
                  onCapture={(dataUrl) => updateSignature(sig.id, 'dataUrl', dataUrl)}
                  onClear={() => updateSignature(sig.id, 'dataUrl', null)}
                  onRemove={() => removeSignature(sig.id)}
                  onDuplicate={() => duplicateSignature(sig.id)}
                  canRemove={signatures.length > 1}
                />
              ))}
            </div>

            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
              title="Scarica il PDF modificato sul tuo dispositivo"
            >
              <Download size={18} />
              <span>{isGenerating ? 'Generazione in corso…' : 'Genera e scarica PDF'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}