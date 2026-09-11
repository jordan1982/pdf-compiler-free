import React from 'react';
import FieldOverlay from './FieldOverlay';
import SignatureOverlay from './SignatureOverlay';

export default function DocumentCanvas({
  pageRef,
  zoomLevel,
  currentPage,
  pageImages,
  snapLines,
  fieldsOnPage,
  signaturesOnPage,
  selectedId,
  draggingId,
  fontPxFor,
  handlePointerMove,
  handlePointerUp,
  handlePointerDown,
  handleResizeStart,
}) {
  if (!pageImages[currentPage]) return null;

  return (
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
        <img
          src={pageImages[currentPage]}
          alt={`Pagina ${currentPage}`}
          className="w-full h-auto block pointer-events-none select-none"
          draggable={false}
        />

        {/* Linee Guida Snapping */}
        {snapLines.x !== null && (
          <div
            className="absolute top-0 bottom-0 border-l border-dashed border-indigo-500 z-30 pointer-events-none"
            style={{ left: `${snapLines.x}%` }}
          />
        )}
        {snapLines.y !== null && (
          <div
            className="absolute left-0 right-0 border-t border-dashed border-indigo-500 z-30 pointer-events-none"
            style={{ top: `${snapLines.y}%` }}
          />
        )}

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
  );
}