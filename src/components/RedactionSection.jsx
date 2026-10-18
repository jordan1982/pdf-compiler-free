import React from 'react';
import { Eraser, Plus, Trash2, Copy, Palette } from 'lucide-react';

export default function RedactionSection({
  redactions,
  numPages,
  selectedId,
  onAddRedaction,
  setSelectedId,
  updateRedaction,
  removeRedaction,
  duplicateRedaction,
}) {
  const COLOR_PRESETS = [
    { name: 'Bianco', hex: '#FFFFFF', border: 'border-slate-300' },
    { name: 'Nero (Censura)', hex: '#000000', border: 'border-slate-800' },
    { name: 'Giallo Evidenziatore', hex: '#FEF08A', border: 'border-yellow-300' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Eraser size={15} className="text-indigo-600" />
            <span>Copri / Cancella Testo</span>
          </h2>
          <button
            type="button"
            onClick={onAddRedaction}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
          >
            <Plus size={14} /> <span>Aggiungi rettangolo</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Inserisci un rettangolo per coprire o sbianchettare testi non desiderati. Puoi riposizionarlo e cambiarne il colore.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 max-h-[36vh] overflow-y-auto">
        <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Rettangoli attivi ({redactions.length})
        </h2>

        {redactions.map((red) => {
          const isSelected = selectedId === red.id;

          return (
            <div
              key={red.id}
              onClick={() => setSelectedId(red.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/30 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-md border shadow-inner"
                    style={{ backgroundColor: red.color || '#FFFFFF' }}
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Rettangolo Pagina {red.page}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateRedaction(red.id);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"
                    title="Duplica"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRedaction(red.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white"
                    title="Elimina"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Colore copertura:</span>
                    <div className="flex items-center gap-1.5">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.hex}
                          onClick={() => updateRedaction(red.id, 'color', preset.hex)}
                          className={`w-5 h-5 rounded-full border shadow-sm transition-transform ${
                            preset.border
                          } ${red.color === preset.hex ? 'scale-110 ring-2 ring-indigo-500' : ''}`}
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        />
                      ))}
                      <input
                        type="color"
                        value={red.color || '#FFFFFF'}
                        onChange={(e) => updateRedaction(red.id, 'color', e.target.value)}
                        className="w-6 h-6 rounded-md border cursor-pointer p-0 bg-transparent"
                        title="Colore personalizzato"
                      />
                    </div>
                  </div>

                  {numPages > 1 && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] text-slate-500">Sposta su pagina:</span>
                      <select
                        value={red.page}
                        onChange={(e) => updateRedaction(red.id, 'page', Number(e.target.value))}
                        className="border border-slate-200 rounded-lg px-2 py-0.5 text-xs bg-white text-slate-700"
                      >
                        {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                          <option key={p} value={p}>
                            Pagina {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {redactions.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">Nessun rettangolo di copertura presente.</p>
        )}
      </div>
    </div>
  );
}