import React from 'react';
import { Upload, ShieldCheck, Heart, Zap, Share2 } from 'lucide-react';

function ShareWhatsAppButton() {
  const handleShare = () => {
    const currentUrl = window.location.href;
    const message = `Ciao! 👋 Ti segnalo SignFlow: un tool gratuito e velocissimo per compilare e firmare PDF direttamente dal browser, senza installare nulla e nel rispetto totale della privacy (i dati non lasciano mai il tuo dispositivo)! 🔒📄\n\nProvalo qui: ${currentUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-95"
      title="Condividi SignFlow su WhatsApp"
    >
      <Share2 size={15} />
      <span>Condividi su WhatsApp</span>
    </button>
  );
}

export default function WelcomePage({ onFileUpload, isLoading }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Compila e Firma i tuoi PDF in totale sicurezza
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Un'applicazione semplice, rapida e concepita per la massima privacy. Aggiungi testo, firme e formatta i tuoi documenti direttamente dal browser o dal cellulare.
        </p>
        <div className="flex justify-center pt-2">
          <ShareWhatsAppButton />
        </div>
      </div>

      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-3xl p-8 bg-white cursor-pointer hover:bg-indigo-50/30 transition-all shadow-md group">
        <div className="p-4 bg-indigo-50 rounded-2xl group-hover:scale-110 transition-transform mb-3">
          <Upload className="w-10 h-10 text-indigo-600" />
        </div>
        <span className="text-slate-800 font-bold text-base text-center">
          {isLoading ? 'Caricamento in corso...' : 'Seleziona un file PDF per iniziare'}
        </span>
        <span className="text-slate-400 text-xs mt-1">Nessun file viene caricato su server esterni</span>
        <input type="file" accept="application/pdf" onChange={onFileUpload} className="hidden" disabled={isLoading} />
      </label>

      {/* Garanzie & Privacy Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Heart size={22} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Gratuita per sempre</h3>
          <p className="text-slate-500 text-xs">
            Nessun abbonamento, nessun limite di documenti e nessuna funzionalità a pagamento.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">100% Locale e Privata</h3>
          <p className="text-slate-500 text-xs">
            I tuoi dati non lasciano mai il dispositivo. L'elaborazione avviene interamente nel tuo browser.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Zap size={22} />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Nessun Tracciamento</h3>
          <p className="text-slate-500 text-xs">
            Non salviamo cookie di profilazione né tracciamo i tuoi documenti. Massima riservatezza garantita.
          </p>
        </div>
      </div>
    </div>
  );
}