import React, { useRef, useEffect, useState } from 'react';
import { Trash2, Copy, Move, BookmarkPlus } from 'lucide-react';

export default function SignatureSlot({
  signature,
  index,
  numPages,
  selected,
  onSelect,
  onUpdate,
  onCapture,
  onSaveToStorage,
  onClear,
  onRemove,
  onDuplicate,
  canRemove,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Inizializza o aggiorna il canvas in base a dataUrl
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!signature.dataUrl) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = signature.dataUrl;
  }, [signature.dataUrl]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (clientY - rect.top) * (canvasRef.current.height / rect.height),
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onCapture(dataUrl);
    }
  };

  return (
    <div
      onClick={() => onSelect(signature.id)}
      className={`bg-white p-3.5 rounded-2xl border transition-all ${
        selected ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md' : 'border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
          <Move size={14} className="text-slate-400" />
          <span>Firma {index + 1}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[10px]">Pag:</span>
            <select
              value={signature.page}
              onChange={(e) => onUpdate('page', Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-2 py-0.5 text-xs bg-slate-50 outline-none"
            >
              {Array.from({ length: numPages }, (_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {idx + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
            title="Duplica firma"
          >
            <Copy size={14} />
          </button>

          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-slate-400 hover:text-red-500 transition-colors"
              title="Rimuovi firma"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium">Dimensioni:</span>
          <input
            type="range"
            min="5"
            max="60"
            value={signature.widthPct}
            onChange={(e) => onUpdate('widthPct', Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <span className="text-xs text-slate-600 font-semibold w-8 text-right">
            {Math.round(signature.widthPct)}%
          </span>
        </div>

        <div className="border-2 border-dashed border-slate-200 rounded-xl p-1 bg-slate-50/50 relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={130}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-28 cursor-crosshair touch-none block rounded-lg bg-white"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {signature.dataUrl ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaveToStorage();
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <BookmarkPlus size={13} />
              <span>Salva tra i recenti</span>
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Disegna sopra per firmare</span>
          )}

          {signature.dataUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 transition-colors"
            >
              Cancella disegno
            </button>
          )}
        </div>
      </div>
    </div>
  );
}