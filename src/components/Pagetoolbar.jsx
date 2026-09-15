import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Trash2, Square, Rows } from 'lucide-react';

export default function PageToolbar({
  currentPage,
  numPages,
  zoomLevel,
  viewMode = 'single',
  onViewModeChange,
  onPrev,
  onNext,
  onZoom,
  onAddPage,
  onDeletePage,
}) {
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Selettore Modalità di Visualizzazione */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
          <button
            onClick={() => onViewModeChange('single')}
            title="Modalità pagina singola"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'single'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Square size={14} />
            <span className="hidden sm:inline">Singola</span>
          </button>
          <button
            onClick={() => onViewModeChange('continuous')}
            title="Modalità scorrimento continuo"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'continuous'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rows size={14} />
            <span className="hidden sm:inline">Continuo</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Navigazione Pagine */}
        {numPages > 1 ? (
          <div className="flex items-center gap-2">
            {viewMode === 'single' && (
              <button
                onClick={onPrev}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center font-medium transition-colors"
              >
                <ChevronLeft size={16} /> Prec
              </button>
            )}
            <span className="font-bold text-slate-700 px-1">
              Pag. {currentPage} di {numPages}
            </span>
            {viewMode === 'single' && (
              <button
                onClick={onNext}
                disabled={currentPage === numPages}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center font-medium transition-colors"
              >
                Succ <ChevronRight size={16} />
              </button>
            )}
          </div>
        ) : (
          <span className="font-semibold text-slate-700">Documento a pagina unica</span>
        )}

        <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* Gestione Pagine */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onAddPage}
            title="Aggiungi una pagina bianca subito dopo la pagina corrente"
            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1 font-medium transition-colors"
          >
            <Plus size={15} /> Pagina bianca
          </button>
          <button
            onClick={onDeletePage}
            disabled={numPages <= 1}
            title={numPages <= 1 ? "Impossibile eliminare l'unica pagina del documento" : "Elimina la pagina corrente"}
            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40 disabled:hover:bg-red-50 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 size={15} /> Elimina
          </button>
        </div>
      </div>

      {/* Zoom */}
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