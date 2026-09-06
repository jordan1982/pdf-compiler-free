import React from 'react';
import DraggableOverlay from './Draggableoverlay';

export default function FieldOverlay({ field, fontPx, selected, dragging, onPointerDown }) {
  return (
    <DraggableOverlay
      id={field.id}
      xPct={field.x}
      yPct={field.y}
      selected={selected}
      dragging={dragging}
      onPointerDown={onPointerDown}
      className="px-1 whitespace-nowrap"
      style={{ fontSize: `${fontPx}px`, lineHeight: 1, paddingTop: 0, paddingBottom: 0 }}
    >
      <span
        className={`text-slate-900 ${field.bold ? 'font-bold' : ''} ${field.italic ? 'italic' : ''} ${field.underline ? 'underline' : ''}`}
      >
        {field.value || `[${field.label}]`}
      </span>
    </DraggableOverlay>
  );
}