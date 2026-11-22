import React, { useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { 
  Palette, 
  Sparkles, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Bot, 
  Quote, 
  Copy
} from 'lucide-react';

export const VisualGuideScreen: React.FC = () => {
  const { themeMode, toggleTheme, showToast } = useAluna();
  const [compareTheme, setCompareTheme] = useState<'both' | 'light' | 'dark'>('both');

  const colorPalette = [
    {
      name: 'Azul Institucional ALUNA IA',
      hex: '#004B87',
      role: 'Color corporativo principal del ecosistema ALUNA IA (alunaia.co).',
      usage: 'Botones primarios, encabezados de marca y contenedores emblemáticos.',
      contrast: 'Texto blanco: 8.6:1 (Cumple WCAG AAA)'
    },
    {
      name: 'Marino Profundo UNIMAGDALENA',
      hex: '#06233B',
      role: 'Color tipográfico de títulos en modo claro y barra institucional.',
      usage: 'Títulos principales, barras de simulación y pie de página.',
      contrast: 'Sobre blanco #FFFFFF: 15.8:1 (Cumple WCAG AAA)'
    },
    {
      name: 'Lima Estratégico ALUNA IA',
      hex: '#B5E853',
      role: 'Botón de acción principal en banners oscuros (referencia alunaia.co).',
      usage: 'Llamados a la acción (CTA) sobre cabeceras oscuras esmeralda/marino.',
      contrast: 'Texto oscuro #061A17: 12.4:1 (Cumple WCAG AAA)'
    },
    {
      name: 'Dorado Institucional Sayta',
      hex: '#F5B82E',
      role: 'Acento cálido oficial utilizado en botones destacados y sellos.',
      usage: 'Píldora de Aportar Saber, etiquetas de estrategia y acentos del footer.',
      contrast: 'Texto oscuro #06233B: 9.8:1 (Cumple WCAG AAA)'
    },
    {
      name: 'Cian Tecnológico ALUNA',
      hex: '#0088A9',
      role: 'Acento de enlaces, estados activos y nodos del Laboratorio IA.',
      usage: 'Acentos en modo oscuro, iconos y conexiones de datos.',
      contrast: 'Verificado para ambos temas con variantes semánticas'
    },
    {
      name: 'Abismo Nocturno (Modo Oscuro)',
      hex: '#07131B',
      role: 'Lienzo base de modo oscuro de alta legibilidad.',
      usage: 'Fondo de página en modo oscuro.',
      contrast: 'Texto blanco: 18.2:1 (Cumple WCAG AAA)'
    },
    {
      name: 'Pizarra Profunda (Tarjeta Oscura)',
      hex: '#0D212E',
      role: 'Superficie sólida de tarjetas y modales en modo oscuro.',
      usage: 'Tarjetas de comunidades, biblioteca y paneles en modo oscuro.',
      contrast: 'Texto blanco: 15.6:1 (Cumple WCAG AAA)'
    },
    {
      name: 'Lienzo Institucional Claro',
      hex: '#F8FAFC',
      role: 'Superficie limpia y luminosa inspirada en alunaia.co y /acerca.',
      usage: 'Fondo general en modo claro con tarjetas blancas #FFFFFF.',
      contrast: 'Texto marino #06233B: 15.1:1 (Cumple WCAG AAA)'
    }
  ];

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    showToast(`Código HEX ${hex} copiado al portapapeles.`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#06233B] via-[#004B87] to-[#051815] text-white rounded-3xl p-8 sm:p-12 shadow-md space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold border border-white/25">
          <Palette className="w-4 h-4 text-[#F5B82E]" />
          <span>Manual de Identidad y Sistema de Diseño</span>
        </div>

        <h1 className="font-serif font-bold text-3xl sm:text-5xl tracking-tight leading-tight text-white">
          Guía Visual ALUNA — Ecosistema Institucional
        </h1>

        <p className="text-xs sm:text-base text-slate-200 max-w-3xl leading-relaxed">
          Sistema de diseño alineado con el ecosistema oficial <strong className="text-[#B5E853]">alunaia.co</strong> de la Universidad del Magdalena y verificado bajo estándares de contraste <strong>WCAG 2.2 AA/AAA</strong> tanto en Modo Claro como en Modo Oscuro.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#06233B] font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
          >
            {themeMode === 'light' ? <Moon className="w-4 h-4 text-[#004B87]" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Alternar Tema Activo ({themeMode === 'light' ? 'Modo Claro Activo' : 'Modo Oscuro Activo'})</span>
          </button>
        </div>
      </section>

      {/* SECTION 1: Concepto Creativo */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Sección 01</span>
          <span>•</span>
          <span>Identidad Institucional y Territorio</span>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Coherencia con el Ecosistema Aluna I.A. — UNIMAGDALENA
        </h2>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
          Esta plataforma se integra visualmente como un módulo del ecosistema institucional <strong>Aluna I.A.</strong> de la Universidad del Magdalena. Combina la sobriedad académica (encabezado limpio con escudo institucional y colibrí tecnológico, tipografía de alto contraste, tarjetas definidas y pie de página marino profundo) con el respeto por la autonomía territorial de las comunidades del Caribe y la Sierra Nevada.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-1">
            <strong className="text-[#06233B] dark:text-white block">1. Sobriedad Institucional</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">Superficies limpias en blanco y pizarra con jerarquía tipográfica nítida.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-1">
            <strong className="text-[#004B87] dark:text-aluna-cyan block">2. Contraste WCAG 2.2 AA</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">Tokens semánticos que garantizan lectura óptima en modo claro y modo oscuro.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-1">
            <strong className="text-amber-700 dark:text-[#F5B82E] block">3. Soberanía de Datos</strong>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">Indicadores claros de custodia, visibilidad y permisos de IA en cada tarjeta.</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Moodboard con Recursos Locales Verificados */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Sección 02</span>
          <span>•</span>
          <span>Banco de Referencias Fotográficas Locales</span>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Recursos Verificados de UNIMAGDALENA y Territorio
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] relative">
            <img src="/assets/photos/territorio_sede_murunmuke_sierra_nevada.jpg" alt="Sede Murünmuke" className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white bg-slate-950/75 px-2 py-1 rounded-lg truncate">Sede Murünmuke (Sierra)</span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] relative">
            <img src="/assets/photos/territorio_bahia_pesca_artesanal_montanas.jpg" alt="Pesca Taganga" className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white bg-slate-950/75 px-2 py-1 rounded-lg truncate">Bahía y Pesca Artesanal</span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] relative">
            <img src="/assets/photos/territorio_rio_magdalena_embarcacion.jpg" alt="Río Magdalena" className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white bg-slate-950/75 px-2 py-1 rounded-lg truncate">Río Magdalena y Boga</span>
          </div>

          <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-[16/10] relative">
            <img src="/assets/photos/campus_lago_aerea_limpia.jpg" alt="Lago UNIMAGDALENA" className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold text-white bg-slate-950/75 px-2 py-1 rounded-lg truncate">Lago UNIMAGDALENA</span>
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: Paleta Cromática con HEX y Contrastes */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Secciones 03 & 04</span>
          <span>•</span>
          <span>Paleta Cromática y Tokens HEX</span>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Sistema de Colores y Verificación de Contraste WCAG 2.2 AA
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {colorPalette.map((col) => (
            <div
              key={col.hex}
              className="p-5 rounded-2xl border border-slate-200 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl shadow-sm border border-slate-300 dark:border-white/20 shrink-0" 
                    style={{ backgroundColor: col.hex }} 
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#06233B] dark:text-white">
                      {col.name}
                    </h4>
                    <span className="font-mono text-xs text-[#004B87] dark:text-aluna-cyan font-bold">
                      {col.hex}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyHex(col.hex)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#06233B] dark:hover:text-white"
                  title="Copiar HEX"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                {col.role}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1E3E54] text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                <div><strong className="text-[#06233B] dark:text-slate-200">Uso:</strong> {col.usage}</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold">{col.contrast}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Tipografías y Jerarquías */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Sección 05</span>
          <span>•</span>
          <span>Tipografías y Jerarquía Editorial</span>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Combinación Tipográfica: Editorial + Interfaz Contemporánea
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Serif font showcase */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-3 font-serif">
            <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#005A8D] dark:text-[#F5B82E]">
              Tipografía Editorial / Narrativa: Source Serif 4
            </span>
            <h3 className="text-3xl font-bold text-[#06233B] dark:text-white">
              Títulos con Alma y Resonancia
            </h3>
            <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed italic">
              "El saber no se arrebata: se comparte mediante el diálogo entre generaciones."
            </p>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-[#1E3E54]">
              Uso: Títulos de saberes, subtítulos de portada, citas tradicionales y notas pedagógicas.
            </p>
          </div>

          {/* Sans font showcase */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-3 font-sans">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#004B87] dark:text-aluna-cyan">
              Tipografía de Interfaz: Plus Jakarta Sans / Manrope
            </span>
            <h3 className="text-2xl font-bold text-[#06233B] dark:text-white">
              Navegación Nítida y Formularios Accesibles
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Diseñada para pantallas digitales de cualquier densidad (100%, 125%, 150% DPI y móviles). Asegura lectura ágil en menús, botones, metadatos y cuadros de búsqueda.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-[#1E3E54]">
              Uso: Botones, indicadores de permisos, menús, etiquetas y formularios.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 6 & 7: Botones y Estados */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Secciones 06 & 07</span>
          <span>•</span>
          <span>Componentes UI: Botones y Etiquetas Semánticas</span>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Botones del Sistema (Primario, CTA Hero, Destacado y Deshabilitado)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
            <span className="text-[10px] uppercase font-bold text-slate-500">Primario Institucional</span>
            <button className="w-full py-2.5 px-4 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors">
              Consultar Saber
            </button>
            <span className="text-[10px] text-slate-500 block text-center">Acciones principales</span>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
            <span className="text-[10px] uppercase font-bold text-slate-500">Destacado (Dorado Sayta)</span>
            <button className="w-full py-2.5 px-4 rounded-full bg-[#F5B82E] hover:bg-[#E0A61F] text-[#06233B] font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aportar Saber</span>
            </button>
            <span className="text-[10px] text-slate-500 block text-center">Acción destacada en barra</span>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
            <span className="text-[10px] uppercase font-bold text-slate-500">Custodia / Solicitud</span>
            <button className="w-full py-2.5 px-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors">
              Solicitar Acceso
            </button>
            <span className="text-[10px] text-slate-500 block text-center">Permisos restringidos</span>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
            <span className="text-[10px] uppercase font-bold text-slate-500">Estado Deshabilitado</span>
            <button disabled className="w-full py-2.5 px-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs cursor-not-allowed">
              Acceso Reservado
            </button>
            <span className="text-[10px] text-slate-500 block text-center">Sin autorización</span>
          </div>

        </div>
      </section>

      {/* SECTION 8, 9, 10: Formularios, Menús e Iconografía */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Secciones 08, 09 & 10</span>
          <span>•</span>
          <span>Formularios, Menús e Iconografía Semántica</span>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Formularios Accesibles e Indicadores de Visibilidad
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Form sample */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
            <span className="font-bold text-[#06233B] dark:text-white block">Campo de Texto con Foco Visible:</span>
            <input
              type="text"
              readOnly
              value="Ejemplo con foco: Prácticas de siembra en terrazas"
              className="w-full p-2.5 rounded-xl border-2 border-[#004B87] dark:border-aluna-cyan bg-white dark:bg-[#0D212E] text-[#06233B] dark:text-white outline-none shadow-sm"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Borde institucional de 2px con contraste garantizado ante teclados y tecnologías asistivas.
            </span>
          </div>

          {/* Icons showcase */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54]">
            <span className="font-bold text-[#06233B] dark:text-white block">Etiquetas de Permiso acompañadas de Icono y Texto:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                <Unlock className="w-3.5 h-3.5" /> Público
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Comunitario
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/90 text-orange-900 dark:text-orange-300 font-bold border border-orange-300 dark:border-orange-700">
                <Lock className="w-3.5 h-3.5" /> Restringido
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-[#132C3E] text-[#004B87] dark:text-aluna-cyan font-bold border border-sky-200 dark:border-[#1E3E54]">
                <Bot className="w-3.5 h-3.5" /> IA Soberana
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Nunca se utiliza únicamente el color para comunicar estados de seguridad o acceso.
            </span>
          </div>

        </div>
      </section>

      {/* SECTION 11, 12, 13: Laboratorio, Audio y Atribución */}
      <section className="bg-[#06233B] dark:bg-[#0D212E] text-white rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-[#1E3E54] space-y-6 shadow-md">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#F5B82E] tracking-wider">
          <span>Secciones 11, 12 & 13</span>
          <span>•</span>
          <span>Laboratorio de Saberes y Atribución Estricta</span>
        </div>

        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
          Componente de Cita a la Fuente y Transcripción
        </h2>

        <div className="p-5 rounded-2xl bg-white/10 border border-white/15 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-[#F5B82E] font-bold">
            <Quote className="w-4 h-4" />
            <span>Módulo de Respuesta IA con Cita Literal Verificada</span>
          </div>

          <p className="text-slate-100 font-serif leading-relaxed italic bg-slate-950/40 p-4 rounded-xl border border-white/10">
            "Las terrazas de cultivo en la ladera cumplen dos funciones sagradas y prácticas: primero, calmar la fuerza del agua cuando baja de la serranía para que no se lleve la tierra fértil; segundo, permitir que la humedad se filtre lentamente hacia las raíces."
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 pt-1">
            <span>Atribución: <strong className="text-white">Aura Villafaña (Pueblos de la Sierra Nevada)</strong></span>
            <span className="text-[#B5E853] font-bold">Estado: Borrador sujeto a revisión de custodia</span>
          </div>
        </div>
      </section>

      {/* SECTION 16: Comparador Interactivo Modo Claro vs Modo Oscuro */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Sección 16</span>
          <span>•</span>
          <span>Comparador Interactivo: Modo Claro vs. Modo Oscuro</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
              Visualización Comparativa en una Misma Pantalla
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Comprueba el comportamiento visual y de contraste en ambas modalidades.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0A1924] p-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-[#1E3E54]">
            <button
              onClick={() => setCompareTheme('light')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                compareTheme === 'light' ? 'bg-white text-[#004B87] font-bold shadow-sm' : 'text-slate-500'
              }`}
            >
              Solo Claro
            </button>
            <button
              onClick={() => setCompareTheme('both')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                compareTheme === 'both' ? 'bg-[#004B87] text-white font-bold shadow-sm' : 'text-slate-500'
              }`}
            >
              Comparar Ambos
            </button>
            <button
              onClick={() => setCompareTheme('dark')}
              className={`px-3.5 py-1.5 rounded-full transition-colors ${
                compareTheme === 'dark' ? 'bg-[#132C3E] text-white font-bold shadow-sm' : 'text-slate-500'
              }`}
            >
              Solo Oscuro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Card in Light Mode Simulation */}
          {(compareTheme === 'both' || compareTheme === 'light') && (
            <div className="p-6 rounded-2xl bg-white text-[#06233B] border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-bold uppercase text-[#004B87] flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Modo Claro Institucional
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  Público
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-[#06233B]">
                Cantos de boga y memoria de la navegación fluvial
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-serif">
                Superficie blanca (#FFFFFF) sobre lienzo claro (#F8FAFC) con títulos en azul marino profundo (#06233B) para máxima legibilidad diurna.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-[#004B87] text-white font-bold text-xs hover:bg-[#003865]">
                Consultar saber en modo claro
              </button>
            </div>
          )}

          {/* Card in Dark Mode Simulation */}
          {(compareTheme === 'both' || compareTheme === 'dark') && (
            <div className="p-6 rounded-2xl bg-[#0D212E] text-slate-100 border border-[#1E3E54] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E3E54] pb-2">
                <span className="text-[11px] font-bold uppercase text-[#F5B82E] flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-[#F5B82E]" /> Modo Oscuro Profundo
                </span>
                <span className="text-[10px] bg-aluna-cyan/20 text-aluna-cyan-300 px-2.5 py-0.5 rounded-full font-bold border border-aluna-cyan/30">
                  IA Autorizada
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-white">
                Las Terrazas de Piedra y la Quietud del Agua
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-serif">
                Superficie pizarra profunda (#0D212E) sobre abismo nocturno (#07131B) con texto blanco y gris claro de alto contraste.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-[#005A8D] text-white font-bold text-xs hover:bg-[#0074B4]">
                Consultar saber en modo oscuro
              </button>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 17: Reglas de Uso de Logotipos Institucionales */}
      <section className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-5 text-xs">
        <div className="flex items-center gap-2 text-xs uppercase font-bold text-[#005A8D] dark:text-[#F5B82E] tracking-wider">
          <span>Sección 17</span>
          <span>•</span>
          <span>Uso de Logotipos y Honestidad Institucional</span>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">
          Normas de Integridad de Marca y Símbolos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-2">
            <span className="font-bold text-[#06233B] dark:text-white block">1. Símbolos Oficiales Verificados:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
              <li>Escudo oficial de UNIMAGDALENA junto al logotipo de Aluna I.A.</li>
              <li>Respeto por las proporciones y fondos claros del isotipo del colibrí.</li>
              <li>Presentación explícita como prototipo académico demostrativo.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] space-y-2">
            <span className="font-bold text-[#004B87] dark:text-aluna-cyan block">2. Protección Contra Apropiación Indebida:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
              <li>No se inventan marcas ni se fingen logotipos oficiales de comunidades indígenas o afrodescendientes.</li>
              <li>Todos los relatos y perfiles son simulados con fines pedagógicos.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
};
