import React, { useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { 
  Building, 
  ShieldCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const MyCommunityScreen: React.FC = () => {
  const { 
    currentUser, 
    communities, 
    knowledgeItems, 
    accessRequests, 
    affiliationRequests,
    aiArtifacts,
    approveAccessRequest,
    rejectAccessRequest,
    approveAIArtifact,
    rejectAIArtifact,
    isUserCustodianOfCommunity,
    setActiveScreen,
    setSelectedKnowledgeIdForLab
  } = useAluna();

  // P0.1: Derive strictly from VERIFIED memberships of currentUser
  const userAffiliations = currentUser.affiliations.filter(a => a.status === 'verified');
  const [selectedCommId, setSelectedCommId] = useState<string>(
    userAffiliations[0]?.communityId || ''
  );

  // Synchronous derivation prevents any 1-frame flash of a previous user's community
  const effectiveCommId = userAffiliations.some(a => a.communityId === selectedCommId)
    ? selectedCommId
    : (userAffiliations[0]?.communityId || '');

  const activeCommunity = communities.find(c => c.id === effectiveCommId) || null;

  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'members' | 'knowledge' | 'governance'>('overview');

  // If user has no verified affiliations (e.g. Visitor Sofía or Pending Researcher Carlos)
  if (userAffiliations.length === 0 || !activeCommunity) {
    const hasPending = currentUser.affiliations.some(a => a.status === 'pending');
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 font-sans">
        <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan mx-auto flex items-center justify-center border border-sky-200 dark:border-aluna-cyan/40 shadow-sm">
          <Building className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-widest">
            Gobernanza Comunitaria Descentralizada
          </span>
          <h2 className="font-serif font-bold text-3xl text-[#06233B] dark:text-white">
            Mi Territorio · Decisiones Comunitarias
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Actualmente navegas como <strong className="text-[#06233B] dark:text-white">{currentUser.name} ({currentUser.roleLabel})</strong> y{' '}
            {hasPending
              ? 'tu solicitud de vinculación aún se encuentra pendiente de validación por la custodia territorial.'
              : 'no cuentas con membresía verificada en ningún territorio específico.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0D212E] max-w-lg mx-auto border border-slate-200 dark:border-[#1E3E54] text-left text-xs space-y-3 shadow-sm">
          <p className="font-bold text-[#06233B] dark:text-white">Principio de autonomía y aislamiento territorial:</p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            En ALUNA — SABIA ningún usuario externo o con filiación en trámite puede acceder al espacio interno de decisiones de una comunidad. Cada territorio gobierna sus propios saberes y permisos.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveScreen('communities')}
              className="flex-1 py-2.5 px-4 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs transition-colors text-center shadow-sm"
            >
              Explorar Comunidades para Vincularme
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCustodianHere = isUserCustodianOfCommunity(currentUser.id, activeCommunity.id);

  // Strictly scoped community items
  const communityKnowledge = knowledgeItems.filter(k => k.communityIds.includes(activeCommunity.id));
  const pendingRequests = accessRequests.filter(r => r.communityId === activeCommunity.id && r.status === 'pending');
  const pendingAffiliations = affiliationRequests.filter(r => r.communityId === activeCommunity.id && r.status === 'pending');
  const pendingCommunityAI = aiArtifacts.filter(
    a => a.status === 'draft_pending_review' && a.communityIds.includes(activeCommunity.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E3E54] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 dark:bg-aluna-cyan/15 text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-aluna-cyan/30">
              <Building className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
              Espacio Territorial Verificado
            </span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
            Mi Territorio: {activeCommunity.name}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Espacio de autogestión y soberanía de datos para integrantes verificados de <strong className="text-[#06233B] dark:text-white">{activeCommunity.name}</strong>.
          </p>
        </div>

        {/* Community switcher if user has more than 1 verified affiliation */}
        {userAffiliations.length > 1 && (
          <div className="flex items-center gap-2 bg-white dark:bg-[#0D212E] p-2 rounded-2xl border border-slate-200 dark:border-[#1E3E54] shadow-sm">
            <label htmlFor="territory-select" className="text-xs text-slate-500 dark:text-slate-400">
              Territorio activo:
            </label>
            <select
              id="territory-select"
              value={effectiveCommId}
              onChange={(e) => setSelectedCommId(e.target.value)}
              className="bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-bold text-xs p-1.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] outline-none"
            >
              {userAffiliations.map(a => (
                <option key={a.communityId} value={a.communityId}>
                  {a.communityName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hero Banner of This Community */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] shadow-sm">
        <div className="h-52 sm:h-64 w-full relative bg-slate-900">
          <img 
            src={activeCommunity.photoUrl} 
            alt={activeCommunity.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06233B]/90 via-[#06233B]/35 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 space-y-4 bg-white dark:bg-[#0D212E]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-[#132C3E] border border-sky-200 dark:border-[#1E3E54] text-[#004B87] dark:text-aluna-cyan">
              {activeCommunity.region}
            </span>

            {isCustodianHere ? (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ejerces funciones de Custodia en este Territorio</span>
              </span>
            ) : (
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-aluna-cyan/20 text-[#004B87] dark:text-aluna-cyan-300 border border-sky-200 dark:border-aluna-cyan/40">
                Integrante Comunitario Verificado
              </span>
            )}
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#06233B] dark:text-white">
            {activeCommunity.name}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {activeCommunity.description}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1E3E54] pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Resumen Autónomo' },
          { id: 'policies', label: 'Políticas y Reglas de IA' },
          { id: 'knowledge', label: `Saberes Registrados (${communityKnowledge.length})` },
          { id: 'members', label: `Integrantes y Custodios (${activeCommunity.membersCount})` },
          { id: 'governance', label: `Trámites del Territorio (${pendingRequests.length + pendingAffiliations.length + pendingCommunityAI.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${
              activeTab === tab.id
                ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
                : 'bg-white dark:bg-[#0D212E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50 dark:hover:bg-[#132C3E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-3 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-[#F5B82E] tracking-wider">Directriz Territorial</span>
            <h4 className="font-serif font-bold text-base text-[#06233B] dark:text-white">Autonomía de Decisión</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {activeCommunity.participationGuidelines}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-3 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[#005A8D] dark:text-aluna-cyan tracking-wider">Gobernanza de Ceiba IA</span>
            <h4 className="font-serif font-bold text-base text-[#06233B] dark:text-white">Política de Procesamiento</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              Política predeterminada: <strong className="text-[#06233B] dark:text-white">{activeCommunity.policies.aiDefaultPermission}</strong>. Ningún saber de esta comunidad se utiliza para entrenar modelos externos.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-3 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">Autoridades Locales</span>
            <h4 className="font-serif font-bold text-base text-[#06233B] dark:text-white">Custodios Acreditados</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              {activeCommunity.custodians.map(c => (
                <li key={c.id}>• <strong className="text-[#06233B] dark:text-white">{c.name}</strong> ({c.title})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB: POLICIES */}
      {activeTab === 'policies' && (
        <div className="bg-white dark:bg-[#0D212E] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#1E3E54] space-y-6 text-xs shadow-sm">
          <h3 className="font-serif font-bold text-xl text-[#06233B] dark:text-white">
            Políticas de Consulta y Uso con Ceiba (Inteligencia Artificial)
          </h3>

          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54]">
              <div>
                <strong className="text-[#06233B] dark:text-white block">Aceptar aportes de investigadores externos:</strong>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Permite que investigadores propongan contenidos sujetos a revisión del custodio.</span>
              </div>
              <span className={`px-3 py-1 rounded-full font-bold ${
                activeCommunity.policies.acceptsExternalContributions ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {activeCommunity.policies.acceptsExternalContributions ? 'Habilitado' : 'Cerrado'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54]">
              <div>
                <strong className="text-[#06233B] dark:text-white block">Transformar para enseñar (Derivados con IA):</strong>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Todo material generado nace como borrador hasta la aprobación de la custodia.</span>
              </div>
              <span className="px-3 py-1 rounded-full font-bold bg-sky-100 text-[#004B87] dark:bg-aluna-cyan/20 dark:text-aluna-cyan-300">
                Borrador sujeto a revisión
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-[#0D212E] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#1E3E54] space-y-4 text-xs shadow-sm">
          <h3 className="font-serif font-bold text-xl text-[#06233B] dark:text-white">
            Autoridades y Custodios de {activeCommunity.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeCommunity.custodians.map(c => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54] flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-[#06233B] dark:text-white">{c.name}</p>
                  <p className="text-slate-600 dark:text-slate-300">{c.title}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Custodio Titular
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: KNOWLEDGE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communityKnowledge.map(k => (
              <div key={k.id} className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] space-y-3 text-xs shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-[#1E3E54]">
                      {k.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      k.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {k.status === 'approved' ? 'Aprobado' : 'En revisión'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#06233B] dark:text-white">{k.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{k.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-[#1E3E54] flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Autor: <strong className="text-[#06233B] dark:text-white">{k.author}</strong></span>
                  <button
                    onClick={() => {
                      setSelectedKnowledgeIdForLab(k.id);
                      setActiveScreen('ai_lab');
                    }}
                    className="text-[#004B87] dark:text-aluna-cyan hover:underline font-bold"
                  >
                    Pregúntale a Ceiba →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: GOVERNANCE / PENDING FOR THIS COMMUNITY ONLY */}
      {activeTab === 'governance' && (
        <div className="space-y-6 text-xs">
          {/* Pending AI Derivatives for this community */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#004B87] dark:text-aluna-cyan" />
              <span>Borradores Derivados de IA en {activeCommunity.name} ({pendingCommunityAI.length})</span>
            </h3>
            {pendingCommunityAI.length === 0 ? (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No hay derivados de tu comunidad esperando revisión.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCommunityAI.map(art => (
                  <div key={art.id} className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[#06233B] dark:text-white">{art.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300">Saber fuente: <strong>{art.knowledgeTitle}</strong> · Autor: {art.authorName}</p>
                      <p className="text-slate-500 dark:text-slate-400">{art.summary}</p>
                    </div>
                    {isCustodianHere ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => rejectAIArtifact(art.id)}
                          className="px-3.5 py-1.5 rounded-full text-rose-700 dark:text-rose-400 border border-rose-300 font-bold"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => approveAIArtifact(art.id)}
                          className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          Aprobar Derivado
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Solo la custodia de {activeCommunity.name} puede aprobar.</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Access Requests */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#1E3E54]">
            <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
              Solicitudes de Acceso a Saberes de {activeCommunity.name} ({pendingRequests.length})
            </h3>
            {pendingRequests.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-400">No tienes solicitudes pendientes para {activeCommunity.name}.</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(r => (
                  <div key={r.id} className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[#06233B] dark:text-white">{r.knowledgeTitle}</h4>
                      <p className="text-slate-600 dark:text-slate-300">Solicitante: <strong className="text-[#06233B] dark:text-white">{r.userName}</strong> ({r.userEmail})</p>
                      <p className="text-slate-500 dark:text-slate-400 italic">"{r.purpose}"</p>
                    </div>

                    {isCustodianHere ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => rejectAccessRequest(r.id)}
                          className="px-3.5 py-1.5 rounded-full text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => approveAccessRequest(r.id)}
                          className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          Aprobar Acceso
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">Solo los custodios de esta comunidad pueden autorizar.</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
