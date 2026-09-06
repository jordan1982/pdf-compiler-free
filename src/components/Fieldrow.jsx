import React from 'react';
import { Bold, Italic, Underline, Trash2, Copy, Palette } from 'lucide-react';

export default function FieldRow({ field, numPages, selected, onSelect, onUpdate, onRemove, onDuplicate }) {
  return (
    <div
      onClick={() => onSelect(field.id)}
      className={`space-y-2.5 border border-slate-200/80 p-3 rounded-xl transition-all cursor-pointer ${
        selected ? 'bg-indigo-50/80 border-indigo-300 shadow-sm ring-1 ring-indigo-200' : 'bg-slate-50/50 hover:bg-slate-100/80'
      }`}
    >
      {/* Header: Titolo, Pagina e Azioni */}
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-slate-800 truncate max-w-[120px]" title={field.label}>
          {field.label}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">Pag:</span>
          <select
            value={field.page}
            onChange={(e) => onUpdate(field.id, 'page', Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="border border-slate-300 rounded-md px-1 py-0.5 text-xs bg-white font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
            title="Sposta su un'altra pagina"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(field.id); }}
            className="text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-white transition-colors"
            title="Duplica questo campo"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors"
            title="Rimuovi campo"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Input Testo e Dimensione */}
      <div className="flex gap-2">
        <input
          type="text"
          value={field.value}
          onChange={(e) => onUpdate(field.id, 'value', e.target.value)}
          placeholder={`Inserisci ${field.label}`}
          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:bg-white bg-white/80 shadow-sm"
        />
        <div className="flex items-center gap-1 bg-white px-2 rounded-lg border border-slate-300 shadow-sm flex-shrink-0" title="Dimensione testo in punti">
          <span className="text-[10px] text-slate-400 font-bold">Pt:</span>
          <input
            type="number"
            value={field.fontSize || 10}
            onChange={(e) => onUpdate(field.id, 'fontSize', Number(e.target.value))}
            className="w-7 text-xs py-1 bg-transparent text-center font-bold outline-none text-slate-700"
            min="6"
            max="36"
          />
        </div>
      </div>

      {/* Barra Formattazione e Colore */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUpdate(field.id, 'bold', !field.bold); }}
            className={`p-1.5 rounded-md border text-xs transition-colors ${field.bold ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
            title="Grassetto"
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUpdate(field.id, 'italic', !field.italic); }}
            className={`p-1.5 rounded-md border text-xs transition-colors ${field.italic ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
            title="Corsivo"
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onUpdate(field.id, 'underline', !field.underline); }}
            className={`p-1.5 rounded-md border text-xs transition-colors ${field.underline ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
            title="Sottolineato"
          >
            <Underline size={13} />
          </button>
        </div>

        {/* Picker Colore */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-300 px-2 py-1 rounded-md shadow-sm" title="Cambia colore del testo">
          <Palette size={13} className="text-slate-500" />
          <input
            type="color"
            value={field.color || '#000000'}
            onChange={(e) => onUpdate(field.id, 'color', e.target.value)}
            className="w-4 h-4 border-0 bg-transparent cursor-pointer rounded"
          />
        </div>
      </div>
    </div>
  );
}