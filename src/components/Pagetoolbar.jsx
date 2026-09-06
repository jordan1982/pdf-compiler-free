import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

export default function PageToolbar({ currentPage, numPages, zoomLevel, onPrev, onNext, onZoom }) {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-2 text-xs">
      {numPages > 1 ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center font-medium transition-colors"
          >
            <ChevronLeft size={16} /> Prec
          </button>
          <span className="font-bold text-slate-700 px-1">Pag. {currentPage} di {numPages}</span>
          <button
            onClick={onNext}
            disabled={currentPage === numPages}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center font-medium transition-colors"
          >
            Succ <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <span className="font-semibold text-slate-700">Documento a pagina unica</span>
      )}

      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-500">Zoom:</span>
        <button onClick={() => onZoom(-0.25)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
          <ZoomOut size={15} />
        </button>
        <span className="font-bold text-indigo-600 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
        <button onClick={() => onZoom(0.25)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
          <ZoomIn size={15} />
        </button>
      </div>
    </div>
  );
}