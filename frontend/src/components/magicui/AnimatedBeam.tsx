import React from 'react';
import { cn } from '../../lib/utils';
import { Trees, BookOpen, Bot, CheckCircle2 } from 'lucide-react';

interface AnimatedBeamProps {
  className?: string;
  sourceTitle?: string;
  communityName?: string;
}

export const AnimatedBeamFlow: React.FC<AnimatedBeamProps> = ({
  className,
  sourceTitle = 'Práctica Tradicional',
  communityName = 'Comunidad de Origen',
}) => {
  return (
    <div
      className={cn(
        'relative w-full rounded-2xl bg-slate-50 dark:bg-[#091822] border border-slate-200 dark:border-[#1E3E54] p-6 sm:p-8 overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-3">
        
        {/* Node 1: Comunidad */}
        <div className="flex flex-col items-center text-center space-y-2 max-w-[160px]">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-[#0D212E] border-2 border-[#004B87] dark:border-[#38BDF8] shadow-sm text-[#004B87] dark:text-[#38BDF8]">
            <Trees className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#004B87] dark:text-[#38BDF8] tracking-wider">Origen</span>
            <h5 className="font-bold text-xs text-[#06233B] dark:text-white truncate max-w-[140px]">{communityName}</h5>
          </div>
        </div>

        {/* Connector 1 */}
        <div className="hidden md:flex flex-1 items-center justify-center px-2 relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-[#004B87]/30 via-[#004B87] dark:via-[#38BDF8] to-[#004B87]/30 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#004B87] dark:bg-[#38BDF8]" />
          </div>
        </div>

        {/* Node 2: Saber Protegido */}
        <div className="flex flex-col items-center text-center space-y-2 max-w-[160px]">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-[#0D212E] border-2 border-amber-500 dark:border-[#F5B82E] shadow-sm text-amber-700 dark:text-[#F5B82E]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-[#F5B82E] tracking-wider">Saber Titular</span>
            <h5 className="font-bold text-xs text-[#06233B] dark:text-white truncate max-w-[140px]">{sourceTitle}</h5>
          </div>
        </div>

        {/* Connector 2 */}
        <div className="hidden md:flex flex-1 items-center justify-center px-2 relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-amber-500/40 via-[#F5B82E] to-[#004B87]/40 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#F5B82E]" />
          </div>
        </div>

        {/* Node 3: Laboratorio IA Soberano */}
        <div className="flex flex-col items-center text-center space-y-2 max-w-[160px]">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#06233B] border-2 border-[#B5E853] shadow-sm text-[#B5E853]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#004B87] dark:text-[#B5E853] tracking-wider">Laboratorio IA</span>
            <h5 className="font-bold text-xs text-[#06233B] dark:text-white">Anclaje Estricto</h5>
          </div>
        </div>

        {/* Connector 3 */}
        <div className="hidden md:flex flex-1 items-center justify-center px-2 relative">
          <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/40 via-emerald-500 to-emerald-500/40 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Node 4: Aprobación de Custodio */}
        <div className="flex flex-col items-center text-center space-y-2 max-w-[160px]">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 shadow-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">Publicación</span>
            <h5 className="font-bold text-xs text-[#06233B] dark:text-white">Aprobado por Custodio</h5>
          </div>
        </div>

      </div>

      <div className="mt-5 pt-3 border-t border-slate-200 dark:border-[#1E3E54] text-center text-[11px] text-slate-600 dark:text-slate-300">
        Flujo de soberanía: <strong className="text-[#06233B] dark:text-white">Ningún conocimiento se procesa con IA ni se publica sin la autorización de la comunidad titular.</strong>
      </div>
    </div>
  );
};
