import React from 'react';
import { Plus, Calendar } from 'lucide-react';
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
  // Formatta la data in formato italiano GG/MM/AAAA
  const getTodayDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleApplyTodayDate = () => {
    const todayStr = getTodayDate();

    // 1. Cerca un campo "Data" esistente
    const targetField =
      fields.find((f) => f.id === selectedId && (f.id === 'data' || f.label.toLowerCase().includes('data'))) ||
      fields.find((f) => f.id === 'data' || f.label.toLowerCase().includes('data'));

    if (targetField) {
      // Se il campo esiste già, aggiorna il VALORE del testo
      updateField(targetField.id, 'value', todayStr);
      setSelectedId(targetField.id);
    } else {
      // Se non esiste, precompila il nome come "Data"
      setNewFieldName('Data');
    }
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    handleAddField(e);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmitForm} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2">
        <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
          <span>Aggiungi campo</span>
          <span className="text-[10px] text-slate-400 font-normal">Es. Codice Fiscale, Luogo</span>
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nome del campo (es. Data, Luogo)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!newFieldName.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 flex-shrink-0 transition-colors shadow-sm"
            title="Aggiungi nuovo campo di testo"
          >
            <Plus size={14} /> <span>Crea</span>
          </button>
        </div>

        {/* Scorciatoia Data */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-400 font-medium">Scorciatoia:</span>
          <button
            type="button"
            onClick={handleApplyTodayDate}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1 rounded-lg transition-colors"
            title="Imposta la data di oggi sul campo Data"
          >
            <Calendar size={13} />
            <span>Inserisci data di oggi</span>
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
            onSetToday={() => updateField(field.id, 'value', getTodayDate())}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">Nessun campo. Aggiungine uno sopra.</p>
        )}
      </div>
    </div>
  );
}