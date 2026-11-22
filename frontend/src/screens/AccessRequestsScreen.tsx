import React from 'react';
import { useAluna } from '../context/AlunaContext';
import { 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const AccessRequestsScreen: React.FC = () => {
  const { 
    currentUser, 
    accessRequests, 
    affiliationRequests, 
    setActiveScreen 
  } = useAluna();

  // Filter requests involving current user
  const userAccess = accessRequests.filter(r => r.userId === currentUser.id);
  const userAffiliations = affiliationRequests.filter(r => r.userId === currentUser.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-[#F5B82E]">
          Trámites y Gobernanza
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
          Mis Solicitudes de Acceso y Diálogo
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Historial y estado en tiempo real de tus peticiones para consultar saberes de custodia restringida y solicitudes de vinculación comunitaria.
        </p>
      </div>

      {/* Access Requests Section */}
      <div className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-[#06233B] dark:text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#004B87] dark:text-aluna-cyan" />
          <span>Solicitudes de Acceso a Saberes Específicos ({userAccess.length})</span>
        </h2>

        {userAccess.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-center space-y-3 shadow-sm">
            <KeyRound className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              No tienes solicitudes de acceso activas registradas con tu perfil actual.
            </p>
            <button
              onClick={() => setActiveScreen('library')}
              className="px-5 py-2.5 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs transition-colors shadow-sm"
            >
              Explorar biblioteca para solicitar acceso
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userAccess.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#06233B] dark:text-white">
                      {req.knowledgeTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-[#005A8D] dark:text-aluna-cyan">
                      ({req.communityName})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-[#06233B] dark:text-white">Propósito manifestado:</strong> {req.purpose}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fecha de envío: {req.requestDate}
                  </div>

                  {req.responseNote && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0A1924] text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E3E54]">
                      <strong className="text-[#06233B] dark:text-white">Respuesta del custodio:</strong> {req.responseNote} ({req.responseDate})
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    req.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : req.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  }`}>
                    {req.status === 'approved' && <CheckCircle2 className="w-4 h-4" />}
                    {req.status === 'rejected' && <XCircle className="w-4 h-4" />}
                    {req.status === 'pending' && <Clock className="w-4 h-4" />}
                    <span>
                      {req.status === 'approved' ? 'Acceso Autorizado' : req.status === 'rejected' ? 'Solicitud Declinada' : 'Pendiente de Custodio'}
                    </span>
                  </span>

                  {req.status === 'approved' && (
                    <button
                      onClick={() => setActiveScreen('library')}
                      className="text-xs font-bold text-[#004B87] dark:text-aluna-cyan hover:underline flex items-center gap-1"
                    >
                      <span>Abrir en biblioteca</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Affiliation Requests Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#1E3E54]">
        <h2 className="font-serif font-bold text-xl text-[#06233B] dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Solicitudes de Vinculación Comunitaria ({userAffiliations.length})</span>
        </h2>

        {userAffiliations.length === 0 ? (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            No has enviado solicitudes para vincularte a un espacio comunitario.
          </p>
        ) : (
          <div className="space-y-3">
            {userAffiliations.map(aff => (
              <div
                key={aff.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] flex items-center justify-between text-xs shadow-sm"
              >
                <div>
                  <h4 className="font-bold text-[#06233B] dark:text-white">
                    Vinculación a: {aff.communityName}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Justificación: {aff.rationale}
                  </p>
                  <span className="text-[10px] text-slate-500">Enviada: {aff.requestDate}</span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  aff.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {aff.status === 'approved' ? 'Integrante Validado' : 'Pendiente de Custodia'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
