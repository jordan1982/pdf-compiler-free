import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, PenTool } from 'lucide-react';

const TIPS = [
  "Imposta il tuo profilo in alto a destra per autocompilare Data e Nome con un click!",
  "Puoi salvare la tua firma disegnata per riutilizzarla su tutti i prossimi documenti.",
  "Scorciatoia: Premi Canc o Backspace per rimuovere rapidamente un elemento selezionato.",
  "Tutto viene elaborato sul tuo browser: i tuoi PDF non vengono mai caricati su server esterni.",
  "Usa le linee di allineamento guidate per posizionare il testo con precisione millimetrica."
];

export default function PdfLoaderOverlay({ fileSizeMB }) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Rotazione dei trucchi ogni 2.5 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all animate-fade-in">
      <div className="relative flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-white p-7 shadow-2xl dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
        
        {/* OPZIONE 4: Micro-animazione a tema (Documento + Penna che firma) */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Effetto alone/pulse di sfondo */}
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
          
          {/* Contenitore icona */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
            {/* Documento base */}
            <FileText className="w-10 h-10 animate-pulse" />
            
            {/* Penna animata che "scrive" in diagonale */}
            <PenTool className="absolute -bottom-1 -right-1 w-6 h-6 text-indigo-500 dark:text-indigo-300 animate-bounce" />
          </div>
        </div>

        {/* Titolo e dimensione file */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Elaborazione PDF...
          </h3>
          {fileSizeMB && (
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Dimensione: <span className="text-slate-700 dark:text-slate-300 font-semibold">{fileSizeMB} MB</span>
            </p>
          )}
        </div>

        {/* OPZIONE 1: Box "Trucchi e Scorciatoie" a rotazione */}
        <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-100 dark:border-slate-800 text-left">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lo sapevi?</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[38px] flex items-center transition-all duration-300">
            {TIPS[currentTipIndex]}
          </p>
        </div>

      </div>
    </div>
  );
}