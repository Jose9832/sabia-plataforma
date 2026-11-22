import React from 'react';
import { useAluna } from '../context/AlunaContext';
import { accessService } from '../services/accessService';
import { KnowledgeCard } from '../components/common/KnowledgeCard';
import { KnowledgeItem } from '../types';
import { 
  Compass, 
  BookOpen, 
  ShieldCheck, 
  UploadCloud, 
  ArrowRight, 
  Clock, 
  Lock, 
  Unlock, 
  Flower2,
  GraduationCap,
  Eye,
  Shield,
  Users,
  Bot,
  MapPin
} from 'lucide-react';

interface DashboardScreenProps {
  onOpenKnowledge: (k: KnowledgeItem) => void;
  onRequestAccess: (k: KnowledgeItem) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenKnowledge,
  onRequestAccess
}) => {
  const { 
    currentUser, 
    communities, 
    knowledgeItems, 
    accessRequests, 
    affiliationRequests,
    aiArtifacts,
    canUserRead, 
    setActiveScreen,
    setSelectedCommunityId
  } = useAluna();

  // Filter items accessible by the current user
  const accessibleItems = knowledgeItems.filter(k => canUserRead(k).allowed && k.status === 'approved');
  const restrictedItemsCount = knowledgeItems.filter(k => !canUserRead(k).allowed).length;

  // Requests involving current user
  const userAccessRequests = accessRequests.filter(r => r.userId === currentUser.id);

  // Check if current user is custodian of any community
  const custodianAffiliations = currentUser.affiliations.filter(a => a.role === 'custodian' && a.status === 'verified');
  const isCustodian = custodianAffiliations.length > 0;
  
  // P0.2: Strictly scoped custodian pending counts via accessService
  const pendingCustodianAccess = accessService.listPendingAccessRequestsForCustodian(currentUser, accessRequests);
  const pendingCustodianAI = accessService.listPendingAIDerivativesForCustodian(currentUser, aiArtifacts);
  const pendingCustodianSaberes = accessService.listPendingKnowledgeForCustodian(currentUser, knowledgeItems);
  const pendingCustodianAffiliations = accessService.listPendingAffiliationsForCustodian(currentUser, affiliationRequests);
  const totalCustodianPending =
    pendingCustodianAccess.length +
    pendingCustodianAI.length +
    pendingCustodianSaberes.length +
    pendingCustodianAffiliations.length;

  const getRoleBadge = () => {
    switch (currentUser.identity) {
      case 'visitor':
        return {
          icon: <Eye className="w-3.5 h-3.5 text-sky-300" />,
          label: 'Visitante (Consulta Pública)',
          desc: 'Tienes acceso a relatos y saberes aprobados para divulgación general abierta.'
        };
      case 'student':
      case 'researcher':
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />,
          label: currentUser.roleLabel || 'Investigador / Estudiante',
          desc: 'Puedes consultar materiales públicos y tramitar solicitudes de acceso (access_grant) con propósitos académicos o pedagógicos.'
        };
      case 'community_member':
      case 'org_representative':
      default:
        if (isCustodian) {
          return {
            icon: <Shield className="w-3.5 h-3.5 text-[#F5B82E]" />,
            label: `Custodio Territorial (${custodianAffiliations.map(a => a.communityName).join(', ')})`,
            desc: 'Administras exclusivamente la custodia de tu territorio, apruebas solicitudes de acceso y revisas borradores generados con Ceiba.'
          };
        }
        return {
          icon: <Flower2 className="w-3.5 h-3.5 text-[#F5B82E]" />,
          label: currentUser.roleLabel || 'Integrante Comunitario Verificado',
          desc: 'Acceso a los saberes internos de tu comunidad verificada, consulta en Ceiba y transformación pedagógica.'
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Welcome Banner Personalized by User */}
      <section className="bg-gradient-to-br from-[#06233B] via-[#092E4C] to-[#051815] text-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 dark:border-[#1E3E54] relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20 text-sky-200">
            {roleInfo.icon}
            <span>{roleInfo.label}</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight leading-snug text-white">
            Bienvenido/a a ALUNA — SABIA, {currentUser.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {roleInfo.desc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveScreen('library')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B5E853] hover:bg-[#A3E635] text-[#061A17] font-bold text-xs transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Ver mis saberes disponibles ({accessibleItems.length})</span>
            </button>

            {isCustodian ? (
              <button
                onClick={() => setActiveScreen('custodian')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5B82E] hover:bg-[#E0A61F] text-[#06233B] font-bold text-xs transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Panel de Custodia ({totalCustodianPending} pendientes)</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveScreen('upload')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004B87] hover:bg-[#005A9C] text-white font-bold text-xs transition-colors shadow-sm border border-sky-400/30"
              >
                <UploadCloud className="w-4 h-4 text-sky-200" />
                <span>Aportar un saber</span>
              </button>
            )}

            <button
              onClick={() => setActiveScreen('my_community')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20"
            >
              <Users className="w-4 h-4" />
              <span>Mi Territorio</span>
            </button>
          </div>

        </div>
      </section>

      {/* Stats and Access Transparency Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200/90 dark:border-[#1E3E54] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Unlock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#06233B] dark:text-white">
              {accessibleItems.length}
            </span>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Saberes autorizados</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200/90 dark:border-[#1E3E54] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-orange-500/15 border border-amber-200 dark:border-orange-500/30 text-amber-700 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#06233B] dark:text-white">
              {restrictedItemsCount}
            </span>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Saberes reservados</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200/90 dark:border-[#1E3E54] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-aluna-cyan/15 border border-sky-200 dark:border-aluna-cyan/30 text-[#004B87] dark:text-aluna-cyan flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#06233B] dark:text-white">
              {communities.length}
            </span>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Espacios comunitarios</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200/90 dark:border-[#1E3E54] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-serif font-bold text-[#06233B] dark:text-white">
              {isCustodian ? pendingCustodianAI.length : aiArtifacts.length}
            </span>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isCustodian ? 'Borradores IA de tu comunidad' : 'Derivados de IA en sistema'}
            </p>
          </div>
        </div>

      </section>

      {/* Role-Specific Alert / Notifications */}
      {currentUser.identity === 'researcher' && userAccessRequests.length > 0 && (
        <section className="p-4 rounded-2xl bg-sky-50 dark:bg-blue-950/60 border border-sky-200 dark:border-blue-500/40 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#004B87] dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[#06233B] dark:text-white">
                Tienes {userAccessRequests.length} solicitud(es) de acceso en trámite:
              </p>
              <ul className="mt-1 space-y-0.5 text-slate-700 dark:text-blue-200">
                {userAccessRequests.map(r => (
                  <li key={r.id}>
                    • <strong>{r.knowledgeTitle}</strong> — Estado:{' '}
                    <span className={`font-bold ${r.status === 'approved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      {r.status === 'approved' ? 'Aprobada (Permiso otorgado)' : 'Pendiente de custodio'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('requests')}
            className="text-[#004B87] dark:text-aluna-cyan font-bold hover:underline shrink-0 text-[11px]"
          >
            Ver solicitudes
          </button>
        </section>
      )}

      {isCustodian && totalCustodianPending > 0 && (
        <section className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/50 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-950 dark:text-white">
                Atención Custodia ({custodianAffiliations.map(a => a.communityName).join(', ')}): Tienes {totalCustodianPending} trámite(s) pendientes ({pendingCustodianAI.length} derivados IA, {pendingCustodianSaberes.length} saberes, {pendingCustodianAccess.length} accesos, {pendingCustodianAffiliations.length} filiaciones).
              </p>
              <p className="text-amber-800 dark:text-amber-200 mt-0.5 text-[11px]">
                Bandeja estrictamente aislada: solo recibes solicitudes y borradores de tu comunidad titular.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveScreen('custodian')}
            className="px-3.5 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Revisar en Custodia
          </button>
        </section>
      )}

      {/* Featured Accessible Knowledge Cards */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#005A8D] dark:text-aluna-cyan">
              Repositorio Activo
            </span>
            <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
              Saberes que puedes consultar ahora
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Contenidos accesibles según tus permisos actuales como <strong>{currentUser.roleLabel}</strong>.
            </p>
          </div>

          <button
            onClick={() => setActiveScreen('library')}
            className="text-xs font-bold text-[#004B87] dark:text-aluna-cyan flex items-center gap-1 hover:underline"
          >
            <span>Ver toda la biblioteca</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleItems.slice(0, 3).map((item) => (
            <KnowledgeCard
              key={item.id}
              knowledge={item}
              onOpen={onOpenKnowledge}
              onRequestAccess={onRequestAccess}
            />
          ))}
        </div>
      </section>

      {/* Communities Directory Preview (No bottom text overlay on images & no truncated custodian names) */}
      <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-[#1E3E54]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#005A8D] dark:text-aluna-cyan">
              Territorios
            </span>
            <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
              Espacios Comunitarios Participantes
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Comunidades del territorio representadas en el entorno de demostración de SABIA.
            </p>
          </div>

          <button
            onClick={() => setActiveScreen('communities')}
            className="text-xs font-bold text-[#004B87] dark:text-aluna-cyan flex items-center gap-1 hover:underline"
          >
            <span>Explorar las 5 comunidades</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.slice(0, 3).map((comm) => (
            <div
              key={comm.id}
              onClick={() => {
                setSelectedCommunityId(comm.id);
                setActiveScreen('community_detail');
              }}
              className="bg-white dark:bg-[#0D212E] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-[#1E3E54] hover:border-[#004B87] dark:hover:border-aluna-cyan/50 shadow-sm transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden relative bg-slate-900">
                  <img 
                    src={comm.photoUrl} 
                    alt={comm.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 space-y-2">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#005A8D] dark:text-aluna-cyan">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{comm.region}</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#06233B] dark:text-white">
                    {comm.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {comm.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#1E3E54]">
                <span>Custodia: <strong className="text-[#06233B] dark:text-white">{comm.custodians.map(c => c.name).join(', ')}</strong></span>
                <span className="font-bold text-[#004B87] dark:text-aluna-cyan">Ver espacio →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct CEIBA Callout */}
      <section className="bg-[#06233B] dark:bg-[#0D212E] text-white rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1E3E54] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-[#F5B82E] text-xs font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Módulo Destacado · CEIBA & Laboratorio</span>
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
            Pregúntale a Ceiba y transforma saberes autorizados para enseñar
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            Consulta con citas verificables al fragmento original y transforma saberes autorizados en guías o explicaciones pedagógicas que nacen como borrador sujeto a revisión del custodio.
          </p>
        </div>

        <button
          onClick={() => setActiveScreen('ai_lab')}
          className="px-6 py-3.5 rounded-full bg-[#B5E853] hover:bg-[#A3E635] text-[#061A17] font-bold text-xs shrink-0 shadow-sm transition-colors flex items-center gap-2"
        >
          <Bot className="w-4 h-4" />
          <span>Pregúntale a Ceiba</span>
        </button>
      </section>

    </div>
  );
};
