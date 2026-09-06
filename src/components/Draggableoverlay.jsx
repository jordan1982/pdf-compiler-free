import React from 'react';
import { Move } from 'lucide-react';

export default function DraggableOverlay({ 
  id, xPct, yPct, widthPct, heightPct, selected, dragging, onPointerDown, onResizeStart, style, children, className = '' 
}) {
  return (
    <div
      onMouseDown={(e) => onPointerDown(id, e)}
      onTouchStart={(e) => onPointerDown(id, e)}
      style={{
        top: `${yPct}%`,
        left: `${xPct}%`,
        width: widthPct != null ? `${widthPct}%` : 'auto',
        height: heightPct != null ? `${heightPct}%` : 'auto',
        touchAction: 'none',
        ...style,
      }}
      className={`absolute cursor-move select-none transition-colors ${
        dragging
          ? 'ring-2 ring-amber-400 bg-amber-50/95 border-2 border-dashed border-amber-500 z-30 shadow-lg'
          : selected
          ? 'ring-2 ring-indigo-400 bg-indigo-50/90 border-2 border-indigo-600 z-30 shadow-md'
          : 'bg-white/85 border border-slate-400 hover:border-slate-600 z-10'
      } rounded ${className}`}
    >
      {/* Maniglia Touch/Mouse per lo spostamento visibile quando selezionato o trascinato */}
      {(selected || dragging) && (
        <div 
          className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md z-40 touch-none cursor-grab active:cursor-grabbing"
          title="Trascina da qui"
        >
          <Move size={12} />
        </div>
      )}

      {children}

      {/* Maniglia di ridimensionamento in basso a destra */}
      {selected && onResizeStart && (
        <div
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(id, e); }}
          onTouchStart={(e) => { e.stopPropagation(); onResizeStart(id, e); }}
          className="absolute -bottom-2 -right-2 w-5 h-5 bg-indigo-600 border-2 border-white rounded-full cursor-se-resize z-40 shadow-md touch-none"
          title="Ridimensiona"
        />
      )}
    </div>
  );
}