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
  redactions = [],
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
      { root: containerRef.current, threshold: 0.5 }
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
      className="border border-slate-200 rounded-2xl overflow-auto shadow-inner bg-slate-200/60 h-[65vh] lg:h-[72vh] relative p-4 space-y-6 select-none"
    >
      {pagesToRender.map((pageNum) => {
        const fieldsOnPage = fields.filter((f) => f.page === pageNum);
        const signaturesOnPage = signatures.filter((s) => s.page === pageNum);
        const redactionsOnPage = redactions.filter((r) => r.page === pageNum);

        return (
          <div
            key={pageNum}
            data-page={pageNum}
            ref={pageNum === currentPage ? pageRef : null}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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

            {viewMode === 'continuous' && (
              <div className="absolute top-2 right-2 bg-slate-900/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md pointer-events-none backdrop-blur-sm z-20">
                Pagina {pageNum}
              </div>
            )}

            {/* Linee Guida Snapping */}
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

            {/* Overlay Rettangoli di Copertura (disegnati sotto i testi e le firme) */}
            {redactionsOnPage.map((red) => {
              const isSelected = selectedId === red.id;
              const isDragging = draggingId === red.id;

              return (
                <div
                  key={red.id}
                  onPointerDown={(e) => handlePointerDown(red.id, e)}
                  style={{
                    left: `${red.x}%`,
                    top: `${red.y}%`,
                    width: `${red.widthPct || 15}%`,
                    height: `${red.heightPct || 5}%`,
                    backgroundColor: red.color || '#FFFFFF',
                  }}
                  className={`absolute rounded-sm border cursor-move z-10 transition-shadow ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-md'
                      : 'border-slate-300/80 hover:border-slate-400'
                  } ${isDragging ? 'opacity-80' : ''}`}
                >
                  {/* Handle Ridimensionamento in basso a destra */}
                  {isSelected && (
                    <div
                      onPointerDown={(e) => handleResizeStart(red.id, e)}
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-600 rounded-full border-2 border-white cursor-se-resize shadow-md"
                    />
                  )}
                </div>
              );
            })}

            {/* Overlay Campi Testo */}
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