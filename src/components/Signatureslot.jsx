import React from 'react';
import { Move, Image as ImageIcon, Trash2, Copy } from 'lucide-react';
import SignaturePad from './SignaturePad';

export default function SignatureSlot({ signature, index, numPages, selected, onSelect, onUpdate, onCapture, onClear, onRemove, onDuplicate, canRemove }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => onCapture(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={() => onSelect(signature.id)}
      className={`bg-white p-4 rounded-2xl shadow-sm border space-y-3 cursor-pointer transition-all ${
        selected ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-indigo-700 flex items-center gap-1.5">
          <Move size={14} /> Firma {index + 1}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-indigo-600 font-medium">Pag:</span>
          <select
            value={signature.page}
            onChange={(e) => onUpdate('page', Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs bg-white font-semibold outline-none"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          {canRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-slate-400 hover:text-red-500 p-1"
              title="Rimuovi questa firma"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs" onClick={(e) => e.stopPropagation()}>
        <span className="text-slate-600 font-medium whitespace-nowrap">Dimensioni:</span>
        <input
          type="range"
          min="10"
          max="45"
          value={signature.widthPct}
          onChange={(e) => onUpdate('widthPct', Number(e.target.value))}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <span className="font-bold text-indigo-700 w-12 text-right">{signature.widthPct}%</span>
      </div>

      <div onClick={(e) => e.stopPropagation()} className="space-y-3">
        <SignaturePad onCapture={onCapture} onClear={onClear} />
        {signature.dataUrl && (
          <button
            type="button"
            onClick={onDuplicate}
            className="flex items-center justify-center gap-2 w-full border border-indigo-300 hover:border-indigo-500 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-700 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Copy size={14} />
            <span>Duplica questa firma in un altro punto</span>
          </button>
        )}
        <label className="flex items-center justify-center gap-2 w-full border border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/30 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm">
          <ImageIcon size={15} className="text-indigo-600" />
          <span>Oppure carica un'immagine della firma</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}