import React from 'react';
import { Edit3 } from 'lucide-react';
import DraggableOverlay from './Draggableoverlay';

export default function SignatureOverlay({ signature, selected, dragging, onPointerDown }) {
  return (
    <DraggableOverlay
      id={signature.id}
      xPct={signature.x}
      yPct={signature.y}
      widthPct={signature.widthPct}
      selected={selected}
      dragging={dragging}
      onPointerDown={onPointerDown}
      className="p-1 flex items-center justify-center"
    >
      {signature.dataUrl ? (
        <img
          src={signature.dataUrl}
          alt="Firma"
          className="w-full h-auto block pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="text-[11px] px-2 py-2 font-semibold text-indigo-700 flex items-center gap-1">
          <Edit3 size={12} /> Firma
        </div>
      )}
    </DraggableOverlay>
  );
}