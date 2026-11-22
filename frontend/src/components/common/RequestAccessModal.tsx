import React, { useState } from 'react';
import { useAluna } from '../../context/AlunaContext';
import { KnowledgeItem } from '../../types';
import { X, KeyRound, User } from 'lucide-react';

interface RequestAccessModalProps {
  knowledge: KnowledgeItem | null;
  onClose: () => void;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  knowledge,
  onClose
}) => {
  const { currentUser, requestAccess } = useAluna();
  const [purpose, setPurpose] = useState('');
  const [reqConsultation, setReqConsultation] = useState(true);
  const [reqAI, setReqAI] = useState(false);
  const [reqDerivatives, setReqDerivatives] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!knowledge) return null;

  const custodiansList = knowledge.approvals
    .map(a => a.custodianName)
    .filter(Boolean)
    .join(', ') || 'Consejo de Sabiduría / Custodia';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) return;

    setIsSubmitting(true);
    const success = requestAccess(knowledge.id, purpose, {
      consultation: reqConsultation,
      aiProcessing: reqAI,
      derivatives: reqDerivatives
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0D212E] rounded-3xl max-w-xl w-full p-6 sm:p-8 text-[#06233B] dark:text-white shadow-2xl border border-slate-200 dark:border-[#1E3E54] animate-fade-in">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E3E54]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
                Solicitud de Acceso y Diálogo de Saberes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                La custodia comunitaria evaluará tu petición respetando la gobernanza colectiva.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 hover:text-[#06233B] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132C3E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-5 space-y-4 text-xs">
          
          {/* Target Knowledge Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#005A8D] dark:text-aluna-cyan tracking-wider">
              Saber solicitado
            </span>
            <p className="font-serif font-bold text-sm text-[#06233B] dark:text-white">
              {knowledge.title}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Custodia: <span className="text-[#06233B] dark:text-white font-semibold">{custodiansList}</span> · {knowledge.communityNames.join(' • ')}
            </p>
          </div>

          {/* User ID summary */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54] text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#005A8D] dark:text-aluna-cyan" />
              <div>
                <span className="font-bold text-[#06233B] dark:text-white">{currentUser.name}</span>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">
                  {currentUser.roleLabel} {currentUser.organization ? `· ${currentUser.organization}` : ''}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-aluna-cyan/15 text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-aluna-cyan/30">
              Identidad Activa
            </span>
          </div>

          {/* Granular Permission checkboxes requested */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54]">
            <span className="font-bold text-[#06233B] dark:text-white block text-[11px]">
              Permisos solicitados a la custodia:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={reqConsultation} 
                  onChange={e => setReqConsultation(e.target.checked)}
                  className="rounded text-[#004B87] focus:ring-[#004B87]"
                />
                <span className="text-[11px] font-medium text-[#06233B] dark:text-slate-200">Lectura</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={reqAI} 
                  onChange={e => setReqAI(e.target.checked)}
                  className="rounded text-[#004B87] focus:ring-[#004B87]"
                />
                <span className="text-[11px] font-medium text-[#06233B] dark:text-slate-200">Consulta IA</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={reqDerivatives} 
                  onChange={e => setReqDerivatives(e.target.checked)}
                  className="rounded text-[#004B87] focus:ring-[#004B87]"
                />
                <span className="text-[11px] font-medium text-[#06233B] dark:text-slate-200">Derivados</span>
              </label>
            </div>
          </div>

          {/* Purpose Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#06233B] dark:text-slate-200 flex items-center justify-between">
              <span>Motivo o propósito de la consulta:</span>
              <span className="text-[10px] text-[#005A8D] dark:text-aluna-cyan font-semibold">Obligatorio</span>
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe detalladamente para qué requieres acceder a este saber (ej. investigación académica de grado, diálogo pedagógico en el aula, etc.)..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-white dark:bg-[#0A1924] text-[#06233B] dark:text-white focus:ring-2 focus:ring-[#004B87] outline-none transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Respect Agreement */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-amber-500 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-[11px] text-amber-900 dark:text-amber-200 leading-snug font-medium">
                Me comprometo a respetar la autoría colectiva, no mercantilizar el contenido, no divulgarlo fuera de los términos autorizados y acatar la decisión soberana que tome la custodia comunitaria.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132C3E] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!agreedTerms || !purpose.trim() || isSubmitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold transition-colors shadow-sm ${
                agreedTerms && purpose.trim()
                  ? 'bg-[#004B87] hover:bg-[#003865]'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Enviar solicitud a la custodia</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
