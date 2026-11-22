import React, { useState, useEffect } from 'react';
import { useAluna } from '../context/AlunaContext';
import { KnowledgeItem, CeibaCitation, TransformRequest } from '../types';
import { CEIBA_MICROCOPY } from '../services/aiService';
import { AnimatedBeamFlow } from '../components/magicui/AnimatedBeam';
import { 
  Sparkles, 
  Bot, 
  MessageSquare, 
  BookMarked, 
  Send, 
  Quote, 
  HelpCircle,
  Lock,
  RotateCcw,
  Info,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Ban
} from 'lucide-react';

export const AILabScreen: React.FC = () => {
  const { 
    knowledgeItems, 
    currentUser, 
    canUserRead, 
    canUserProcessWithAI,
    selectedKnowledgeIdForLab,
    setSelectedKnowledgeIdForLab,
    createAIArtifact,
    askCeiba,
    transformWithCeiba,
    grantAIPermissionToKnowledge,
    revokeAIPermissionFromKnowledge,
    isUserCustodianOfCommunity,
    setActiveScreen
  } = useAluna();

  // Strictly filter sources that currentUser has permission to READ
  const readableItems = knowledgeItems.filter(k => canUserRead(k).allowed);

  // Active knowledge item
  const activeKnowledgeId =
    selectedKnowledgeIdForLab && readableItems.some(k => k.id === selectedKnowledgeIdForLab)
      ? selectedKnowledgeIdForLab
      : readableItems.length > 0
      ? readableItems[0].id
      : knowledgeItems[0].id;

  const activeKnowledge: KnowledgeItem =
    knowledgeItems.find(k => k.id === activeKnowledgeId) || knowledgeItems[0];

  const readPermissionCheck = canUserRead(activeKnowledge);
  const aiPermissionCheck = canUserProcessWithAI(activeKnowledge);

  // Two prioritized credible workflows (P1.4): 1. "Pregúntale a Ceiba" ('chat'), 2. "Transformar para enseñar" ('transform')
  const [activeTab, setActiveTab] = useState<'chat' | 'transform'>('chat');

  // --- Flow 1: Pregúntale a Ceiba State ---
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    supported?: boolean;
    citations?: CeibaCitation[];
    refusalReason?: string;
  }>>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [highlightedCitation, setHighlightedCitation] = useState<CeibaCitation | null>(null);

  // --- Flow 2: Transformar para enseñar State ---
  const [audience, setAudience] = useState<TransformRequest['audience']>('Jóvenes');
  const [level, setLevel] = useState<TransformRequest['level']>('Inicial');
  const [objective, setObjective] = useState(
    'Comprender los principios comunitarios, técnicos y de cuidado territorial descritos en la fuente autorizada.'
  );
  const [format, setFormat] = useState<TransformRequest['format']>('Guía de aprendizaje');
  const [language, setLanguage] = useState('Español');
  const [contextNote, setContextNote] = useState('');
  const [lastCreatedDraftId, setLastCreatedDraftId] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Re-initialize state whenever activeKnowledge changes
  useEffect(() => {
    setCurrentSlideIndex(0);
    setHighlightedCitation(null);
    setLastCreatedDraftId(null);
    setChatMessages([
      {
        sender: 'ai',
        text: CEIBA_MICROCOPY.welcome,
        supported: true
      }
    ]);
  }, [activeKnowledge.id, currentUser.id]);

  // Ceiba responde desde el servidor (POST /api/v1/ai/query), que autoriza antes de recuperar.
  // Sin conexión, responde el motor local de respaldo sobre las fuentes ya autorizadas en el teléfono.
  const handleAskCeiba = async (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg = { sender: 'user' as const, text: questionText };
    setInputQuestion('');
    const response = await askCeiba([activeKnowledge.id], questionText);

    const aiMsg = {
      sender: 'ai' as const,
      text: response.answer || CEIBA_MICROCOPY.noEvidence,
      supported: response.supported,
      citations: response.citations,
      refusalReason: response.refusalReason
    };

    setChatMessages(prev => [...prev, userMsg, aiMsg]);
  };

  // «Transformar para enseñar»: el servidor genera el borrador (POST /api/v1/ai/transform)
  const handleTransformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await transformWithCeiba(activeKnowledge, {
      knowledgeIds: [activeKnowledge.id],
      audience,
      level,
      objective,
      format,
      language,
      context: contextNote
    });

    if (!res.allowed || !res.artifact) return;

    setLastCreatedDraftId(res.artifact.id);
  };

  const isCustodianOfThisSaber = activeKnowledge.communityIds.some(cId =>
    isUserCustodianOfCommunity(currentUser.id, cId)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07131B] text-[#06233B] dark:text-slate-100 transition-colors pb-20 font-sans">
      
      {/* Top Institutional Header Banner */}
      <section className="bg-gradient-to-br from-[#06233B] via-[#092E4C] to-[#051815] text-white border-b border-slate-200 dark:border-[#1E3E54] pt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Breadcrumb (Page 35 #7) */}
          <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-1.5 text-[11px] text-sky-200/90 font-medium">
            <button onClick={() => setActiveScreen('library')} className="hover:text-white hover:underline">
              Biblioteca
            </button>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-white font-semibold truncate max-w-[260px] sm:max-w-md">
              {activeKnowledge.title}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span>Laboratorio</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            <span className="text-[#B5E853] font-bold">
              {activeTab === 'chat' ? 'Pregúntale a Ceiba' : 'Transformar para enseñar'}
            </span>
          </nav>
          
          {/* Title & Active Source Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white/10 text-[#B5E853] border border-white/20 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                    CEIBA · Laboratorio de Saberes
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B5E853]/20 text-[#B5E853] border border-[#B5E853]/40">
                    Consulta Asistida sobre Fuentes Autorizadas
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  Ceiba trabaja únicamente sobre saberes con permiso de lectura y procesamiento IA vigente. No representa a ninguna comunidad ni sustituye a sus custodios.
                </p>
              </div>
            </div>

            {/* Full-width non-truncated Source Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white/10 p-2.5 rounded-2xl border border-white/20">
              <label htmlFor="ceiba-source-select" className="text-[11px] font-bold text-[#F5B82E] px-1 whitespace-nowrap">
                Fuente seleccionada:
              </label>
              <select
                id="ceiba-source-select"
                value={activeKnowledge.id}
                onChange={(e) => setSelectedKnowledgeIdForLab(e.target.value)}
                className="bg-[#06233B] text-white font-bold text-xs p-2 rounded-xl border border-white/20 outline-none focus:border-sky-300 cursor-pointer sm:min-w-[320px]"
              >
                {readableItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.communityNames.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Source Pills */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-sky-200 font-semibold text-[11px]">
              <Sparkles className="w-4 h-4 text-[#F5B82E]" />
              <span>Cambio rápido de fuente autorizada:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'know_01_terrazas', label: 'Terrazas de Piedra (Sierra Nevada)' },
                { id: 'know_02_boga', label: 'Cantos de Boga (Afrocaribe)' },
                { id: 'know_03_mareas', label: 'Vientos y Mareas (Taganga)' },
                ...(readableItems.some(k => k.id === 'know_07_acuerdos_internos')
                  ? [{ id: 'know_07_acuerdos_internos', label: 'Actas Línea Negra (IA Bloqueada)' }]
                  : [])
              ].map(testSaber => {
                const isReadable = readableItems.some(r => r.id === testSaber.id);
                if (!isReadable) return null;
                return (
                  <button
                    key={testSaber.id}
                    onClick={() => setSelectedKnowledgeIdForLab(testSaber.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                      activeKnowledge.id === testSaber.id
                        ? 'bg-[#B5E853] text-[#061A17] border-[#B5E853] shadow-sm'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {testSaber.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block: Origen y Condiciones de Uso (Page 34 #2) */}
          <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B82E]">
                  Origen y condiciones de uso:
                </span>
                <span className="text-white font-bold text-sm">
                  {activeKnowledge.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#004B87] text-white border border-sky-400/30">
                  {activeKnowledge.type}
                </span>
              </div>

              {isCustodianOfThisSaber && aiPermissionCheck.allowed && (
                <button
                  onClick={() => revokeAIPermissionFromKnowledge(activeKnowledge.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 font-bold text-[11px] transition-colors"
                >
                  <Ban className="w-3 h-3" />
                  <span>Revocar permiso IA (Custodio)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1 text-[11px] text-slate-200">
              <div className="bg-slate-950/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Comunidad titular</span>
                <strong className="text-white">{activeKnowledge.communityNames.join(' • ')}</strong>
              </div>
              <div className="bg-slate-950/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Autor / Aportante</span>
                <strong className="text-white">{activeKnowledge.author}</strong>
              </div>
              <div className="bg-slate-950/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Permiso de Lectura</span>
                <strong className="text-emerald-300 capitalize">
                  {readPermissionCheck.allowed ? `Permitida (${activeKnowledge.permissions.consultation})` : 'Denegada'}
                </strong>
              </div>
              <div className="bg-slate-950/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Consulta IA (Ceiba)</span>
                <strong className={aiPermissionCheck.allowed ? 'text-[#B5E853]' : 'text-rose-300'}>
                  {aiPermissionCheck.allowed
                    ? 'Permitida'
                    : activeKnowledge.permissions.revokedAt
                    ? 'Revocada por custodio'
                    : 'No autorizada'}
                </strong>
              </div>
              <div className="bg-slate-950/30 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px]">Publicación derivada</span>
                <strong className="text-[#F5B82E]">Requiere revisión de custodia</strong>
              </div>
            </div>
          </div>

          {/* 2 Primary Workflow Tabs: 1. Pregúntale a Ceiba | 2. Transformar para enseñar */}
          {aiPermissionCheck.allowed && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-white text-[#06233B] shadow-md'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/15'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>1. Pregúntale a Ceiba</span>
              </button>

              <button
                onClick={() => setActiveTab('transform')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-colors ${
                  activeTab === 'transform'
                    ? 'bg-white text-[#06233B] shadow-md'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/15'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>2. Transformar para enseñar</span>
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* CASE A: AI PROCESSING DENIED OR REVOKED FOR THIS SABER */}
        {!aiPermissionCheck.allowed ? (
          <div className="max-w-3xl mx-auto my-8 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0D212E] border-2 border-rose-500/40 text-center space-y-6 shadow-lg">
            <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                {activeKnowledge.permissions.revokedAt ? 'Permiso IA Revocado' : 'Procesamiento IA No Autorizado'}
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#06233B] dark:text-white pt-2">
                {activeKnowledge.permissions.revokedAt
                  ? CEIBA_MICROCOPY.aiRevoked
                  : CEIBA_MICROCOPY.aiNotAllowed}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
                Aunque cuentas con permiso de lectura para <strong className="text-[#06233B] dark:text-white">"{activeKnowledge.title}"</strong>, la comunidad titular (<strong className="text-[#004B87] dark:text-aluna-cyan">{activeKnowledge.communityNames.join(', ')}</strong>) mantiene deshabilitado o revocado el permiso de consulta y transformación con Ceiba.
              </p>
            </div>

            {isCustodianOfThisSaber && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-amber-500/40 text-left space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-amber-600 dark:text-[#F5B82E] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-sm text-[#06233B] dark:text-white">
                      Acción exclusiva de Custodia Territorial ({currentUser.name}):
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Como custodio verificado de <strong>{activeKnowledge.communityNames.join(', ')}</strong>, puedes otorgar o restituir en tiempo real el permiso para que Ceiba procese este saber bajo supervisión comunitaria.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => grantAIPermissionToKnowledge(activeKnowledge.id)}
                  className="w-full py-3 px-6 rounded-full bg-[#F5B82E] hover:bg-[#E0A61F] text-[#06233B] font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Autorizar consulta asistida por Ceiba para este saber</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* CASE B: AI PROCESSING ALLOWED */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left / Center Column (8 cols): Active Mode Workspace */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* FLOW 1: PREGÚNTALE A CEIBA */}
              {activeTab === 'chat' && (
                <div className="bg-white dark:bg-[#0D212E] rounded-3xl border border-slate-200/90 dark:border-[#1E3E54] shadow-sm overflow-hidden flex flex-col">
                  
                  {/* Header */}
                  <div className="p-5 bg-slate-50 dark:bg-[#0A1924] border-b border-slate-200 dark:border-[#1E3E54] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-aluna-cyan/15 border border-sky-200 dark:border-aluna-cyan/30 flex items-center justify-center text-[#004B87] dark:text-aluna-cyan">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#06233B] dark:text-white">
                          {CEIBA_MICROCOPY.title}
                        </h3>
                        <p className="text-[11px] text-[#005A8D] dark:text-aluna-cyan truncate max-w-xs sm:max-w-md font-medium">
                          Fuente activa: {activeKnowledge.title}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setChatMessages([
                          {
                            sender: 'ai',
                            text: CEIBA_MICROCOPY.welcome,
                            supported: true
                          }
                        ])
                      }
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#06233B] dark:hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar consulta</span>
                    </button>
                  </div>

                  {/* Permanent Small Notice (Page 5) */}
                  <div className="px-5 py-2.5 bg-sky-50/80 dark:bg-[#132C3E] border-b border-sky-200/80 dark:border-[#1E3E54] flex items-center gap-2 text-[11px] text-[#06233B] dark:text-sky-200 font-medium">
                    <Info className="w-3.5 h-3.5 text-[#004B87] dark:text-aluna-cyan shrink-0" />
                    <span>{CEIBA_MICROCOPY.permanentNotice}</span>
                  </div>

                  {/* Messages Feed */}
                  <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                            msg.sender === 'user'
                              ? 'bg-[#004B87] text-white font-medium'
                              : msg.supported === false
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 border border-amber-300 dark:border-amber-700'
                              : 'bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-slate-100 border border-slate-200 dark:border-[#1E3E54]'
                          }`}
                        >
                          {msg.supported === false && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Límite de evidencia en fuentes autorizadas</span>
                            </div>
                          )}
                          <p>{msg.text}</p>

                          {/* Clickable Citation Cards (Page 6 & Page 34 #3) */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1E3E54] space-y-2.5 text-xs">
                              <div className="flex items-center justify-between text-[11px] font-bold text-[#004B87] dark:text-aluna-cyan">
                                <span className="flex items-center gap-1.5">
                                  <Quote className="w-3.5 h-3.5" />
                                  <span>Fuentes utilizadas</span>
                                </span>
                                <span>
                                  {msg.citations.length} {msg.citations.length === 1 ? 'fragmento' : 'fragmentos'} de 1 saber autorizado
                                </span>
                              </div>

                              {msg.citations.map((cit, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => setHighlightedCitation(cit)}
                                  className="w-full text-left p-3.5 rounded-xl bg-white dark:bg-[#0D212E] hover:bg-sky-50/60 dark:hover:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54] hover:border-[#004B87] transition-colors space-y-1.5 shadow-sm"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-bold text-[#06233B] dark:text-white text-xs">
                                      Fuente: {cit.title}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-[#1E3E54] capitalize">
                                      Acceso: {cit.consultationLevel}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-3 gap-y-0.5">
                                    <span><strong>Autor/aportante:</strong> {cit.author}</span>
                                    <span>•</span>
                                    <span><strong>Comunidad titular:</strong> {cit.communityNames.join(', ')}</span>
                                    <span>•</span>
                                    <span className="text-[#004B87] dark:text-[#F5B82E] font-semibold">
                                      {cit.chunkRef}
                                    </span>
                                  </div>

                                  <p className="italic text-slate-700 dark:text-slate-200 font-serif text-xs bg-slate-50 dark:bg-[#0A1924] p-2.5 rounded-lg border border-slate-200/70 dark:border-[#1E3E54]">
                                    {cit.excerpt}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Suggested Verified Questions & Out-of-Domain Refusal Test */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0A1924] border-t border-slate-200 dark:border-[#1E3E54] space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Preguntas sugeridas sobre esta fuente (y prueba de negativa sin evidencia):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeKnowledge.educationalData.sampleQuestions.map((sq, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAskCeiba(sq.q)}
                          className="text-left text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-[#132C3E] hover:bg-sky-50 dark:hover:bg-[#193A50] text-[#06233B] dark:text-slate-200 border border-slate-200 dark:border-[#1E3E54] transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-[#005A8D] dark:text-aluna-cyan shrink-0" />
                          <span>{sq.q}</span>
                        </button>
                      ))}

                      {activeKnowledge.educationalData.outOfDomainQuestion && (
                        <button
                          onClick={() => handleAskCeiba(activeKnowledge.educationalData.outOfDomainQuestion.q)}
                          className="text-left text-xs px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 transition-colors flex items-center gap-1.5"
                          title="Probar que Ceiba se niega a inventar información fuera de la fuente"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                          <span>Probar pregunta fuera de fuente: {activeKnowledge.educationalData.outOfDomainQuestion.q}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskCeiba(inputQuestion);
                    }}
                    className="p-4 bg-white dark:bg-[#0D212E] border-t border-slate-200 dark:border-[#1E3E54] flex items-center gap-3"
                  >
                    <label htmlFor="ceiba-question-input" className="sr-only">
                      {CEIBA_MICROCOPY.placeholder}
                    </label>
                    <input
                      id="ceiba-question-input"
                      type="text"
                      value={inputQuestion}
                      onChange={(e) => setInputQuestion(e.target.value)}
                      placeholder={CEIBA_MICROCOPY.placeholder}
                      className="flex-1 bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] outline-none focus:border-[#004B87] dark:focus:border-aluna-cyan placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Consultar a Ceiba</span>
                    </button>
                  </form>
                </div>
              )}

              {/* FLOW 2: TRANSFORMAR PARA ENSEÑAR (Page 8 & Page 27) */}
              {activeTab === 'transform' && (
                <div className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-6">
                  <div className="space-y-1 border-b border-slate-200 dark:border-[#1E3E54] pb-4">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#005A8D] dark:text-[#F5B82E]">
                      Transformación Pedagógica Controlada
                    </span>
                    <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
                      Transformar para enseñar
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Adapta el saber autorizado <strong className="text-[#06233B] dark:text-white">"{activeKnowledge.title}"</strong> a un material pedagógico. Todo resultado nace como borrador (<code className="font-mono">status = draft · pending_review · public = false</code>) hasta la aprobación de la custodia de <strong className="text-[#004B87] dark:text-aluna-cyan">{activeKnowledge.communityNames.join(', ')}</strong>.
                    </p>
                  </div>

                  {/* Form with minimum required fields from Page 8 */}
                  <form onSubmit={handleTransformSubmit} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="tx-audience" className="font-bold text-[#06233B] dark:text-slate-200 block">
                          Público destinatario:
                        </label>
                        <select
                          id="tx-audience"
                          value={audience}
                          onChange={(e) => setAudience(e.target.value as TransformRequest['audience'])}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-semibold outline-none focus:border-[#004B87]"
                        >
                          <option value="Niños">Niños</option>
                          <option value="Jóvenes">Jóvenes</option>
                          <option value="Adultos">Adultos</option>
                          <option value="Público general">Público general</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="tx-level" className="font-bold text-[#06233B] dark:text-slate-200 block">
                          Nivel formativo:
                        </label>
                        <select
                          id="tx-level"
                          value={level}
                          onChange={(e) => setLevel(e.target.value as TransformRequest['level'])}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-semibold outline-none focus:border-[#004B87]"
                        >
                          <option value="Inicial">Inicial</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="tx-format" className="font-bold text-[#06233B] dark:text-slate-200 block">
                          Formato pedagógico:
                        </label>
                        <select
                          id="tx-format"
                          value={format}
                          onChange={(e) => setFormat(e.target.value as TransformRequest['format'])}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-semibold outline-none focus:border-[#004B87]"
                        >
                          <option value="Guía de aprendizaje">Guía de aprendizaje</option>
                          <option value="Explicación">Explicación</option>
                          <option value="Presentación pedagógica">Presentación pedagógica</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="tx-objective" className="font-bold text-[#06233B] dark:text-slate-200 block">
                          Objetivo de aprendizaje:
                        </label>
                        <input
                          id="tx-objective"
                          type="text"
                          required
                          value={objective}
                          onChange={(e) => setObjective(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:border-[#004B87]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="tx-language" className="font-bold text-[#06233B] dark:text-slate-200 block">
                          Idioma (sujeto a validación comunitaria):
                        </label>
                        <select
                          id="tx-language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-semibold outline-none focus:border-[#004B87]"
                        >
                          <option value="Español">Español</option>
                          <option value="Español (con glosario territorial autorizado)">Español (con glosario territorial autorizado)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="tx-context" className="font-bold text-[#06233B] dark:text-slate-200 block">
                        Contexto de aula o comunitario (opcional):
                      </label>
                      <input
                        id="tx-context"
                        type="text"
                        value={contextNote}
                        onChange={(e) => setContextNote(e.target.value)}
                        placeholder="Ej. Taller intercultural con estudiantes de primer semestre..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:border-[#004B87]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        El derivado se enviará automáticamente a la cola de custodia de <strong>{activeKnowledge.communityNames.join(', ')}</strong>.
                      </span>
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-[#F5B82E]" />
                        <span>Generar borrador y enviar a revisión de custodia</span>
                      </button>
                    </div>
                  </form>

                  {/* Mandatory Draft Warning Banner (Page 7 & Page 27) */}
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/70 flex items-start gap-3 text-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-[#F5B82E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-amber-950 dark:text-white">Estado del material derivado:</strong>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-200">
                          status = draft · review_status = pending_review · public = false
                        </span>
                      </div>
                      <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
                        {CEIBA_MICROCOPY.draftNotice}
                      </p>
                      {lastCreatedDraftId && (
                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Borrador enviado a la bandeja de custodia de {activeKnowledge.communityNames.join(', ')}.</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveScreen('custodian')}
                            className="px-3.5 py-1.5 rounded-full bg-[#06233B] text-white font-bold text-[11px] hover:bg-[#004B87] transition-colors"
                          >
                            Ir al Panel de Custodia →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview of the Transformed Content */}
                  <div className="pt-4 border-t border-slate-200 dark:border-[#1E3E54] space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
                        Vista previa del borrador ({format} · {audience} · Nivel {level})
                      </h3>
                      <span className="text-[11px] font-bold text-[#005A8D] dark:text-aluna-cyan">
                        Fuente: {activeKnowledge.author}
                      </span>
                    </div>

                    {format === 'Explicación' && (
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-sky-50/70 dark:bg-[#0A1924] border border-sky-200 dark:border-[#1E3E54] space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#005A8D] dark:text-[#F5B82E]">
                            Explicación adaptada ({audience} · {level})
                          </span>
                          <p className="text-sm sm:text-base font-serif text-[#06233B] dark:text-white leading-relaxed">
                            {activeKnowledge.educationalData.simpleExplanation}
                          </p>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#004B87] dark:text-aluna-cyan">
                            Síntesis documental respaldada
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                            {activeKnowledge.educationalData.summary}
                          </p>
                        </div>
                      </div>
                    )}

                    {format === 'Guía de aprendizaje' && (
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {activeKnowledge.educationalData.learningGuide.keyConcepts.map((kc, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-1">
                              <strong className="text-[#004B87] dark:text-[#F5B82E] block text-sm font-serif">
                                {kc.term}
                              </strong>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                {kc.definition}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-2">
                          <strong className="text-[#06233B] dark:text-white block">Preguntas de reflexión para {audience}:</strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                            {activeKnowledge.educationalData.learningGuide.reflectionQuestions.map((rq, i) => (
                              <li key={i}>{rq}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-[#132C3E] border border-sky-200 dark:border-[#1E3E54] space-y-1">
                          <strong className="text-[#004B87] dark:text-[#F5B82E] block">Actividad sugerida ({objective}):</strong>
                          <p className="text-[#06233B] dark:text-slate-200 leading-relaxed">
                            {activeKnowledge.educationalData.learningGuide.classroomActivity}
                          </p>
                        </div>
                      </div>
                    )}

                    {format === 'Presentación pedagógica' && activeKnowledge.educationalData.slides.length > 0 && (
                      <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-4">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-bold text-[#004B87] dark:text-aluna-cyan">
                              Diapositiva {currentSlideIndex + 1} de {activeKnowledge.educationalData.slides.length}
                            </span>
                            <span>Anclaje: {activeKnowledge.educationalData.slides[currentSlideIndex]?.sourceAnchor}</span>
                          </div>
                          <h4 className="font-serif font-bold text-xl text-[#06233B] dark:text-white">
                            {activeKnowledge.educationalData.slides[currentSlideIndex]?.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                            {activeKnowledge.educationalData.slides[currentSlideIndex]?.content}
                          </p>
                          {activeKnowledge.educationalData.slides[currentSlideIndex]?.quote && (
                            <blockquote className="p-3 rounded-xl bg-white dark:bg-[#0D212E] border-l-4 border-[#F5B82E] italic text-xs text-[#06233B] dark:text-slate-200 font-serif">
                              {activeKnowledge.educationalData.slides[currentSlideIndex]?.quote}
                            </blockquote>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <button
                              type="button"
                              disabled={currentSlideIndex === 0}
                              onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#132C3E] border border-slate-200 dark:border-[#1E3E54] text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                            </button>
                            <button
                              type="button"
                              disabled={currentSlideIndex === activeKnowledge.educationalData.slides.length - 1}
                              onClick={() => setCurrentSlideIndex(i => Math.min(activeKnowledge.educationalData.slides.length - 1, i + 1))}
                              className="px-3.5 py-1.5 rounded-xl bg-[#004B87] text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                            >
                              Siguiente <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Animated Beam Flow of Data Sovereignty */}
              <AnimatedBeamFlow
                sourceTitle={activeKnowledge.title}
                communityName={activeKnowledge.communityNames[0]}
              />

            </div>

            {/* Right Column (4 cols): Original Authorized Source Document & Verification Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-4 sticky top-24">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E3E54] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#005A8D] dark:text-[#F5B82E]" />
                    <h4 className="font-serif font-bold text-sm text-[#06233B] dark:text-white">
                      Texto Fuente Autorizado
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Fuente Primaria
                  </span>
                </div>

                {highlightedCitation && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300 text-[11px]">
                      <span>Cita seleccionada ({highlightedCitation.chunkRef})</span>
                      <button
                        type="button"
                        onClick={() => setHighlightedCitation(null)}
                        className="underline text-[10px]"
                      >
                        Cerrar
                      </button>
                    </div>
                    <p className="italic font-serif text-amber-950 dark:text-amber-100">
                      {highlightedCitation.excerpt}
                    </p>
                  </div>
                )}

                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif max-h-[360px] overflow-y-auto pr-1">
                  {activeKnowledge.fullContent.split('\n\n').map((paragraph, index) => (
                    <p
                      key={index}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200/80 dark:border-[#1E3E54]"
                    >
                      <span className="block text-[10px] font-sans font-bold text-[#005A8D] dark:text-aluna-cyan mb-1">
                        Fragmento {index + 1}
                      </span>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Ethical Safeguard & Future Roadmap Note (P1.4 & P2) */}
                <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-[#0A1924] border border-sky-200 dark:border-[#1E3E54] text-[11px] text-slate-700 dark:text-slate-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#004B87] dark:text-aluna-cyan shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#06233B] dark:text-white">Aislamiento RAG:</strong> Ceiba trata las fuentes entre <code className="font-mono">&lt;FUENTES&gt;</code> como datos no confiables frente a instrucciones maliciosas y jamás mezcla datos del módulo de Bienestar.
                    </span>
                  </div>
                  <div className="pt-2 border-t border-sky-200/60 dark:border-[#1E3E54] text-[10px] text-slate-500 dark:text-slate-400">
                    <strong>Hoja de ruta futura (Fase P2):</strong> Síntesis de pódcast multivoz, storyboard audiovisual y traducción asistida con validadores comunitarios.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
