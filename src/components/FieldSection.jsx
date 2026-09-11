import React from 'react';
import { Plus } from 'lucide-react';
import FieldRow from './FieldRow';

export default function FieldSection({
  fields,
  numPages,
  newFieldName,
  selectedId,
  profiles,
  setNewFieldName,
  handleAddField,
  setSelectedId,
  updateField,
  removeField,
  duplicateField,
}) {
  return (
    <div className="space-y-4">
      <form onSubmit={handleAddField} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2">
        <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
          <span>Aggiungi campo</span>
          <span className="text-[10px] text-slate-400 font-normal">Es. Codice Fiscale, Luogo</span>
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome campo"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors shadow-sm"
            title="Aggiungi nuovo campo di testo"
          >
            <Plus size={14} /> <span>Crea</span>
          </button>
        </div>
      </form>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3 max-h-[36vh] overflow-y-auto">
        <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Campi e formattazione</h2>
        {fields.map((field) => (
          <FieldRow
            key={field.id}
            field={field}
            numPages={numPages}
            selected={selectedId === field.id}
            onSelect={setSelectedId}
            onUpdate={updateField}
            onRemove={removeField}
            onDuplicate={duplicateField}
            profiles={profiles}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">Nessun campo. Aggiungine uno sopra.</p>
        )}
      </div>
    </div>
  );
}