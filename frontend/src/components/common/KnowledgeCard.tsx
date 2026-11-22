import React from 'react';
import { useAluna } from '../../context/AlunaContext';
import { KnowledgeItem } from '../../types';
import { 
  FileText, 
  Headphones, 
  Video, 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Clock, 
  Compass, 
  KeyRound,
  Eye,
  Bot,
  Users
} from 'lucide-react';

interface KnowledgeCardProps {
  knowledge: KnowledgeItem;
  onOpen: (k: KnowledgeItem) => void;
  onRequestAccess: (k: KnowledgeItem) => void;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ 
  knowledge, 
  onOpen, 
  onRequestAccess 
}) => {
  const { canUserRead } = useAluna();

  const accessCheck = canUserRead(knowledge);
  const isAiRevoked = Boolean(knowledge.permissions.revokedAt);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Headphones className="w-3.5 h-3.5 text-[#005A8D] dark:text-sky-300" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />;
      case 'fotografia':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />;
      case 'practica':
        return <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />;
      case 'relato':
      case 'historia':
      case 'memoria':
      case 'documento':
      default:
        return <FileText className="w-3.5 h-3.5 text-[#005A8D] dark:text-aluna-cyan" />;
    }
  };

  // Consistent visibility chips (Page 34 #1: Público, Comunidad, Restringido, Privado)
  const getAccessBadge = (level: string) => {
    switch (level) {
      case 'public':
        return {
          label: 'Público',
          bg: 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          icon: <Unlock className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
        };
      case 'community':
        return {
          label: 'Comunidad',
          bg: 'bg-amber-50 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700',
          icon: <ShieldCheck className="w-3 h-3 text-amber-700 dark:text-amber-400" />
        };
      case 'restricted':
        return {
          label: 'Restringido',
          bg: 'bg-orange-50 dark:bg-orange-950/90 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-700',
          icon: <Lock className="w-3 h-3 text-orange-700 dark:text-orange-400" />
        };
      case 'private':
        return {
          label: 'Privado',
          bg: 'bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-700',
          icon: <Lock className="w-3 h-3 text-rose-700 dark:text-rose-400" />
        };
      default:
        return {
          label: level,
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          icon: <Lock className="w-3 h-3 text-slate-600 dark:text-slate-400" />
        };
    }
  };

  const badge = getAccessBadge(knowledge.permissions.consultation);

  return (
    <article className="rounded-2xl border border-slate-200/90 dark:border-[#1E3E54] bg-white dark:bg-[#0D212E] hover:border-[#004B87]/50 dark:hover:border-aluna-cyan/50 shadow-sm transition-colors flex flex-col justify-between overflow-hidden">
      
      {/* Media Banner (No bottom text overlay so it never collides with photo captions) */}
      {knowledge.mediaUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 shrink-0">
          <img 
            src={knowledge.mediaUrl} 
            alt={knowledge.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06233B]/45 via-transparent to-[#06233B]/30" />
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 dark:bg-[#0D212E]/95 text-[#06233B] dark:text-white border border-slate-200 dark:border-[#1E3E54] shadow-sm capitalize">
              {getTypeIcon(knowledge.type)}
              {knowledge.type}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${badge.bg}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 pb-0 flex flex-wrap items-start justify-between gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-[#1E3E54] capitalize">
            {getTypeIcon(knowledge.type)}
            {knowledge.type}
          </span>
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </span>
        </div>
      )}

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Community Name and Multi-Community Badge placed cleanly in card body */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <p className="text-[11px] font-bold text-[#005A8D] dark:text-aluna-cyan">
              {knowledge.communityNames.join(' • ')}
            </p>
            {knowledge.communityIds.length > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/90 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                <Users className="w-2.5 h-2.5" />
                Mancomunado ({knowledge.communityIds.length})
              </span>
            )}
          </div>

          <h3 className="font-serif font-bold text-base text-[#06233B] dark:text-white leading-snug">
            {knowledge.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {accessCheck.allowed ? knowledge.description : (knowledge.excerptForPublic || knowledge.description)}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Consistent AI Permission Chip (Page 34 #1: IA permitida / IA no permitida) */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-[#1E3E54] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
              isAiRevoked || knowledge.permissions.aiQueryAllowed === 'none'
                ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border-sky-200 dark:border-[#1E3E54]'
            }`}>
              <Bot className="w-3 h-3" />
              <span>
                {isAiRevoked
                  ? 'IA revocada'
                  : knowledge.permissions.aiQueryAllowed === 'none'
                  ? 'IA no permitida'
                  : 'IA permitida (Ceiba)'}
              </span>
            </span>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{knowledge.date}</span>
            </div>
          </div>

          {/* Author info (non-truncated) */}
          <div className="text-[11px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#132C3E] border border-slate-200/80 dark:border-[#1E3E54] p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-1.5">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-normal">Autor/aportante: </span>
              <span className="font-bold text-[#06233B] dark:text-white">{knowledge.author}</span>
            </div>
            <span className="text-[10px] text-[#005A8D] dark:text-aluna-cyan font-semibold">
              {knowledge.authorRole}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-1">
            {accessCheck.allowed ? (
              <button
                onClick={() => onOpen(knowledge)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#004B87] hover:bg-[#003865] dark:bg-[#005A8D] dark:hover:bg-[#0074B4] transition-colors shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Consultar saber</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => onRequestAccess(knowledge)}
                  disabled={!accessCheck.canRequest}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                    accessCheck.canRequest
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {accessCheck.canRequest ? (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Solicitar acceso al custodio</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Acceso reservado interno</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-amber-800 dark:text-amber-300 font-medium leading-snug">
                  {accessCheck.reason}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </article>
  );
};
