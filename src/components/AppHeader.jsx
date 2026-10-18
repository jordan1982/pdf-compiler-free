import React, { useState } from 'react';
import { Undo, Redo, UserCheck, History } from 'lucide-react';
import SignerModal from './SignerModal';
import ChangelogModal from './ChangelogModal';
import { CURRENT_VERSION } from './ChangelogModal';
export default function AppHeader({ 
  pdfBytes, 
  undoFields, 
  redoFields, 
  canUndo, 
  canRedo,
  signerInfo,
  onSaveSignerInfo
}) {
  const [isSignerModalOpen, setIsSignerModalOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  return (
    <>
      <header className="mb-6 relative flex items-center justify-between min-h-[40px]">
        {/* Titolo Principale */}
        <div className={!pdfBytes ? 'w-full text-center' : ''}>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight inline-block">
            SignFlow <span className="text-indigo-600 font-medium text-xs sm:text-sm">| PDF Editor &amp; Sign</span>
          </h1>
        </div>

        {/* Controlli sulla Destra */}
        <div className={`flex items-center gap-2 ${!pdfBytes ? 'absolute right-0 top-0 bottom-0 my-auto' : ''}`}>
          {/* Pulsante Changelog */}
          <button
            onClick={() => setIsChangelogOpen(true)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-1.5"
            title="Vedi cronologia versioni"
          >
            <History size={16} className="text-indigo-600" />
            <span className="hidden sm:inline text-xs font-semibold text-slate-700">
              {CURRENT_VERSION}
            </span>
          </button>

          {/* Pulsante Profilo Firmatario */}
          <button
            onClick={() => setIsSignerModalOpen(true)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-1.5"
            title="Gestisci dati firmatario"
          >
            <UserCheck size={16} className="text-indigo-600" />
            <span className="hidden sm:inline text-xs font-semibold text-slate-700">
              {signerInfo?.nome ? signerInfo.nome : 'Profilo'}
            </span>
          </button>

          {/* Pulsanti Undo / Redo */}
          {pdfBytes && (
            <>
              <button
                onClick={undoFields}
                disabled={!canUndo}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-sm"
                title="Annulla (Ctrl+Z)"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={redoFields}
                disabled={!canRedo}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-sm"
                title="Ripristina (Ctrl+Y)"
              >
                <Redo size={16} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Modal Gestione Dati */}
      <SignerModal
        isOpen={isSignerModalOpen}
        onClose={() => setIsSignerModalOpen(false)}
        signerInfo={signerInfo}
        onSave={onSaveSignerInfo}
      />

      {/* Modal Changelog */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </>
  );
}