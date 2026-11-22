import React from 'react';
import { useAluna } from '../context/AlunaContext';
import { BentoGrid, BentoCard } from '../components/magicui/BentoGrid';
import { 
  BookOpen, 
  LogIn, 
  HelpCircle, 
  ShieldCheck, 
  Bot, 
  Trees, 
  Cpu,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { setActiveScreen } = useAluna();

  const scrollToHowItWorks = () => {
    const el = document.getElementById('acerca-demostracion-sabia');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07131B] text-[#06233B] dark:text-slate-100 transition-colors pb-20">
      
      {/* Hero Section (Aligned with alunaia.co + Acuerdo Superior N.º 06 de 2026) */}
      <section className="relative bg-gradient-to-br from-[#051815] via-[#092924] to-[#06233B] text-white pt-14 pb-20 sm:pt-20 sm:pb-24 border-b border-slate-200 dark:border-[#1E3E54] overflow-hidden">
        <div className="absolute inset-0 bg-aluna-hero-grid pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Institutional Strategy Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#F5B82E]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-200">
              Estrategia Institucional · Acuerdo Superior N.º 06 del 30 de abril de 2026
            </span>
          </div>

          {/* Official Logo Lockup & Editorial Heading */}
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
              <div className="bg-white px-6 py-3 rounded-2xl shadow-lg inline-flex items-center gap-3 border border-white/40">
                <img 
                  src="/assets/logos/escudo_unimag_oficial.png" 
                  alt="UNIMAGDALENA" 
                  className="h-10 w-10 object-contain"
                />
                <div className="h-8 w-px bg-slate-200" />
                <img 
                  src="/assets/logos/aluna_logo_full.png" 
                  alt="Aluna I.A." 
                  className="h-10 sm:h-11 object-contain"
                />
              </div>
            </div>
            
            <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Donde los saberes se encuentran, se preservan y se comparten con respeto.
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
              Módulo <strong className="text-[#B5E853]">SABIA</strong> de Diálogo de Saberes y consulta asistida con <strong className="text-[#B5E853]">CEIBA</strong> del ecosistema Aluna I.A. — UNIMAGDALENA: repositorio intercultural con custodia territorial descentralizada, aislamiento estricto de permisos y transformación pedagógica supervisada.
            </p>
          </div>

          {/* Principle of Data Sovereignty Callout */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-white/10 border border-white/20 text-left flex items-start gap-4 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-[#B5E853]/20 text-[#B5E853] shrink-0 mt-0.5 border border-[#B5E853]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#B5E853]">
                Principio de Soberanía y Aislamiento Comunitario
              </h2>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                SABIA conserva y gobierna. CEIBA ayuda a consultar únicamente sobre fuentes autorizadas. El Laboratorio transforma para enseñar. Las fuentes respaldan, los custodios revisan y las comunidades mantienen el control.
              </p>
            </div>
          </div>

          {/* 4 Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5 max-w-3xl mx-auto">
            {/* 1. Explorar contenidos públicos */}
            <button
              onClick={() => setActiveScreen('library')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[#B5E853] hover:bg-[#A3E635] text-[#061A17] shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explorar Biblioteca</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* 2. Iniciar Sesión / Cambiar Perfil */}
            <button
              onClick={() => setActiveScreen('login')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-[#004B87] hover:bg-[#005A9C] text-white border border-sky-400/30 shadow-md transition-colors"
            >
              <LogIn className="w-4 h-4 text-[#F5B82E]" />
              <span>Iniciar Sesión / Perfiles</span>
            </button>

            {/* 3. Ir al panel */}
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-300" />
              <span>Ingresar al panel</span>
            </button>

            {/* 4. Conocer cómo funciona */}
            <button
              onClick={scrollToHowItWorks}
              className="flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Conocer cómo funciona</span>
            </button>
          </div>

        </div>
      </section>

      {/* Body Section: 3 Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
            Dimensiones de la Plataforma SABIA
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#06233B] dark:text-white">
            Explora el ecosistema de diálogo de saberes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Arquitectura de preservación comunitaria, gobernanza granular por territorio y aprendizaje asistido por Ceiba.
          </p>
        </div>

        <BentoGrid className="lg:grid-cols-3">
          {/* Card 1: Territorio */}
          <BentoCard
            badge="Dimensión Cultural"
            title="Territorio y Memoria Viva"
            description="Espacio seguro para relatos orales, cantos de boga, prácticas agronómicas y memorias de la cuenca, diferenciando entre 'lo de adentro' y 'lo de afuera'."
            icon={<Trees className="w-5 h-5" />}
            actionText="Ver comunidades"
            hrefAction={() => setActiveScreen('communities')}
          >
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E3E54] flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-[#132C3E] text-[#06233B] dark:text-aluna-cyan">Sierra Nevada</span>
              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-[#132C3E] text-[#06233B] dark:text-aluna-cyan">Litoral Afrocaribe</span>
              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-[#132C3E] text-[#06233B] dark:text-aluna-cyan">Taganga</span>
            </div>
          </BentoCard>

          {/* Card 2: Gobernanza */}
          <BentoCard
            badge="Gobernanza Soberana"
            title="Soberanía y Custodia Aislada"
            description="Matriz granular de permisos (Público, Comunidad, Restringido, Privado), revocación de IA en vivo y aprobación unánime para saberes mancomunados."
            icon={<ShieldCheck className="w-5 h-5" />}
            actionText="Ver matriz de permisos"
            hrefAction={() => setActiveScreen('permissions')}
          >
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E3E54] flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Aislamiento estricto entre custodias</span>
            </div>
          </BentoCard>

          {/* Card 3: Ceiba */}
          <BentoCard
            badge="Asistente de Consulta"
            title="Pregúntale a Ceiba & Transformar"
            description="Consulta asistida con citas clicables al fragmento original, negativa honesta cuando no hay evidencia y generación de borradores pedagógicos sujetos a revisión."
            icon={<Bot className="w-5 h-5" />}
            actionText="Pregúntale a Ceiba"
            hrefAction={() => setActiveScreen('ai_lab')}
          >
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E3E54] flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              <Cpu className="w-3.5 h-3.5 text-[#005A8D] dark:text-aluna-cyan" />
              <span>Autorización verificada antes del retrieval</span>
            </div>
          </BentoCard>
        </BentoGrid>

      </section>

      {/* Section: Acerca de esta demostración (Page 33-34 of PDF) */}
      <section id="acerca-demostracion-sabia" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#0D212E] p-8 sm:p-10 border border-slate-200 dark:border-[#1E3E54] shadow-sm space-y-6">
          <div className="space-y-2 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#005A8D] dark:text-[#F5B82E]">
              Acerca de esta demostración · Transparencia Técnica y Ética
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#06233B] dark:text-white">
              Alcance real implementado, alcance simulado y hoja de ruta
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Este prototipo incorpora principios de minimización, separación y consentimiento como requisitos de diseño. Un despliegue real requeriría co-diseño, revisión institucional, jurídica y validación comunitaria con las comunidades participantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2.5">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                ✓ Implementado y Verificado
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-200">
                <li>✓ Autenticación y cambio rápido de perfiles demo</li>
                <li>✓ Visibilidad diferenciada (`public`, `community`, `restricted`, `private`)</li>
                <li>✓ Aislamiento estricto de bandejas entre custodios (Sierra vs. Afro vs. Pesca)</li>
                <li>✓ Unanimidad obligatoria en saberes multicomunidad</li>
                <li>✓ Consulta en Ceiba con tarjetas de citas y negativa sin evidencia</li>
                <li>✓ Transformar para enseñar con salida en borrador (`pending_review`)</li>
                <li>✓ Separación de datos del módulo de Bienestar</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2.5">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                ○ Simulado en Entorno Académico
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-200">
                <li>○ Identidades, custodios y comunidades de demostración</li>
                <li>○ Contenidos culturales y relatos de ejemplo</li>
                <li>○ Validación comunitaria real en territorio</li>
                <li>○ Verificación institucional de filiación</li>
                <li>○ Adaptador local de servicios (`MockCeibaService` / `localStorage`) listo para conectar a API REST + PostgreSQL RLS</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-2.5">
              <h4 className="font-bold text-[#004B87] dark:text-aluna-cyan uppercase tracking-wider text-[11px]">
                → Propuesto para Futuro (Fase P2)
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                <li>○ Sincronización offline-first completa en zonas rurales</li>
                <li>○ Generación multimedia y pódcast multivoz en servidor</li>
                <li>○ Traducción asistida con validadores comunitarios acreditados</li>
                <li>○ Articulación con Mercado Vivo y redes territoriales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
