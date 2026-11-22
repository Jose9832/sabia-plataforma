import React from 'react';
import { useAluna } from '../context/AlunaContext';
import { 
  ShieldCheck, 
  BookOpen, 
  Mail, 
  Building2
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { currentUser, knowledgeItems, accessRequests } = useAluna();

  const myContributions = knowledgeItems.filter(k => k.authorUserId === currentUser.id);
  const myRequests = accessRequests.filter(r => r.userId === currentUser.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <img 
          src={currentUser.avatar} 
          alt={currentUser.name} 
          className="w-24 h-24 rounded-full object-cover border-4 border-[#004B87]/30 dark:border-aluna-cyan/40 shadow-sm"
        />

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
            <div>
              <h1 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
                {currentUser.name}
              </h1>
              <p className="text-xs text-[#005A8D] dark:text-aluna-cyan font-bold">
                {currentUser.roleLabel}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-aluna-cyan/30">
              {currentUser.roleLabel}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
            {currentUser.bio}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#005A8D] dark:text-aluna-cyan" />
              <span>{currentUser.email}</span>
            </span>

            {currentUser.organization && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#005A8D] dark:text-aluna-cyan" />
                <span>{currentUser.organization}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Affiliation & Permission Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#004B87] dark:text-aluna-cyan font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Filiaciones y Pertenencia Territorial</span>
          </div>
          {currentUser.affiliations.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">Sin filiaciones territoriales registradas.</p>
          ) : (
            <div className="space-y-2">
              {currentUser.affiliations.map(a => (
                <div key={a.communityId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
                  <span className="font-bold text-[#06233B] dark:text-white">{a.communityName}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    a.status === 'verified'
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                  }`}>
                    {a.role === 'custodian' ? 'Custodia Autorizada' : a.status === 'verified' ? 'Integrante Verificado' : 'En Validación'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-[#004B87] dark:text-aluna-cyan font-bold">
            <BookOpen className="w-4 h-4" />
            <span>Actividad en ALUNA</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            • <strong className="text-[#06233B] dark:text-white">{myContributions.length}</strong> saberes o prácticas aportadas.<br />
            • <strong className="text-[#06233B] dark:text-white">{myRequests.length}</strong> solicitudes de acceso gestionadas.
          </p>
        </div>
      </div>

      {/* Contributions list */}
      {myContributions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
            Saberes Aportados por Ti ({myContributions.length})
          </h3>
          <div className="space-y-2">
            {myContributions.map(k => (
              <div key={k.id} className="p-4 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] flex items-center justify-between text-xs shadow-sm">
                <div>
                  <h4 className="font-bold text-[#06233B] dark:text-white">{k.title}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{k.communityNames.join(' • ')} · {k.date}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  k.status === 'approved' 
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' 
                    : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                }`}>
                  {k.status === 'approved' ? 'Aprobado' : 'En revisión'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
