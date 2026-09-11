import React from 'react';
import { Plus, Bookmark } from 'lucide-react';
import SignatureSlot from './SignatureSlot';

export default function SignatureSection({
  signatures,
  savedSignatures,
  numPages,
  selectedId,
  addSignature,
  setSelectedId,
  updateSignature,
  saveSignatureToStorage,
  removeSignature,
  duplicateSignature,
  onSelectRecentSignature,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
          Firme e Timbri
        </h2>
        <button
          type="button"
          onClick={addSignature}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          title="Aggiungi una nuova firma o timbro"
        >
          <Plus size={14} /> Aggiungi firma
        </button>
      </div>

      {savedSignatures.length > 0 && (
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Bookmark size={11} /> Firme Recenti
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {savedSignatures.map((sigUrl, idx) => (
              <img
                key={idx}
                src={sigUrl}
                alt={`Firma recente ${idx + 1}`}
                onClick={() => onSelectRecentSignature(sigUrl)}
                className="h-9 border border-slate-200 rounded-lg p-1 bg-slate-50 hover:border-indigo-500 cursor-pointer object-contain flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {signatures.map((sig, i) => (
        <SignatureSlot
          key={sig.id}
          signature={sig}
          index={i}
          numPages={numPages}
          selected={selectedId === sig.id}
          onSelect={setSelectedId}
          onUpdate={(key, val) => updateSignature(sig.id, key, val)}
          onCapture={(dataUrl) => updateSignature(sig.id, 'dataUrl', dataUrl)}
          onSaveToStorage={() => saveSignatureToStorage(sig.dataUrl)}
          onClear={() => updateSignature(sig.id, 'dataUrl', null)}
          onRemove={() => removeSignature(sig.id)}
          onDuplicate={() => duplicateSignature(sig.id)}
          canRemove={signatures.length > 1}
        />
      ))}
    </div>
  );
}