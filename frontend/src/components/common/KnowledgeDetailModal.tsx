import React from 'react';
import { useAluna } from '../../context/AlunaContext';
import { KnowledgeItem } from '../../types';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Tag, 
  Volume2,
  Bot,
  Users,
  Info
} from 'lucide-react';

interface KnowledgeDetailModalProps {
  knowledge: KnowledgeItem | null;
  onClose: () => void;
  onOpenInLab: (k: KnowledgeItem) => void;
}

export const KnowledgeDetailModal: React.FC<KnowledgeDetailModalProps> = ({
  knowledge,
  onClose,
  onOpenInLab
}) => {
  const { canUserRead, canUserProcessWithAI } = useAluna();

  if (!knowledge) return null;

  const readCheck = canUserRead(knowledge);
  const aiCheck = canUserProcessWithAI(knowledge);
  const custodiansList = knowledge.approvals
    .map(a => a.custodianName)
    .filter(Boolean)
    .join(', ') || 'Custodia Territorial';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-saber-title" className="bg-white dark:bg-[#0D212E] rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-[#06233B] dark:text-white shadow-2xl border border-slate-200 dark:border-[#1E3E54] my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E3E54] shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-aluna-cyan/15 text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-aluna-cyan/30 capitalize">
                {knowledge.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#132C3E] text-[#06233B] dark:text-sky-200 border border-slate-200 dark:border-[#1E3E54]">
                {knowledge.communityNames.join(' • ')}
              </span>
              {knowledge.communityIds.length > 1 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                  <Users className="w-3 h-3" />
                  Saber Mancomunado
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                Contenido ficticio de demostración
              </span>
            </div>
            <h2 id="modal-saber-title" className="font-serif font-bold text-xl sm:text-2xl text-[#06233B] dark:text-white leading-tight">
              {knowledge.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar detalle del saber"
            className="p-2 rounded-xl text-slate-500 hover:text-[#06233B] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132C3E] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          
          {/* Block: Origen y Condiciones de Uso (Page 34 #2) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54] space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-[#004B87] dark:text-aluna-cyan uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Origen y condiciones de uso</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Comunidad(es) titular(es)</span>
                <span className="font-bold text-[#06233B] dark:text-white">{knowledge.communityNames.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Autor / Aportante de demostración</span>
                <span className="font-bold text-[#06233B] dark:text-white">{knowledge.author} ({knowledge.authorRole})</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Custodia responsable</span>
                <span className="font-bold text-[#06233B] dark:text-white">{custodiansList}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Permiso de Lectura</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 capitalize">
                  {readCheck.allowed ? `Permitida (${knowledge.permissions.consultation})` : 'Restringida'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Consulta IA (Ceiba)</span>
                <span className={`font-bold ${aiCheck.allowed ? 'text-[#004B87] dark:text-aluna-cyan' : 'text-rose-700 dark:text-rose-400'}`}>
                  {aiCheck.allowed
                    ? 'Permitida'
                    : knowledge.permissions.revokedAt
                    ? 'Revocada por custodia'
                    : 'No permitida'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Publicación derivada</span>
                <span className="font-bold text-amber-800 dark:text-[#F5B82E]">Requiere revisión de custodia</span>
              </div>
            </div>
          </div>

          {/* Audio player if audio item */}
          {knowledge.audioUrl && (
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-[#132C3E] border border-sky-200 dark:border-[#1E3E54] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#004B87] dark:text-aluna-cyan font-bold text-xs">
                  <Volume2 className="w-4 h-4" />
                  <span>Grabación Sonora Comunitaria · {knowledge.audioDuration || '03:45'}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Audio de demostración</span>
              </div>
              <audio controls className="w-full">
                <source src={knowledge.audioUrl} type="audio/wav" />
                Tu navegador no soporta el reproductor de audio.
              </audio>
            </div>
          )}

          {/* Full Narrative Text */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#004B87] dark:text-aluna-cyan flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Contenido Registrado y Autorizado</span>
            </h4>
            <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-line bg-slate-50 dark:bg-[#0A1924] p-5 rounded-2xl border border-slate-200 dark:border-[#1E3E54]">
              {knowledge.fullContent}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            {knowledge.tags.map((t, idx) => (
              <span 
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-slate-200 dark:border-[#1E3E54]"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* AI Policy Note */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54] flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#005A8D] dark:text-aluna-cyan" />
            <div>
              <span className="font-bold text-[#06233B] dark:text-white block">
                Política de Ceiba IA para este saber:
              </span>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                {aiCheck.reason}
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#1E3E54] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132C3E] transition-colors"
          >
            Cerrar lectura
          </button>

          {aiCheck.allowed ? (
            <button
              onClick={() => {
                onClose();
                onOpenInLab(knowledge);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004B87] hover:bg-[#003865] dark:bg-aluna-cyan dark:hover:bg-aluna-cyan-light text-white dark:text-[#061A17] font-bold text-xs shadow-sm transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>Pregúntale a Ceiba / Transformar para enseñar</span>
            </button>
          ) : (
            <div className="text-xs text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Este saber puede ser consultado por ti, pero no está autorizado para procesamiento con IA</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
