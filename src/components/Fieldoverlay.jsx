import React from 'react';
import DraggableOverlay from './Draggableoverlay';

export default function FieldOverlay({ field, fontPx, selected, dragging, onPointerDown, onResizeStart }) {
  return (
    <DraggableOverlay
      id={field.id}
      xPct={field.x}
      yPct={field.y}
      widthPct={field.widthPct}
      heightPct={field.heightPct}
      selected={selected}
      dragging={dragging}
      onPointerDown={onPointerDown}
      onResizeStart={onResizeStart}
      className="px-1 whitespace-normal break-words overflow-hidden"
      style={{ fontSize: `${fontPx}px`, lineHeight: 1.2, paddingTop: 0, paddingBottom: 0 }}
    >
      <span
        style={{ color: field.color || '#000000' }}
        className={`${field.bold ? 'font-bold' : ''} ${field.italic ? 'italic' : ''} ${field.underline ? 'underline' : ''}`}
      >
        {field.value || `[${field.label}]`}
      </span>
    </DraggableOverlay>
  );
}