import React, { useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { KnowledgeType } from '../types';
import { 
  UploadCloud, 
  ShieldCheck, 
  Bot, 
  Lock, 
  Unlock, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  Paperclip
} from 'lucide-react';

export const UploadScreen: React.FC = () => {
  const { 
    currentUser, 
    communities, 
    proposeKnowledgeItem, 
    setActiveScreen, 
    showToast,
    isUserCustodianOfCommunity
  } = useAluna();

  // Wizard steps: 1: Comunidades y Territorio, 2: Contenido y Autoría, 3: Permisos Granulares y Soberanía IA
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [title, setTitle] = useState('');
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([communities[0].id]);
  const [isCollective, setIsCollective] = useState(true);
  const [provenance, setProvenance] = useState('');
  const [type, setType] = useState<KnowledgeType>('relato');
  const [description, setDescription] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [simulatedFileName, setSimulatedFileName] = useState('');
  
  // Granular Permission Fields
  const [consultation, setConsultation] = useState<'public' | 'community' | 'restricted' | 'private'>('community');
  const [downloadAllowed, setDownloadAllowed] = useState(false);
  const [aiQueryAllowed, setAiQueryAllowed] = useState<'none' | 'educational_query' | 'derived_approval_required'>('derived_approval_required');
  const [derivativeGenerationAllowed] = useState(true);
  const [reusableForEducation, setReusableForEducation] = useState(true);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleCommunity = (id: string) => {
    if (selectedCommunityIds.includes(id)) {
      if (selectedCommunityIds.length === 1) {
        showToast('Debes seleccionar al menos una comunidad territorial.', 'warning');
        return;
      }
      setSelectedCommunityIds(selectedCommunityIds.filter(x => x !== id));
    } else {
      setSelectedCommunityIds([...selectedCommunityIds, id]);
    }
  };

  const handleSimulateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSimulatedFileName(e.target.files[0].name);
      showToast(`Archivo adjunto simulado: ${e.target.files[0].name}`, 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !fullContent.trim()) {
      showToast('Por favor completa todos los campos del saber.', 'warning');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    proposeKnowledgeItem({
      title,
      type,
      communityIds: selectedCommunityIds,
      isCollective,
      provenance: provenance || 'Relato territorial transmitido oralmente.',
      description,
      fullContent,
      permissions: {
        consultation,
        downloadAllowed,
        aiQueryAllowed,
        derivativeGenerationAllowed,
        derivativePublicationApprovalRequired: true,
        reusableForEducation
      },
      tags
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    const isCustodianOfAll = selectedCommunityIds.every(id => isUserCustodianOfCommunity(currentUser.id, id));

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 mx-auto flex items-center justify-center shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold text-[#005A8D] dark:text-aluna-cyan tracking-widest">
            Registro Completado en la Demostración
          </span>
          <h1 className="font-serif font-bold text-3xl text-[#06233B] dark:text-white">
            ¡Saber registrado exitosamente!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Tu contenido ha sido incorporado al estado del prototipo respetando las reglas de visibilidad (<strong className="text-[#06233B] dark:text-white">{consultation}</strong>) y uso con IA (<strong className="text-[#06233B] dark:text-white">{aiQueryAllowed}</strong>).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-left text-xs space-y-2 shadow-sm">
          <p className="font-bold text-[#004B87] dark:text-aluna-cyan flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Estado de Gobernanza Comunitaria:</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {isCustodianOfAll ? (
              'Al ser custodio con autoridad sobre la comunidad, el saber ha quedado directamente autorizado o en revisión mancomunada según corresponda.'
            ) : (
              `Tu aporte fue enviado como propuesta en revisión comunitaria. Se requiere que el custodio de cada una de las comunidades vinculadas (${selectedCommunityIds.length}) autorice el contenido antes de su publicación general.`
            )}
          </p>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setActiveScreen('library')}
            className="px-6 py-3 rounded-full bg-[#004B87] hover:bg-[#003865] text-white text-xs font-bold transition-colors shadow-sm"
          >
            Ir a la Biblioteca de Saberes
          </button>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(1);
              setTitle('');
              setDescription('');
              setFullContent('');
              setSimulatedFileName('');
            }}
            className="px-5 py-3 rounded-full bg-white dark:bg-[#132C3E] hover:bg-slate-50 dark:hover:bg-[#193A50] text-[#06233B] dark:text-slate-200 text-xs font-bold transition-colors border border-slate-300 dark:border-[#1E3E54]"
          >
            Aportar otro saber
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
          Aporte y Preservación de Conocimiento
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
          Aportar un Saber a la Plataforma
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Comparte relatos, memorias, prácticas agronómicas o saberes tradicionales definiendo con precisión quién podrá consultarlos y si autorizas su uso pedagógico con inteligencia artificial.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E3E54] pb-4 text-xs font-semibold">
        <div 
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 cursor-pointer ${
            currentStep === 1 ? 'text-[#004B87] dark:text-aluna-cyan font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            currentStep === 1 ? 'bg-[#004B87] dark:bg-aluna-cyan text-white dark:text-[#061A17]' : 'bg-slate-200 dark:bg-[#132C3E] text-slate-600 dark:text-slate-400'
          }`}>1</span>
          <span>Comunidades y Territorio</span>
        </div>

        <div className="w-12 h-px bg-slate-200 dark:bg-[#1E3E54] hidden sm:block" />

        <div 
          onClick={() => setCurrentStep(2)}
          className={`flex items-center gap-2 cursor-pointer ${
            currentStep === 2 ? 'text-[#004B87] dark:text-aluna-cyan font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            currentStep === 2 ? 'bg-[#004B87] dark:bg-aluna-cyan text-white dark:text-[#061A17]' : 'bg-slate-200 dark:bg-[#132C3E] text-slate-600 dark:text-slate-400'
          }`}>2</span>
          <span>Contenido y Formato</span>
        </div>

        <div className="w-12 h-px bg-slate-200 dark:bg-[#1E3E54] hidden sm:block" />

        <div 
          onClick={() => setCurrentStep(3)}
          className={`flex items-center gap-2 cursor-pointer ${
            currentStep === 3 ? 'text-[#004B87] dark:text-aluna-cyan font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            currentStep === 3 ? 'bg-[#004B87] dark:bg-aluna-cyan text-white dark:text-[#061A17]' : 'bg-slate-200 dark:bg-[#132C3E] text-slate-600 dark:text-slate-400'
          }`}>3</span>
          <span>Gobernanza y Soberanía IA</span>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-6">
        
        {/* STEP 1: Comunidades y Territorio */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white border-b border-slate-200 dark:border-[#1E3E54] pb-3 flex items-center justify-between">
              <span>Paso 1: Vinculación Comunitaria y Territorial</span>
              <span className="text-xs font-semibold text-[#005A8D] dark:text-aluna-cyan">Admite saberes mancomunados</span>
            </h3>

            {/* Community Multi-select */}
            <div className="space-y-2">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Selecciona la(s) comunidad(es) custodia(s) del saber:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {communities.map(c => {
                  const isSelected = selectedCommunityIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleCommunity(c.id)}
                      className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-[#132C3E] border-[#004B87] dark:border-aluna-cyan text-[#06233B] dark:text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-[#0A1924] border-slate-200 dark:border-[#1E3E54] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm text-[#06233B] dark:text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.region}</p>
                        <p className="text-[10px] font-semibold text-[#005A8D] dark:text-aluna-cyan mt-1">Custodia: {c.custodians.map(x => x.name).join(', ')}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#004B87] dark:bg-aluna-cyan border-[#004B87] dark:border-aluna-cyan text-white dark:text-[#061A17] font-bold' : 'border-slate-400'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedCommunityIds.length > 1 && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-700 text-[11px] text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-700 dark:text-purple-300 shrink-0" />
                  <span>
                    Has seleccionado {selectedCommunityIds.length} comunidades. Este saber se considerará <strong>intercomunitario</strong> y requerirá la aprobación de cada una de sus custodias.
                  </span>
                </div>
              )}
            </div>

            {/* Collective vs Individual */}
            <div className="space-y-2">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Naturaleza de la memoria:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] cursor-pointer">
                  <input
                    type="radio"
                    name="isCollective"
                    checked={isCollective}
                    onChange={() => setIsCollective(true)}
                    className="mt-1 text-[#004B87] focus:ring-[#004B87]"
                  />
                  <div>
                    <span className="font-bold text-[#06233B] dark:text-white block">Saber colectivo o comunitario</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">Transmitido intergeneracionalmente; pertenece a la comunidad en su conjunto.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] cursor-pointer">
                  <input
                    type="radio"
                    name="isCollective"
                    checked={!isCollective}
                    onChange={() => setIsCollective(false)}
                    className="mt-1 text-[#004B87] focus:ring-[#004B87]"
                  />
                  <div>
                    <span className="font-bold text-[#06233B] dark:text-white block">Testimonio o autoría individual</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">Historia de vida personal o bitácora de una persona creadora específica.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Provenance */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Procedencia o linaje del saber (Opcional pero recomendado):
              </label>
              <input
                type="text"
                value={provenance}
                onChange={(e) => setProvenance(e.target.value)}
                placeholder="Ejemplo: Transmitido por abuelos en la cuenca del Río Gaira en época de marejadas..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors"
              >
                <span>Continuar a Contenido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Contenido y Formato */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in text-xs">
            <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white border-b border-slate-200 dark:border-[#1E3E54] pb-3">
              Paso 2: Título, Formato y Texto del Saber
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200 flex justify-between">
                <span>Título del Saber o Relato:</span>
                <span className="text-[10px] text-[#005A8D] dark:text-aluna-cyan font-semibold">Obligatorio</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ejemplo: Práctica del canje en el manglar de Tasajera..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>

            {/* Format selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Tipo o Formato del Material:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'relato', label: 'Relato Oral' },
                  { id: 'practica', label: 'Práctica Territorial' },
                  { id: 'documento', label: 'Documento / Bitácora' },
                  { id: 'audio', label: 'Audio / Canto' },
                  { id: 'historia', label: 'Historia de Vida' },
                  { id: 'memoria', label: 'Memoria Colectiva' },
                  { id: 'fotografia', label: 'Fotografía' },
                  { id: 'video', label: 'Video Testimonial' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as KnowledgeType)}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold transition-colors ${
                      type === t.id
                        ? 'bg-[#004B87] dark:bg-aluna-cyan text-white dark:text-[#061A17] font-bold border-[#004B87] dark:border-aluna-cyan'
                        : 'bg-slate-50 dark:bg-[#0A1924] border-slate-200 dark:border-[#1E3E54] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200 flex justify-between">
                <span>Descripción breve o resumen público:</span>
                <span className="text-[10px] text-[#005A8D] dark:text-aluna-cyan font-semibold">Visible en la biblioteca</span>
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve síntesis de 2 a 3 oraciones sobre qué trata este conocimiento..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>

            {/* Full content */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200 flex justify-between">
                <span>Contenido Completo, Transcripción o Relato:</span>
                <span className="text-[10px] text-[#005A8D] dark:text-aluna-cyan font-semibold">Sujeto a las reglas de acceso</span>
              </label>
              <textarea
                required
                rows={6}
                value={fullContent}
                onChange={(e) => setFullContent(e.target.value)}
                placeholder="Escribe o pega el relato completo, las instrucciones de la práctica territorial, las memorias comunitarias o la transcripción oral..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-serif text-sm outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Simulated file upload */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Adjuntar archivo de soporte (audio, video, fotografía o PDF simulado):
              </label>
              <div className="border border-dashed border-slate-300 dark:border-[#1E3E54] rounded-2xl p-4 text-center bg-slate-50 dark:bg-[#0A1924] hover:bg-slate-100 dark:hover:bg-[#132C3E] transition-colors">
                <input
                  type="file"
                  id="sim-file-input"
                  onChange={handleSimulateFile}
                  className="hidden"
                />
                <label htmlFor="sim-file-input" className="cursor-pointer flex flex-col items-center gap-1.5">
                  <Paperclip className="w-5 h-5 text-[#005A8D] dark:text-aluna-cyan" />
                  <span className="font-bold text-[#06233B] dark:text-white text-xs">
                    {simulatedFileName || 'Seleccionar archivo local de demostración'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Soporta WAV, MP3, MP4, JPG, PNG o PDF (simulado localmente en el navegador)
                  </span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Etiquetas temáticas (separadas por comas):
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ejemplo: manglar, pesca, medicina tradicional, agua"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132C3E]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors"
              >
                <span>Continuar a Gobernanza y Soberanía IA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Gobernanza y Soberanía IA */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in text-xs">
            <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white border-b border-slate-200 dark:border-[#1E3E54] pb-3 flex items-center justify-between">
              <span>Paso 3: Matriz Granular de Permisos y Soberanía IA</span>
              <span className="text-xs font-semibold text-[#005A8D] dark:text-aluna-cyan">Autonomía sobre el saber</span>
            </h3>

            {/* Consultation level */}
            <div className="space-y-2">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Nivel de Consulta y Lectura:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'public',
                    title: 'Público General',
                    desc: 'Cualquier persona puede leer y conocer este contenido en la biblioteca abierta.',
                    icon: <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  },
                  {
                    id: 'community',
                    title: 'Comunidad Verificada',
                    desc: 'Solo integrantes con pertenencia verificada a la comunidad pueden leerlo.',
                    icon: <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  },
                  {
                    id: 'restricted',
                    title: 'Custodia Restringida',
                    desc: 'Requiere solicitud individual y aprobación explícita de la custodia para leer.',
                    icon: <Lock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  },
                  {
                    id: 'private',
                    title: 'Reservado Tradicional',
                    desc: 'Solo los custodios y la persona autora pueden ver el texto completo.',
                    icon: <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  }
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setConsultation(opt.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                      consultation === opt.id
                        ? 'bg-sky-50 dark:bg-[#132C3E] border-[#004B87] dark:border-aluna-cyan text-[#06233B] dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-[#0A1924] border-slate-200 dark:border-[#1E3E54] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">{opt.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-[#06233B] dark:text-white text-xs">{opt.title}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Policy */}
            <div className="space-y-2">
              <label className="font-bold text-[#06233B] dark:text-slate-200 block">
                Política de Inteligencia Artificial (Laboratorio de Saberes):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'none',
                    title: 'No permitir IA',
                    desc: 'Excluido totalmente de modelos y síntesis automáticas.',
                    icon: <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  },
                  {
                    id: 'educational_query',
                    title: 'Consultas Educativas',
                    desc: 'Respuestas contextuales dentro del Laboratorio con citas estrictas.',
                    icon: <Bot className="w-4 h-4 text-[#005A8D] dark:text-aluna-cyan" />
                  },
                  {
                    id: 'derived_approval_required',
                    title: 'Derivados con Aprobación',
                    desc: 'Generación de presentaciones y guías con revisión obligatoria del custodio.',
                    icon: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  }
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setAiQueryAllowed(opt.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex flex-col justify-between gap-2 ${
                      aiQueryAllowed === opt.id
                        ? 'bg-sky-50 dark:bg-[#132C3E] border-[#004B87] dark:border-aluna-cyan text-[#06233B] dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-[#0A1924] border-slate-200 dark:border-[#1E3E54] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <p className="font-bold text-[#06233B] dark:text-white text-xs">{opt.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional granular flags */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
              <span className="font-bold text-[#06233B] dark:text-white block">Permisos complementarios:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={downloadAllowed}
                    onChange={e => setDownloadAllowed(e.target.checked)}
                    className="rounded text-[#004B87] focus:ring-[#004B87]"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Permitir descarga del archivo fuente original</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reusableForEducation}
                    onChange={e => setReusableForEducation(e.target.checked)}
                    className="rounded text-[#004B87] focus:ring-[#004B87]"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Autorizar reutilización didáctica en aulas universitarias</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#132C3E]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Enviar y Registrar Saber</span>
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};
