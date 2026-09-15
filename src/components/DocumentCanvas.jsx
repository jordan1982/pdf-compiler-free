import React, { useEffect, useRef } from 'react';
import FieldOverlay from './FieldOverlay';
import SignatureOverlay from './SignatureOverlay';

export default function DocumentCanvas({
  pageRef,
  zoomLevel,
  currentPage,
  numPages,
  viewMode = 'single',
  pageImages,
  snapLines,
  fields,
  signatures,
  selectedId,
  draggingId,
  fontPxFor,
  onPageChange,
  handlePointerMove,
  handlePointerUp,
  handlePointerDown,
  handleResizeStart,
}) {
  const containerRef = useRef(null);

  // Rilevamento automatico della pagina visibile in modalità continua
  useEffect(() => {
    if (viewMode !== 'continuous' || !containerRef.current || !onPageChange) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNum = Number(entry.target.getAttribute('data-page'));
            if (pageNum) onPageChange(pageNum);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    const elements = containerRef.current.querySelectorAll('[data-page]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [viewMode, pageImages, numPages, onPageChange]);

  if (!pageImages || Object.keys(pageImages).length === 0) return null;

  const pagesToRender = viewMode === 'single'
    ? [currentPage]
    : Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      className="border border-slate-200 rounded-2xl overflow-auto shadow-inner bg-slate-200/60 h-[65vh] lg:h-[72vh] relative p-4 space-y-6"
    >
      {pagesToRender.map((pageNum) => {
        const fieldsOnPage = fields.filter((f) => f.page === pageNum);
        const signaturesOnPage = signatures.filter((s) => s.page === pageNum);

        return (
          <div
            key={pageNum}
            data-page={pageNum}
            ref={pageNum === currentPage ? pageRef : null}
            onMouseMove={handlePointerMove}
            onTouchMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchEnd={handlePointerUp}
            onClick={(e) => {
              e.stopPropagation();
              if (onPageChange && pageNum !== currentPage) onPageChange(pageNum);
            }}
            style={{ width: `${zoomLevel * 100}%` }}
            className="relative bg-white cursor-default origin-top-left shadow-lg mx-auto rounded-sm transition-all duration-150"
          >
            <img
              src={pageImages[pageNum]}
              alt={`Pagina ${pageNum}`}
              className="w-full h-auto block pointer-events-none select-none"
              draggable={false}
            />

            {/* Indicatori Numero Pagina in Scorrimento Continuo */}
            {viewMode === 'continuous' && (
              <div className="absolute top-2 right-2 bg-slate-900/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md pointer-events-none backdrop-blur-sm z-20">
                Pagina {pageNum}
              </div>
            )}

            {/* Linee Guida Snapping (mostrate sulla pagina corrente) */}
            {pageNum === currentPage && snapLines.x !== null && (
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-indigo-500 z-30 pointer-events-none"
                style={{ left: `${snapLines.x}%` }}
              />
            )}
            {pageNum === currentPage && snapLines.y !== null && (
              <div
                className="absolute left-0 right-0 border-t border-dashed border-indigo-500 z-30 pointer-events-none"
                style={{ top: `${snapLines.y}%` }}
              />
            )}

            {/* Overlay Campi */}
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

            {/* Overlay Firme */}
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
        );
      })}
    </div>
  );
}