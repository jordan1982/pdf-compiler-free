import React from 'react';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExportActions({ isGenerating, onGeneratePdf, onExportImage }) {
  
  // Effetto coriandoli personalizzato con le tonalità dell'app
  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#059669', '#10b981', '#34d399', '#6ee7b7']
    });
  };

  const handlePdfClick = async () => {
    try {
      if (onGeneratePdf) {
        await onGeneratePdf();
        triggerConfetti();
      }
    } catch (error) {
      console.error("Errore generazione PDF:", error);
    }
  };

  const handleImageClick = async () => {
    try {
      if (onExportImage) {
        await onExportImage();
        triggerConfetti();
      }
    } catch (error) {
      console.error("Errore esportazione Immagine:", error);
    }
  };

  return (
    <div className="flex items-center gap-2.5 w-full">
      {/* Pulsante Principale - Genera PDF */}
      <button
        onClick={handlePdfClick}
        disabled={isGenerating}
        className="flex-1 relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none disabled:transform-none text-white font-semibold p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-200 text-sm"
        title="Scarica il PDF modificato sul tuo dispositivo"
      >
        {isGenerating ? (
          <Loader2 size={18} className="animate-spin text-emerald-100" />
        ) : (
          <Download size={18} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
        )}
        <span>{isGenerating ? 'Generazione in corso…' : 'Genera PDF'}</span>
      </button>

      {/* Pulsante Secondario - Esporta Immagine */}
      <button
        onClick={handleImageClick}
        disabled={isGenerating}
        className="group bg-white border border-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none p-3.5 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow"
        title="Esporta pagina corrente come immagine PNG"
      >
        <ImageIcon size={18} className="transition-transform duration-200 group-hover:scale-110 text-slate-500 group-hover:text-slate-700" />
      </button>
    </div>
  );
}