import React from 'react';
import { Bold, Italic, Underline, Trash2 } from 'lucide-react';

export default function FieldRow({ field, numPages, selected, onSelect, onUpdate, onRemove }) {
  return (
    <div
      onClick={() => onSelect(field.id)}
      className={`space-y-2.5 border-b border-slate-100 pb-3.5 cursor-pointer p-2.5 rounded-xl transition-all ${
        selected ? 'bg-indigo-50/70 border-indigo-200 shadow-sm' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex justify-between items-center text-xs text-slate-600">
        <span className="font-bold text-slate-900">{field.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-indigo-600 font-medium">Pag:</span>
          <select
            value={field.page}
            onChange={(e) => onUpdate(field.id, 'page', Number(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs bg-white font-semibold outline-none"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
            className="text-slate-400 hover:text-red-500 p-1"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={field.value}
          onChange={(e) => onUpdate(field.id, 'value', e.target.value)}
          placeholder={`Testo per ${field.label}`}
          className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white shadow-sm"
        />
        <div className="flex items-center gap-1 bg-white px-2.5 rounded-xl border border-slate-300 shadow-sm flex-shrink-0">
          <span className="text-[10px] text-slate-400 font-medium">Pt:</span>
          <input
            type="number"
            value={field.fontSize || 10}
            onChange={(e) => onUpdate(field.id, 'fontSize', Number(e.target.value))}
            className="w-8 text-xs py-1 bg-transparent text-center font-bold outline-none text-slate-700"
            min="6"
            max="36"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdate(field.id, 'bold', !field.bold); }}
          className={`p-1.5 px-2.5 rounded-lg border text-xs font-bold transition-colors ${field.bold ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
          title="Grassetto"
        >
          <Bold size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdate(field.id, 'italic', !field.italic); }}
          className={`p-1.5 px-2.5 rounded-lg border text-xs italic transition-colors ${field.italic ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
          title="Corsivo"
        >
          <Italic size={13} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUpdate(field.id, 'underline', !field.underline); }}
          className={`p-1.5 px-2.5 rounded-lg border text-xs underline transition-colors ${field.underline ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
          title="Sottolineato"
        >
          <Underline size={13} />
        </button>
      </div>
    </div>
  );
}