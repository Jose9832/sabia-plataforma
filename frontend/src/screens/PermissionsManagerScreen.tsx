import React, { useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { 
  Lock, 
  Unlock, 
  Bot, 
  Users, 
  CheckCircle2, 
  Info
} from 'lucide-react';

export const PermissionsManagerScreen: React.FC = () => {
  const { knowledgeItems, currentUser, canUserRead, canUserProcessWithAI } = useAluna();
  const [filterComm] = useState('all');

  const filtered = filterComm === 'all' 
    ? knowledgeItems 
    : knowledgeItems.filter(k => k.communityIds.includes(filterComm));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
          Gobernanza y Privacidad
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
          Gestión de Permisos y Soberanía Comunitaria
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Gobernanza comunitaria transparente. Consulta la matriz granular de lectura, descarga, procesamiento de inteligencia artificial y generación de derivados asignada a cada saber del territorio.
        </p>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-[#0D212E] border border-sky-200 dark:border-[#1E3E54] flex items-start gap-3.5 text-xs">
        <Info className="w-5 h-5 text-[#004B87] dark:text-aluna-cyan shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#06233B] dark:text-white">
            ¿Cómo funciona el control de acceso en ALUNA?
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            A diferencia de plataformas convencionales que asumen que la información es libre para descargar y entrenar algoritmos, ALUNA condiciona de forma independiente cada lectura y cada inferencia con IA al consentimiento explícito de la comunidad titular.
          </p>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white dark:bg-[#0D212E] rounded-3xl border border-slate-200/90 dark:border-[#1E3E54] shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-slate-200 dark:border-[#1E3E54] flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
            Matriz de Permisos por Saber ({filtered.length} registrados)
          </h2>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Reglas evaluadas en memoria para el usuario activo: <strong className="text-[#004B87] dark:text-aluna-cyan">{currentUser.name}</strong> ({currentUser.roleLabel})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-aluna-cyan uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-[#1E3E54]">
              <tr>
                <th className="py-3.5 px-4">Saber y Comunidad</th>
                <th className="py-3.5 px-4">Visibilidad / Lectura</th>
                <th className="py-3.5 px-4">Descarga</th>
                <th className="py-3.5 px-4">Política de IA</th>
                <th className="py-3.5 px-4">Custodia Responsable</th>
                <th className="py-3.5 px-4">Tu Acceso Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-[#1E3E54]">
              {filtered.map((item) => {
                const readCheck = canUserRead(item);
                const aiCheck = canUserProcessWithAI(item);
                const custodians = item.approvals.map(a => a.custodianName).filter(Boolean).join(', ') || 'Custodia comunitaria';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-[#132C3E]/50 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#06233B] dark:text-white line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.communityNames.join(' • ')} · Por: {item.author}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.permissions.consultation === 'public'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                          : item.permissions.consultation === 'community'
                          ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700'
                          : item.permissions.consultation === 'restricted'
                          ? 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700'
                          : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700'
                      }`}>
                        {item.permissions.consultation === 'public' && <Unlock className="w-3 h-3" />}
                        {item.permissions.consultation === 'community' && <Users className="w-3 h-3" />}
                        {item.permissions.consultation === 'restricted' && <Lock className="w-3 h-3" />}
                        {item.permissions.consultation === 'private' && <Lock className="w-3 h-3" />}
                        <span className="capitalize">{item.permissions.consultation}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-bold ${item.permissions.downloadAllowed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.permissions.downloadAllowed ? '✓ Permitida' : '✗ Bloqueada'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        item.permissions.aiQueryAllowed === 'none'
                          ? 'text-rose-700 dark:text-rose-400'
                          : item.permissions.aiQueryAllowed === 'educational_query'
                          ? 'text-[#004B87] dark:text-aluna-cyan'
                          : 'text-purple-700 dark:text-purple-300'
                      }`}>
                        <Bot className="w-3.5 h-3.5" />
                        <span>
                          {item.permissions.aiQueryAllowed === 'none' && 'No permitida'}
                          {item.permissions.aiQueryAllowed === 'educational_query' && 'Consulta educativa'}
                          {item.permissions.aiQueryAllowed === 'derived_approval_required' && 'Derivados con revisión'}
                        </span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[160px]" title={custodians}>
                      {custodians}
                    </td>

                    <td className="py-3.5 px-4">
                      {readCheck.allowed ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Autorizado</span>
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                            IA: {aiCheck.allowed ? 'Habilitada' : 'Restringida'}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-800 dark:text-orange-400 font-bold text-[11px]">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Requiere solicitud</span>
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
