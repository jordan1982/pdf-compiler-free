import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { getPointerPos } from '../utils';

// Draws at the canvas's real display resolution so touch coordinates always
// match what gets drawn, on any screen/DPI.
export default function SignaturePad({ onCapture, onClear }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = wrap.getBoundingClientRect();
    const prev = canvas.toDataURL ? (isEmpty ? null : canvas.toDataURL('image/png')) : null;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // restore prior drawing on resize, so rotating a phone doesn't wipe it
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
    }
  }, [isEmpty]);

  useEffect(() => {
    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pointFromEvent = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const p = getPointerPos(e);
    return { x: p.x - rect.left, y: p.y - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(e);
  };

  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const point = pointFromEvent(e);
    const last = lastPointRef.current;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    lastPointRef.current = point;
    setIsEmpty(false);
  };

  const end = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    drawingRef.current = false;
    onCapture(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div ref={wrapRef} className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden" style={{ height: 120 }}>
        <canvas
          ref={canvasRef}
          style={{ touchAction: 'none' }}
          className="cursor-crosshair bg-white block w-full h-full"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
      >
        <Trash2 size={12} /> Cancella disegno
      </button>
    </div>
  );
}