import React from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';

export default function ExportActions({ isGenerating, onGeneratePdf, onExportImage }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onGeneratePdf}
        disabled={isGenerating}
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all text-sm"
        title="Scarica il PDF modificato sul tuo dispositivo"
      >
        <Download size={18} />
        <span>{isGenerating ? 'Generazione…' : 'Genera PDF'}</span>
      </button>
      <button
        onClick={onExportImage}
        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 p-3.5 rounded-2xl flex items-center justify-center transition-all shadow-sm"
        title="Esporta pagina corrente come immagine PNG"
      >
        <ImageIcon size={18} />
      </button>
    </div>
  );
}