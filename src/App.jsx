import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileText, AlertCircle, Keyboard } from 'lucide-react';

import { clamp, getPointerPos } from './utils';
import { useHistory } from './utils/history';
import { buildPdf } from './services/pdfExporter';

import AppHeader from './components/AppHeader';
import DocumentCanvas from './components/DocumentCanvas';
import FieldSection from './components/FieldSection';
import SignatureSection from './components/SignatureSection';
import ExportActions from './components/ExportActions';
import PageToolbar from './components/PageToolbar';
import WelcomePage from './components/WelcomePage';

const SIG_PREFIX = 'sig_';
const SNAP_THRESHOLD = 1.5;

const makeSignature = (page) => ({
  id: `${SIG_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  dataUrl: null,
  page,
  x: 50,
  y: 82,
  widthPct: 22,
});

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

  // Gestione Profilo Firmatario (con persistenza localStorage)
  const [signerInfo, setSignerInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('pdf_signer_info');
      return saved ? JSON.parse(saved) : { nome: '', cognome: '', cf: '', email: '' };
    } catch {
      return { nome: '', cognome: '', cf: '', email: '' };
    }
  });

  const handleSaveSignerInfo = (newInfo) => {
    setSignerInfo(newInfo);
    localStorage.setItem('pdf_signer_info', JSON.stringify(newInfo));
  };

  const [fields, setFields, undoFields, redoFields, canUndo, canRedo] = useHistory([
    {
      id: 'data',
      label: 'Data',
      page: 1,
      x: 10,
      y: 85,
      value: new Date().toISOString().slice(0, 10),
      fontSize: 10,
      bold: false,
      italic: false,
      underline: false,
      color: '#000000',
    },
  ]);

  const [newFieldName, setNewFieldName] = useState('');
  const [signatures, setSignatures] = useState([makeSignature(1)]);
  const [copiedElement, setCopiedElement] = useState(null);
  const [snapLines, setSnapLines] = useState({ x: null, y: null });

  const [savedSignatures, setSavedSignatures] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pdf_saved_signatures')) || [];
    } catch {
      return [];
    }
  });

  const [draggingId, setDraggingId] = useState(null);
  const [resizingId, setResizingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const pageRef = useRef(null);
  const [renderedPageWidth, setRenderedPageWidth] = useState(0);

  const PrivacyNotice = () => (
  <div className="bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 mb-4 shadow-sm">
    <span className="text-base flex-shrink-0">🔒</span>
    <p className="leading-snug">
      <strong>Privacy garantita:</strong> I dati del profilo e le firme sono salvati esclusivamente nella memoria locale del tuo browser (<code className="text-emerald-700 font-mono">localStorage</code>). Nessun dato viene inviato a server esterni.
    </p>
  </div>
);

  useEffect(() => {
    setIsDesktop(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    localStorage.setItem('pdf_saved_signatures', JSON.stringify(savedSignatures));
  }, [savedSignatures]);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setRenderedPageWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pageImages, currentPage]);

  /* Scorciatoie da tastiera completi */
  useEffect(() => {
    const onKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
      if (isInput) return;

      // 1. Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redoFields();
        else undoFields();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoFields();
        return;
      }

      // 2. Cancellazione con CANC o BACKSPACE
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        if (selectedId.startsWith(SIG_PREFIX)) {
          removeSignature(selectedId);
        } else {
          removeField(selectedId);
        }
        return;
      }

      // 3. Copia (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedId) {
        e.preventDefault();
        if (selectedId.startsWith(SIG_PREFIX)) {
          const sig = signatures.find((s) => s.id === selectedId);
          if (sig) setCopiedElement({ type: 'signature', data: sig });
        } else {
          const field = fields.find((f) => f.id === selectedId);
          if (field) setCopiedElement({ type: 'field', data: field });
        }
        return;
      }

      // 4. Incolla (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && copiedElement) {
        e.preventDefault();
        if (copiedElement.type === 'field') {
          const copy = {
            ...copiedElement.data,
            id: `f_${Date.now()}`,
            x: clamp(copiedElement.data.x + 3, 0, 100),
            y: clamp(copiedElement.data.y + 3, 0, 100),
          };
          setFields([...fields, copy]);
          setSelectedId(copy.id);
        } else if (copiedElement.type === 'signature') {
          const copy = {
            ...copiedElement.data,
            id: `${SIG_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            x: clamp(copiedElement.data.x + 3, 0, 100),
            y: clamp(copiedElement.data.y + 3, 0, 100),
          };
          setSignatures((prev) => [...prev, copy]);
          setSelectedId(copy.id);
        }
        return;
      }

      // 5. Spostamento con Frecce (Shift per spostamento veloce)
      if (!selectedId || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

      e.preventDefault();
      const step = e.shiftKey ? 1.5 : 0.2;
      const delta = { x: 0, y: 0 };
      if (e.key === 'ArrowUp') delta.y = -step;
      if (e.key === 'ArrowDown') delta.y = step;
      if (e.key === 'ArrowLeft') delta.x = -step;
      if (e.key === 'ArrowRight') delta.x = step;

      if (selectedId.startsWith(SIG_PREFIX)) {
        setSignatures((prev) =>
          prev.map((s) =>
            s.id === selectedId
              ? { ...s, x: clamp(s.x + delta.x, 0, 100), y: clamp(s.y + delta.y, 0, 100) }
              : s
          )
        );
      } else {
        setFields(
          fields.map((f) =>
            f.id === selectedId
              ? { ...f, x: clamp(f.x + delta.x, 0, 100), y: clamp(f.y + delta.y, 0, 100) }
              : f
          )
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, fields, signatures, copiedElement, undoFields, redoFields, setFields]);

  const currentPageSize = pageSizes[currentPage];

  /* Handlers PDF */
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

  /* Gestione Campi Testo */
  const addCustomField = (label, value = '') => {
    const id = `f_${Date.now()}`;
    const newField = {
      id,
      label,
      page: currentPage,
      x: 40,
      y: 50,
      value,
      fontSize: 10,
      bold: false,
      italic: false,
      underline: false,
      color: '#000000',
    };
    setFields([...fields, newField]);
    setSelectedId(id);
  };

  const handleAddField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    addCustomField(newFieldName.trim(), '');
    setNewFieldName('');
  };

  // Funzione per inserire rapidamente un campo prendendo dai dati profilo
  const addProfileField = (type) => {
    if (type === 'Nome') {
      const fullName = [signerInfo.nome, signerInfo.cognome].filter(Boolean).join(' ');
      addCustomField('Nome e Cognome', fullName);
    } else if (type === 'CF') {
      addCustomField('Codice Fiscale', signerInfo.cf || '');
    } else if (type === 'Email') {
      addCustomField('Email', signerInfo.email || '');
    }
  };

  const removeField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
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
    setFields([...fields, copy]);
    setSelectedId(copy.id);
  };

  const updateField = (id, key, val) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  };

  /* Dragging & Snapping */
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
      let x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      let y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

      let activeSnapX = null;
      let activeSnapY = null;

      fields.forEach((f) => {
        if (f.id === draggingId || f.page !== currentPage) return;
        if (Math.abs(f.x - x) < SNAP_THRESHOLD) {
          x = f.x;
          activeSnapX = f.x;
        }
        if (Math.abs(f.y - y) < SNAP_THRESHOLD) {
          y = f.y;
          activeSnapY = f.y;
        }
      });

      setSnapLines({ x: activeSnapX, y: activeSnapY });

      if (draggingId.startsWith(SIG_PREFIX)) {
        setSignatures((prev) => prev.map((s) => (s.id === draggingId ? { ...s, page: currentPage, x, y } : s)));
      } else {
        setFields(fields.map((f) => (f.id === draggingId ? { ...f, page: currentPage, x, y } : f)));
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
        setFields(fields.map((f) => (f.id === resizingId ? { ...f, widthPct: newWidthPct } : f)));
      }
    }
  };

  const handlePointerUp = () => {
    setDraggingId(null);
    setResizingId(null);
    setSnapLines({ x: null, y: null });
  };

  /* Gestione Firme */
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

  const saveSignatureToStorage = (dataUrl) => {
    if (!dataUrl || savedSignatures.includes(dataUrl)) return;
    setSavedSignatures((prev) => [...prev, dataUrl]);
  };

  const fontPxFor = (fontSizePt) => {
    if (!currentPageSize || !renderedPageWidth) return fontSizePt;
    return fontSizePt * (renderedPageWidth / currentPageSize.widthPt);
  };

  /* Export Handlers */
  const handleGeneratePDF = async () => {
    if (!pdfBytes) return;
    setErrorMessage('');
    setIsGenerating(true);
    try {
      await buildPdf({ pdfBytes, fields, signatures, pdfName });
    } catch (err) {
      console.error(err);
      setErrorMessage('Errore imprevisto durante la generazione del PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCurrentPageAsImage = () => {
    if (!pageRef.current) return;
    const img = pageRef.current.querySelector('img');
    if (!img) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // 1. Disegna la pagina PDF di sfondo
    ctx.drawImage(img, 0, 0);

    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;

    // 2. Disegna i campi di testo presenti nella pagina attuale
    fieldsOnPage.forEach((f) => {
      const x = f.x * scaleX;
      const y = f.y * scaleY;
      const fontSize = (f.fontSize || 10) * (canvas.width / (pageSizes[currentPage]?.widthPt || 595));

      let fontStyle = '';
      if (f.italic) fontStyle += 'italic ';
      if (f.bold) fontStyle += 'bold ';
      ctx.font = `${fontStyle}${fontSize}px sans-serif`;
      ctx.fillStyle = f.color || '#000000';
      ctx.textBaseline = 'top';

      ctx.fillText(f.value || f.label || '', x, y);

      if (f.underline) {
        const textMetrics = ctx.measureText(f.value || f.label || '');
        ctx.beginPath();
        ctx.moveTo(x, y + fontSize);
        ctx.lineTo(x + textMetrics.width, y + fontSize);
        ctx.strokeStyle = f.color || '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // 3. Disegna le firme presenti nella pagina attuale
    const sigPromises = signaturesOnPage.map((s) => {
      return new Promise((resolve) => {
        if (!s.dataUrl) return resolve();
        const sigImg = new Image();
        sigImg.crossOrigin = 'anonymous';
        sigImg.onload = () => {
          const x = s.x * scaleX;
          const y = s.y * scaleY;
          const width = (s.widthPct || 22) * scaleX;
          const height = width * (sigImg.naturalHeight / sigImg.naturalWidth);
          ctx.drawImage(sigImg, x, y, width, height);
          resolve();
        };
        sigImg.onerror = () => resolve();
        sigImg.src = s.dataUrl;
      });
    });

    // Attende il caricamento di tutte le immagini firma prima di avviare il download
    Promise.all(sigPromises).then(() => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `pagina_${currentPage}_${pdfName || 'documento'}.png`;
      link.click();
    });
  };

  const fieldsOnPage = fields.filter((f) => f.page === currentPage);
  const signaturesOnPage = signatures.filter((s) => s.page === currentPage);

  return (
    <div
      className="min-h-screen bg-slate-50 p-3 sm:p-6 max-w-7xl mx-auto font-sans pb-16 text-slate-800"
      onClick={() => setSelectedId(null)}
    >
      <AppHeader
        pdfBytes={pdfBytes}
        undoFields={undoFields}
        redoFields={redoFields}
        canUndo={canUndo}
        canRedo={canRedo}
        signerInfo={signerInfo}
        onSaveSignerInfo={handleSaveSignerInfo}
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="flex-shrink-0" size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {!pdfBytes ? (
        <WelcomePage onFileUpload={handleFileUpload} isLoading={isLoadingPdf} />
      ) : (
        <>
        {/* Mostra il banner Privacy solo quando l'utente sta lavorando su un PDF */}
        <PrivacyNotice />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="text-indigo-600 flex-shrink-0" size={18} />
                <span className="text-xs font-semibold text-slate-700 truncate">{pdfName}</span>
              </div>
              <button
                onClick={resetDocument}
                className="text-xs font-medium text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Carica un nuovo file PDF"
              >
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

            {isDesktop && (
              <div className="bg-indigo-50/90 border border-indigo-200 text-indigo-950 px-3.5 py-2.5 rounded-xl text-xs flex items-start gap-2.5 shadow-sm">
                <Keyboard className="text-indigo-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="space-y-0.5">
                  <p className="font-semibold text-indigo-900">Scorciatoie da tastiera:</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-indigo-800">
                    <span><strong>Frecce:</strong> Sposta l'elemento</span>
                    <span><strong>Shift + Frecce:</strong> Spostamento rapido</span>
                    <span><strong>Ctrl+C / Ctrl+V:</strong> Copia e Incolla</span>
                    <span><strong>Canc / Backspace:</strong> Elimina selezionato</span>
                    <span><strong>Ctrl+Z / Ctrl+Y:</strong> Annulla / Ripristina</span>
                  </div>
                </div>
              </div>
            )}

            <DocumentCanvas
              pageRef={pageRef}
              zoomLevel={zoomLevel}
              currentPage={currentPage}
              pageImages={pageImages}
              snapLines={snapLines}
              fieldsOnPage={fieldsOnPage}
              signaturesOnPage={signaturesOnPage}
              selectedId={selectedId}
              draggingId={draggingId}
              fontPxFor={fontPxFor}
              handlePointerMove={handlePointerMove}
              handlePointerUp={handlePointerUp}
              handlePointerDown={handlePointerDown}
              handleResizeStart={handleResizeStart}
            />
          </div>

          <div className="lg:col-span-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <FieldSection
              fields={fields}
              numPages={numPages}
              newFieldName={newFieldName}
              selectedId={selectedId}
              profiles={signerInfo}
              setNewFieldName={setNewFieldName}
              handleAddField={handleAddField}
              setSelectedId={setSelectedId}
              updateField={updateField}
              removeField={removeField}
              duplicateField={duplicateField}
            />

            <SignatureSection
              signatures={signatures}
              savedSignatures={savedSignatures}
              numPages={numPages}
              selectedId={selectedId}
              addSignature={addSignature}
              setSelectedId={setSelectedId}
              updateSignature={updateSignature}
              saveSignatureToStorage={saveSignatureToStorage}
              removeSignature={removeSignature}
              duplicateSignature={duplicateSignature}
              onSelectRecentSignature={(sigUrl) => {
                const newSig = makeSignature(currentPage);
                newSig.dataUrl = sigUrl;
                setSignatures((prev) => [...prev, newSig]);
              }}
            />

            <ExportActions
              isGenerating={isGenerating}
              onGeneratePdf={handleGeneratePDF}
              onExportImage={exportCurrentPageAsImage}
            />
          </div>
        </div>
      </>)}
    </div>
  );
}