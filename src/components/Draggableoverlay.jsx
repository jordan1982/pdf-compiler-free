import React from 'react';

// Generic draggable overlay: position + selection chrome shared by
// text fields and the signature box, all in page-relative percentages.
export default function DraggableOverlay({ id, xPct, yPct, widthPct, selected, dragging, onPointerDown, style, children, className = '' }) {
  return (
    <div
      onMouseDown={(e) => onPointerDown(id, e)}
      onTouchStart={(e) => onPointerDown(id, e)}
      style={{
        top: `${yPct}%`,
        left: `${xPct}%`,
        width: widthPct != null ? `${widthPct}%` : undefined,
        touchAction: 'none',
        ...style,
      }}
      className={`absolute cursor-move select-none transition-colors ${
        dragging
          ? 'ring-2 ring-amber-400 bg-amber-50/90 border-2 border-dashed border-amber-500 z-30'
          : selected
          ? 'ring-2 ring-indigo-300 bg-indigo-50/90 border-2 border-indigo-600 z-30'
          : 'bg-white/85 border border-slate-400 hover:border-slate-600 z-10'
      } rounded ${className}`}
    >
      {children}
    </div>
  );
}