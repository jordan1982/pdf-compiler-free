import React from 'react';
import { Move } from 'lucide-react';

export default function DraggableOverlay({ 
  id, xPct, yPct, widthPct, heightPct, selected, dragging, onPointerDown, onResizeStart, style, children, className = '' 
}) {
  return (
    <div
      onPointerDown={(e) => onPointerDown(id, e)}
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
          ? 'ring-2 ring-amber-400 bg-amber-50/95 border border-dashed border-amber-500 z-30 shadow-lg'
          : selected
          ? 'ring-2 ring-indigo-400 border border-indigo-600 z-30 shadow-md'
          : 'hover:border hover:border-slate-400/80 z-10'
      } rounded-sm ${className}`}
    >
      {(selected || dragging) && (
        <div 
          className="absolute -top-3 -left-3 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md z-40 cursor-grab active:cursor-grabbing"
          title="Trascina"
        >
          <Move size={11} />
        </div>
      )}

      {children}

      {selected && onResizeStart && (
        <div
          onPointerDown={(e) => { e.stopPropagation(); onResizeStart(id, e); }}
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full cursor-se-resize z-40 shadow-md"
          title="Ridimensiona"
        />
      )}
    </div>
  );
}