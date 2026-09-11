
import React, { useState, useEffect } from 'react';
import { X, UserCheck, Save } from 'lucide-react';

export default function SignerModal({ isOpen, onClose, signerInfo, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    cf: '',
    email: '',
  });

  // Sincronizza lo stato locale quando cambiano i dati o la visibilità
  useEffect(() => {
    if (signerInfo) {
      setFormData({
        nome: signerInfo.nome || '',
        cognome: signerInfo.cognome || '',
        cf: signerInfo.cf || '',
        email: signerInfo.email || '',
      });
    }
  }, [signerInfo, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSave === 'function') {
      onSave(formData);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <UserCheck size={18} className="text-indigo-600" />
            <span>Profilo Firmatario</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Nome
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Mario"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Cognome
              </label>
              <input
                type="text"
                name="cognome"
                value={formData.cognome}
                onChange={handleChange}
                placeholder="Rossi"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
              Codice Fiscale
            </label>
            <input
              type="text"
              name="cf"
              value={formData.cf}
              onChange={handleChange}
              placeholder="RSSMRA80A01H501Z"
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/30 uppercase"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="mario.rossi@email.it"
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/30"
            />
          </div>

          <p className="text-[10px] text-slate-400 italic">
            I dati inseriti verranno salvati nel browser per un utilizzo futuro.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Salva Dati</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}