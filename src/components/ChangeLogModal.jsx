import React from 'react';
import { Sparkles, Tag, CheckCircle2, Wrench, Shield, X, Rocket, Calendar } from 'lucide-react';

// Single source of truth per la versione dell'app
export const CURRENT_VERSION = 'v1.6.0';

const CHANGELOG_DATA = [
  {
    version: 'v1.6.0',
    date: 'Oggi',
    badge: 'Corrente',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    changes: [
      {
        type: 'feature',
        title: 'Preset Crocetta Rapida [X]',
        desc: 'Aggiunta la scorciatoia per inserire istantaneamente marcatori e spunte [X] pre-formattate per caselle di controllo e moduli.',
      },
      {
        type: 'fix',
        title: 'Allineamento Millimetrico UI - PDF (Baseline Alignment)',
        desc: "Risolto il disallineamento della 'X' e dei campi testo nell'esportazione PDF grazie alla calibrazione accurata delle coordinate di origine tra React e pdf-lib.",
      },
      {
        type: 'fix',
        title: 'Stabilizzazione Eventi Pointer e Touch',
        desc: "Migliorata la reattività e fluidità del drag & drop su dispositivi touch grazie all'unificazione dei Pointer Events.",
      },
    ],
  },
  {
    version: 'v1.5.0',
    date: 'Febbraio 2026',
    changes: [
      {
        type: 'feature',
        title: 'Strumento Cancella e Sbianchetta Testo (Redaction)',
        desc: 'Aggiunta la possibilità di inserire rettangoli di copertura per cancellare o nascondere dati non desiderati (IBAN, codici, importi) direttamente sul PDF.',
      },
      {
        type: 'feature',
        title: 'Palette Colori e Personalizzazione Copertura',
        desc: 'Scelta rapida tra Bianco (default), Nero (censura) e Giallo Evidenziatore con selettore del colore personalizzato.',
      },
      {
        type: 'feature',
        title: 'Supporto NATIVO alla Rotazione e Livelli',
        desc: 'I rettangoli si posizionano correttamente anche su PDF ruotati (/Rotate) e vengono collocati sotto ai nuovi campi di testo e firme per consentire la riscrittura.',
      },
    ],
  },
  {
    version: 'v1.4.0',
    date: 'Febbraio 2026',
    changes: [
      {
        type: 'feature',
        title: 'Overlay di Caricamento PDF con Trucchi e Scorciatoie',
        desc: 'Nuova schermata di caricamento visiva con animazioni a tema, indicazione della dimensione del file in MB e box dinamico con consigli utili e scorciatoie a rotazione.',
      },
      {
        type: 'feature',
        title: 'Ottimizzazione reattività UI (Elaborazione Asincrona)',
        desc: "Migliorata la fluidità dell'interfaccia durante il parsing dei file PDF più pesanti grazie all'elaborazione differita non bloccante.",
      },
    ],
  },
  {
    version: 'v1.3.1',
    date: 'Febbraio 2026',
    changes: [
      {
        type: 'fix',
        title: 'Correzione valore predefinito campi testo',
        desc: "Risolto il problema per cui i campi testo generici ereditavano il nome dell'etichetta come valore. Ora nascono vuoti o autocompilati dal profilo.",
      },
      {
        type: 'feature',
        title: 'Migliorata la corrispondenza dei campi Profilo',
        desc: 'Integrazione avanzata di riconoscimento per campi come Nome, Cognome, Codice Fiscale, Email e Data.',
      },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'Febbraio 2026',
    changes: [
      {
        type: 'feature',
        title: 'Gestione Profilo Firmatario e Autocompilazione',
        desc: 'Possibilità di salvare i propri dati (Nome, Cognome, CF, Email) per autocompilare istantaneamente i campi creati.',
      },
      {
        type: 'feature',
        title: 'Informativa e Sicurezza Privacy Locale',
        desc: 'Aggiunto l’avviso di garanzia privacy: tutti i dati e le firme rimangono salvati esclusivamente sul browser dell’utente (localStorage).',
      },
      {
        type: 'feature',
        title: 'Formattazione automatica della data',
        desc: 'Inserimento intelligente della data di oggi in formato standard DD/MM/YYYY con scorciatoia rapida.',
      },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'Febbraio 2026',
    changes: [
      {
        type: 'feature',
        title: 'Gestione Pagine Avanzata',
        desc: 'Possibilità di inserire pagine bianche all’interno del documento ed eliminare pagine esistenti con modal di conferma.',
      },
      {
        type: 'feature',
        title: 'Scorciatoie da tastiera e storia Modifiche (Undo/Redo)',
        desc: 'Aggiunto supporto completo a Ctrl+Z / Ctrl+Y, copia/incolla (Ctrl+C / Ctrl+V), spostamento fine con frecce direzionali e tasto Canc/Backspace.',
      },
      {
        type: 'feature',
        title: 'Linee di Guida Smart (Snap Alignment)',
        desc: 'Allineamento magnetico automatico degli elementi durante il trascinamento sul canvas.',
      },
    ],
  },
  {
    version: 'v1.1.0',
    date: 'Gennaio 2026',
    changes: [
      {
        type: 'feature',
        title: 'Gestione Firme Grafiche e Libreria Locale',
        desc: 'Disegno di firme personalizzate con memorizzazione nella libreria rapida per un riutilizzo immediato.',
      },
      {
        type: 'feature',
        title: 'Esportazione Singola Pagina in Immagine (PNG)',
        desc: 'Download in alta risoluzione della pagina attiva completa di testi, date e firme.',
      },
      {
        type: 'feature',
        title: 'Controlli Formattazione Testo',
        desc: 'Personalizzazione di dimensione font, stile (Grassetto, Corsivo, Sottolineato) e colore del testo.',
      },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'Gennaio 2026',
    changes: [
      {
        type: 'feature',
        title: 'Lancio Iniziale PDF Editor',
        desc: 'Caricamento PDF con rendering Canvas tramite PDF.js, posizionamento campi e rigenerazione con PDF-Lib.',
      },
    ],
  },
];

const renderTypeBadge = (type) => {
  switch (type) {
    case 'fix':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Wrench size={11} /> Correzione
        </span>
      );
    case 'feature':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Sparkles size={11} /> Novità
        </span>
      );
  }
};

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <HistoryIcon size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
                Changelog & Aggiornamenti
              </h2>
              <p className="text-slate-500 text-xs">Scopri tutte le novità ed i miglioramenti rilasciati</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - Timeline */}
        <div className="p-6 overflow-y-auto space-y-8 divide-y divide-slate-100">
          {CHANGELOG_DATA.map((release, idx) => (
            <div key={release.version} className={idx > 0 ? 'pt-6' : ''}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-indigo-950 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                    <Tag size={13} className="text-indigo-600" />
                    {release.version}
                  </span>
                  {release.badge && (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${release.badgeColor}`}>
                      {release.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                  <Calendar size={13} />
                  <span>{release.date}</span>
                </div>
              </div>

              <div className="space-y-3.5 pl-1">
                {release.changes.map((change, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-3 group">
                    <div className="mt-0.5">{renderTypeBadge(change.type)}</div>
                    <div className="flex-1 space-y-0.5">
                      <h4 className="text-xs font-semibold text-slate-800 leading-snug">
                        {change.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {change.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-emerald-600" />
            Applicazione aggiornata e sicura
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}