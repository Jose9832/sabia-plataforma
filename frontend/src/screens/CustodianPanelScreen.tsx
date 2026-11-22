import React, { useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { accessService } from '../services/accessService';
import { canCustodianReviewResource } from '../domain/authorization';
import { 
  ShieldCheck, 
  CheckCircle2, 
  KeyRound, 
  Sparkles, 
  Users, 
  FileText, 
  Shield,
  Bot,
  Ban
} from 'lucide-react';

export const CustodianPanelScreen: React.FC = () => {
  const { 
    currentUser, 
    switchUser,
    accessRequests, 
    approveAccessRequest, 
    rejectAccessRequest, 
    affiliationRequests,
    approveAffiliation,
    rejectAffiliation,
    knowledgeItems,
    approveKnowledgeItem,
    rejectKnowledgeItem,
    grantAIPermissionToKnowledge,
    revokeAIPermissionFromKnowledge,
    aiArtifacts,
    approveAIArtifact,
    rejectAIArtifact,
    demoModeEnabled
  } = useAluna();

  const [activeTab, setActiveTab] = useState<'ai_drafts' | 'saberes' | 'access' | 'affiliations' | 'ai_permissions'>('ai_drafts');

  // Verified custodian affiliations only
  const custodianAffiliations = currentUser.affiliations.filter(
    a => a.role === 'custodian' && a.status === 'verified'
  );
  const isCustodian = custodianAffiliations.length > 0;
  const custodianCommunityIds = custodianAffiliations.map(a => a.communityId);

  // P0.2: Strictly filtered queues using centralized canCustodianReviewResource via accessService
  const pendingAccess = accessService.listPendingAccessRequestsForCustodian(currentUser, accessRequests);
  const pendingAffiliations = accessService.listPendingAffiliationsForCustodian(currentUser, affiliationRequests);
  const pendingSaberes = accessService.listPendingKnowledgeForCustodian(currentUser, knowledgeItems);
  const pendingAI = accessService.listPendingAIDerivativesForCustodian(currentUser, aiArtifacts);

  // Community knowledge items managed by this custodian (for AI permission revocation/granting)
  const custodianKnowledges = knowledgeItems.filter(k => canCustodianReviewResource(currentUser, k));

  const totalPending = pendingAccess.length + pendingAffiliations.length + pendingSaberes.length + pendingAI.length;

  if (!isCustodian) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center shadow-sm">
          <Shield className="w-8 h-8" />
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Acceso Exclusivo para Custodias Territoriales
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
          Actualmente estás navegando como <strong className="text-[#06233B] dark:text-white">{currentUser.name} ({currentUser.roleLabel})</strong>. El Panel de Custodia está reservado para las autoridades acreditadas de cada comunidad o territorio.
        </p>

        {demoModeEnabled && (
          <>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-xs text-left space-y-2 shadow-sm">
              <p className="font-bold text-[#004B87] dark:text-aluna-cyan">Verificación de aislamiento entre custodias (Entorno de demostración):</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Cambia al perfil de <strong className="text-[#06233B] dark:text-white">Mamo Senen (Sierra Nevada)</strong>, <strong className="text-[#06233B] dark:text-white">Faustina Palacios (Litoral Afrocaribe)</strong> o <strong className="text-[#06233B] dark:text-white">Patrón Marino Vásquez (Taganga)</strong> para comprobar que cada custodio solo ve y aprueba los trámites y borradores de IA de su propia comunidad.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => switchUser('user_custodian_sierra')}
                className="px-5 py-2.5 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors"
              >
                Cambiar a Mamo Senen (Custodio Sierra)
              </button>
              <button
                onClick={() => switchUser('user_custodian_afro')}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-[#132C3E] hover:bg-slate-50 text-[#06233B] dark:text-white border border-slate-300 dark:border-[#1E3E54] font-bold text-xs shadow-sm transition-colors"
              >
                Cambiar a Faustina Palacios (Custodia Afro)
              </button>
              <button
                onClick={() => switchUser('user_member_pesca')}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-[#132C3E] hover:bg-slate-50 text-[#06233B] dark:text-white border border-slate-300 dark:border-[#1E3E54] font-bold text-xs shadow-sm transition-colors"
              >
                Cambiar a Patrón Marino (Custodio Taganga)
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E3E54] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-aluna-cyan/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
              Gobernanza y Aislamiento Territorial
            </span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
            Panel de Custodia: {custodianAffiliations.map(a => a.communityName).join(', ')}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Autoridad activa: <strong className="text-[#06233B] dark:text-white">{currentUser.name}</strong> · Solo se muestran y gestionan recursos donde tu comunidad es titular.
          </p>
        </div>

        {/* Separate Counters Summary */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-700 font-bold text-purple-900 dark:text-purple-200">
            Derivados IA: {pendingAI.length}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700 font-bold text-amber-900 dark:text-amber-200">
            Saberes: {pendingSaberes.length}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-700 font-bold text-[#004B87] dark:text-sky-200">
            Accesos: {pendingAccess.length}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 font-bold text-emerald-900 dark:text-emerald-200">
            Filiaciones: {pendingAffiliations.length}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#06233B] text-white font-bold">
            Total pendientes: {totalPending}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-[#1E3E54] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ai_drafts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors border ${
            activeTab === 'ai_drafts'
              ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
              : 'bg-white dark:bg-[#0D212E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Derivados de IA ({pendingAI.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saberes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors border ${
            activeTab === 'saberes'
              ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
              : 'bg-white dark:bg-[#0D212E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Saberes en Revisión ({pendingSaberes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('access')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors border ${
            activeTab === 'access'
              ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
              : 'bg-white dark:bg-[#0D212E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Solicitudes de Acceso ({pendingAccess.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors border ${
            activeTab === 'affiliations'
              ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
              : 'bg-white dark:bg-[#0D212E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Filiaciones Comunitarias ({pendingAffiliations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors border ${
            activeTab === 'ai_permissions'
              ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
              : 'bg-white dark:bg-[#0D212E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Control y Revocación IA ({custodianKnowledges.length})</span>
        </button>
      </div>

      {/* TAB 1: DERIVADOS IA (Strictly isolated by communityIds) */}
      {activeTab === 'ai_drafts' && (
        <div className="space-y-4">
          {pendingAI.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-center space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-[#06233B] dark:text-white">
                No hay derivados de tu comunidad esperando revisión.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Los borradores de otras comunidades están aislados y no aparecen en tu bandeja.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAI.map(art => (
                <div key={art.id} className="p-6 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                          Borrador IA · Pendiente de Custodia
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-[#1E3E54]">
                          Comunidad Titular: {art.communityName}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Solicitado por: <strong className="text-[#06233B] dark:text-white">{art.authorName}</strong> · Saber fuente: <strong className="text-[#06233B] dark:text-white">{art.knowledgeTitle}</strong> · {art.generatedAt}
                      </p>
                    </div>
                  </div>

                  {art.transformMeta && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 dark:bg-[#0A1924] p-3 rounded-xl border border-slate-200 dark:border-[#1E3E54]">
                      <div><span className="text-slate-500">Público:</span> <strong className="text-[#06233B] dark:text-white">{art.transformMeta.audience}</strong></div>
                      <div><span className="text-slate-500">Nivel:</span> <strong className="text-[#06233B] dark:text-white">{art.transformMeta.level}</strong></div>
                      <div><span className="text-slate-500">Formato:</span> <strong className="text-[#06233B] dark:text-white">{art.transformMeta.format}</strong></div>
                      <div><span className="text-slate-500">Idioma:</span> <strong className="text-[#06233B] dark:text-white">{art.transformMeta.language}</strong></div>
                    </div>
                  )}

                  <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#0A1924] p-4 rounded-xl border border-slate-200 dark:border-[#1E3E54] leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200">
                    Este material fue generado con apoyo de IA y permanece como borrador (`public = false`). No puede publicarse ni presentarse como contenido comunitario validado hasta completar tu revisión como custodio.
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => rejectAIArtifact(art.id, 'Rechazado por la custodia: requiere ajustes conceptuales antes de divulgación.')}
                      className="px-4 py-2 rounded-full text-rose-700 dark:text-rose-400 border border-rose-300 hover:bg-rose-50 font-bold text-xs transition-colors"
                    >
                      Rechazar derivado
                    </button>
                    <button
                      onClick={() => approveAIArtifact(art.id, 'Revisado y aprobado por la custodia territorial conforme con la fuente original.')}
                      className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      Aprobar derivado para {art.communityName}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SABERES EN REVISIÓN (Supports unanimous multi-community approval) */}
      {activeTab === 'saberes' && (
        <div className="space-y-4">
          {pendingSaberes.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-center space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-[#06233B] dark:text-white">
                No tienes aportes de saberes pendientes de revisión en tu comunidad.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSaberes.map(k => {
                const isMulti = k.communityIds.length > 1;
                const matchingCommId = k.communityIds.find(id => custodianCommunityIds.includes(id)) || k.communityIds[0];
                const matchingCommName = k.communityNames[k.communityIds.indexOf(matchingCommId)] || 'tu comunidad';

                return (
                  <div key={k.id} className="p-6 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                            Pendiente de Aprobación
                          </span>
                          {isMulti && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                              Saber Mancomunado ({k.communityIds.length} comunidades · Requiere unanimidad)
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
                          {k.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Aportado por <strong className="text-[#06233B] dark:text-white">{k.author}</strong> ({k.authorRole}) · {k.date}
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Visibilidad solicitada</span>
                        <span className="font-bold text-[#004B87] dark:text-aluna-cyan capitalize">{k.permissions.consultation}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0A1924] p-4 rounded-xl border border-slate-200 dark:border-[#1E3E54]">
                      {k.description}
                    </p>

                    {/* Unanimous Consensus Status if Multi-Community */}
                    {isMulti && (
                      <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 space-y-2 text-xs">
                        <span className="font-bold text-purple-900 dark:text-purple-200 block text-[11px]">
                          Estado de unanimidad comunitaria (requiere aprobación de todas las comunidades titulares):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {k.approvals.map(app => (
                            <div key={app.communityId} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#0A1924] border border-purple-200 dark:border-purple-500/20 text-[11px]">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{app.communityName}:</span>
                              <span className={`font-bold ${
                                app.status === 'approved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                              }`}>
                                {app.status === 'approved' ? '✓ Aprobado' : '⏳ Pendiente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-[#1E3E54] text-xs">
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                        Tu decisión como custodio de: <strong className="text-[#06233B] dark:text-white">{matchingCommName}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => rejectKnowledgeItem(k.id, matchingCommId, 'Aporte no alineado con las directrices territoriales.')}
                          className="px-4 py-2 rounded-full text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold transition-colors"
                        >
                          Declinar
                        </button>
                        <button
                          onClick={() => approveKnowledgeItem(k.id, matchingCommId, 'Autorizado por la custodia territorial.')}
                          className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm"
                        >
                          Aprobar para {matchingCommName}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SOLICITUDES DE ACCESO */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          {pendingAccess.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-center space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-[#06233B] dark:text-white">
                No tienes solicitudes pendientes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAccess.map(r => (
                <div key={r.id} className="p-6 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#06233B] dark:text-white">
                        Saber: {r.knowledgeTitle}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Solicitante: <strong className="text-[#06233B] dark:text-white">{r.userName}</strong> ({r.userRole}) · {r.requestDate}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      Pendiente
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] text-xs space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block text-[10px] uppercase">
                      Propósito académico manifestado:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 italic">"{r.purpose}"</p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => rejectAccessRequest(r.id, 'No autorizado en este ciclo.')}
                      className="px-4 py-2 rounded-full text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 hover:bg-rose-50 font-bold text-xs"
                    >
                      Declinar solicitud
                    </button>
                    <button
                      onClick={() => approveAccessRequest(r.id, 'Permiso de acceso (access_grant) otorgado para consulta respetuosa.')}
                      className="px-5 py-2 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      Otorgar permiso de acceso
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FILIACIONES */}
      {activeTab === 'affiliations' && (
        <div className="space-y-4">
          {pendingAffiliations.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-center space-y-2 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-[#06233B] dark:text-white">
                No hay solicitudes de filiación comunitaria pendientes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAffiliations.map(a => (
                <div key={a.id} className="p-6 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-3 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#06233B] dark:text-white">
                        Solicitante: {a.userName}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Comunidad: {a.communityName} · Fecha: {a.requestDate}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-[#0A1924] p-3 rounded-xl border border-slate-200 dark:border-[#1E3E54]">
                    Fundamento: "{a.rationale}"
                  </p>
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => rejectAffiliation(a.id)}
                      className="px-4 py-2 rounded-full text-rose-700 dark:text-rose-400 border border-rose-300 font-bold text-xs"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => approveAffiliation(a.id)}
                      className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Verificar como integrante
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONTROL Y REVOCACIÓN DE PERMISOS DE IA (P0.4 & P1) */}
      {activeTab === 'ai_permissions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-[#0D212E] border border-sky-200 dark:border-[#1E3E54] text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-[#06233B] dark:text-white">Revocación soberana en tiempo real:</strong> Como custodio de tu territorio, puedes habilitar o revocar en cualquier momento el permiso para que <strong>Ceiba</strong> consulte o transforme un saber de tu comunidad. Un permiso revocado bloquea inmediatamente nuevas consultas y generaciones.
          </div>

          <div className="space-y-3">
            {custodianKnowledges.map(k => {
              const isRevoked = Boolean(k.permissions.revokedAt);
              const isAiAllowed = k.permissions.aiQueryAllowed !== 'none' && !isRevoked;

              return (
                <div key={k.id} className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-[#06233B] dark:text-white">{k.title}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isAiAllowed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isRevoked ? 'Permiso IA Revocado' : isAiAllowed ? 'Ceiba Habilitada' : 'Ceiba Bloqueada'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Lectura: <strong className="capitalize">{k.permissions.consultation}</strong> · Política IA: <strong>{k.permissions.aiQueryAllowed}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAiAllowed ? (
                      <button
                        onClick={() => revokeAIPermissionFromKnowledge(k.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-bold text-xs transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Revocar permiso de Ceiba</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => grantAIPermissionToKnowledge(k.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Habilitar permiso de Ceiba</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
