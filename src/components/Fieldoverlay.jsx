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
      className="p-0 border-0 bg-transparent overflow-visible leading-none"
      style={{ fontSize: `${fontPx}px`, lineHeight: 1, paddingTop: 0, paddingBottom: 0 }}
    >
      <span
        style={{ color: field.color || '#000000' }}
        className={`inline-block select-none ${field.bold ? 'font-bold' : ''} ${field.italic ? 'italic' : ''} ${field.underline ? 'underline' : ''}`}
      >
        {field.value || `[${field.label}]`}
      </span>
    </DraggableOverlay>
  );
}