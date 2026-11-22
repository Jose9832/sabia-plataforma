import React, { useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { Community, KnowledgeItem } from '../types';
import { KnowledgeCard } from '../components/common/KnowledgeCard';
import { 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  HeartHandshake
} from 'lucide-react';

interface CommunitiesScreenProps {
  onOpenKnowledge: (k: KnowledgeItem) => void;
  onRequestAccess: (k: KnowledgeItem) => void;
}

export const CommunitiesScreen: React.FC<CommunitiesScreenProps> = ({
  onOpenKnowledge,
  onRequestAccess
}) => {
  const { 
    communities, 
    knowledgeItems, 
    currentUser, 
    requestAffiliation, 
    selectedCommunityId,
    setSelectedCommunityId
  } = useAluna();

  const [affiliationModalComm, setAffiliationModalComm] = useState<Community | null>(null);
  const [affiliationRationale, setAffiliationRationale] = useState('');

  // Selected community detail view
  const currentComm = selectedCommunityId ? communities.find(c => c.id === selectedCommunityId) : null;

  const handleSendAffiliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliationModalComm) return;
    requestAffiliation(affiliationModalComm.id, affiliationRationale);
    setAffiliationModalComm(null);
    setAffiliationRationale('');
  };

  if (currentComm) {
    const commItems = knowledgeItems.filter(k => k.communityIds.includes(currentComm.id));
    const publicItems = commItems.filter(k => k.permissions.consultation === 'public' && k.status === 'approved');
    const restrictedItems = commItems.filter(k => k.permissions.consultation !== 'public' && k.status === 'approved');

    const userAff = currentUser.affiliations.find(a => a.communityId === currentComm.id);
    const isUserMember = userAff?.status === 'verified';
    const isUserPending = userAff?.status === 'pending';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Back Button */}
        <button
          onClick={() => setSelectedCommunityId(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#004B87] dark:text-aluna-cyan hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al explorador de comunidades</span>
        </button>

        {/* Hero Banner for this community */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0D212E] shadow-md border border-slate-200 dark:border-[#1E3E54]">
          <div className="h-56 sm:h-72 w-full relative bg-slate-900">
            <img 
              src={currentComm.photoUrl} 
              alt={currentComm.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06233B]/90 via-[#06233B]/35 to-transparent" />
          </div>

          <div className="p-6 sm:p-8 space-y-4 bg-white dark:bg-[#0D212E]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-[#132C3E] border border-sky-200 dark:border-aluna-cyan/30 text-[#004B87] dark:text-aluna-cyan">
                <MapPin className="w-3.5 h-3.5" />
                <span>{currentComm.region}</span>
              </span>

              {isUserMember ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Eres Integrante Verificado</span>
                </span>
              ) : isUserPending ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Vinculación Pendiente de Aprobación</span>
                </span>
              ) : (
                <button
                  onClick={() => setAffiliationModalComm(currentComm)}
                  className="px-4 py-2 rounded-full bg-[#004B87] hover:bg-[#003865] dark:bg-aluna-cyan dark:hover:bg-aluna-cyan-light text-white dark:text-[#061A17] font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Solicitar vinculación como integrante</span>
                </button>
              )}
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-4xl text-[#06233B] dark:text-white">
              {currentComm.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {currentComm.description}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-[#1E3E54]">
              <span>Custodia: <strong className="text-[#06233B] dark:text-white">{currentComm.custodians.map(c => c.name).join(', ')}</strong></span>
              <span>•</span>
              <span>Integrantes registrados: <strong className="text-[#06233B] dark:text-white">{currentComm.membersCount}</strong></span>
              <span>•</span>
              <span className="text-[#004B87] dark:text-aluna-cyan font-semibold">Escenario ficticio de demostración</span>
            </div>
          </div>
        </div>

        {/* Participation & Sovereignty Guidelines */}
        <div className="p-5 rounded-2xl bg-sky-50/70 dark:bg-[#0D212E] border border-sky-200 dark:border-[#1E3E54] flex items-start gap-4 text-xs">
          <div className="p-2.5 rounded-xl bg-[#004B87] text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-sm text-[#06233B] dark:text-white">
              Condiciones de Participación y Respeto Territorial
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentComm.participationGuidelines}
            </p>
          </div>
        </div>

        {/* Knowledge items belonging to this community */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E3E54] pb-3">
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
                Saberes y Memorias de {currentComm.name}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Total de {commItems.length} materiales registrados en este territorio ({publicItems.length} públicos, {restrictedItems.length} con acceso restringido o comunitario).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commItems.map(item => (
              <KnowledgeCard
                key={item.id}
                knowledge={item}
                onOpen={onOpenKnowledge}
                onRequestAccess={onRequestAccess}
              />
            ))}
          </div>
        </div>

      </div>
    );
  }

  // General Communities Directory View (P1.7 Fixed: no overlapping badges on image & no truncated custodian names)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
          Territorios y Diálogo Intercultural
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
          Explorador de Comunidades y Espacios Participantes
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Cada comunidad cuenta con sus propios custodios, normas de participación y condiciones de acceso. Los perfiles corresponden a un escenario ficticio de demostración para representar la gobernanza territorial descentralizada sin pretender representación oficial de los pueblos.
        </p>
      </div>

      {/* Grid of 5 Communities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((comm) => {
          const commItems = knowledgeItems.filter(k => k.communityIds.includes(comm.id) && k.status === 'approved');
          const userAff = currentUser.affiliations.find(a => a.communityId === comm.id);
          const isMember = userAff?.status === 'verified';
          const isPending = userAff?.status === 'pending';

          return (
            <article
              key={comm.id}
              className="bg-white dark:bg-[#0D212E] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-[#1E3E54] hover:border-[#004B87]/60 dark:hover:border-aluna-cyan/50 shadow-sm transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Photo Banner (Only single membership badge at top-right; zero overlap!) */}
                <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-900">
                  <img 
                    src={comm.photoUrl} 
                    alt={comm.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06233B]/45 via-transparent to-[#06233B]/20" />

                  {isMember && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
                      Tu Comunidad Verificada
                    </span>
                  )}
                  {isPending && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-600 text-white shadow-sm">
                      Vinculación en Trámite
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#005A8D] dark:text-aluna-cyan">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{comm.region}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white leading-snug">
                    {comm.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {comm.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {comm.tags.slice(0, 3).map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-slate-200 dark:border-[#1E3E54]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions (No truncated custodian name) */}
              <div className="p-5 pt-0 border-t border-slate-100 dark:border-[#1E3E54] mt-2 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-3">
                  <span>Custodia: <strong className="text-[#06233B] dark:text-white">{comm.custodians.map(c => c.name).join(', ')}</strong></span>
                  <span className="font-semibold text-[#004B87] dark:text-aluna-cyan shrink-0">{commItems.length} {commItems.length === 1 ? 'saber' : 'saberes'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedCommunityId(comm.id);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#004B87] hover:bg-[#003865] text-white text-xs font-bold transition-colors text-center shadow-sm"
                  >
                    Ver espacio
                  </button>

                  <button
                    onClick={() => setAffiliationModalComm(comm)}
                    disabled={isMember || isPending}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-colors border ${
                      isMember || isPending
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        : 'bg-white dark:bg-[#132C3E] border-slate-300 dark:border-aluna-cyan/40 text-[#06233B] dark:text-aluna-cyan hover:bg-slate-50 dark:hover:bg-[#193A50]'
                    }`}
                  >
                    {isMember ? 'Perteneces' : isPending ? 'En revisión' : 'Vincularme'}
                  </button>
                </div>
              </div>

            </article>
          );
        })}
      </div>

      {/* Affiliation Modal */}
      {affiliationModalComm && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white dark:bg-[#0D212E] rounded-3xl max-w-lg w-full p-6 sm:p-8 text-[#06233B] dark:text-white shadow-2xl border border-slate-200 dark:border-[#1E3E54] space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
              Solicitud de Vinculación Comunitaria
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Solicitas unirte a <strong>{affiliationModalComm.name}</strong> como integrante comunitario. La custodia revisará tu fundamentación.
            </p>
            <form onSubmit={handleSendAffiliation} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="aff-rationale" className="font-bold text-[#06233B] dark:text-slate-200 block">
                  Fundamento o lazo territorial / identitario:
                </label>
                <textarea
                  id="aff-rationale"
                  required
                  rows={3}
                  value={affiliationRationale}
                  onChange={(e) => setAffiliationRationale(e.target.value)}
                  placeholder="Describe tu vínculo o motivación con esta comunidad..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-white dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAffiliationModalComm(null)}
                  className="px-4 py-2 rounded-full font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132C3E]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold"
                >
                  Enviar a la custodia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
