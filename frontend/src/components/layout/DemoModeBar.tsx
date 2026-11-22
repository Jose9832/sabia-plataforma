import React, { useState } from 'react';
import { useAluna } from '../../context/AlunaContext';
import { 
  Users, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  Shield, 
  Eye, 
  GraduationCap, 
  Flower2, 
  X,
  Play,
  Waves,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DemoModeBar: React.FC = () => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    resetDemoData, 
    runScenario,
    activeScenarioNumber
  } = useAluna();

  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [expandedSwitcher, setExpandedSwitcher] = useState(false);

  const demoScenarios = [
    {
      num: 1,
      title: 'Escenario 1: Cambio Dinámico de Saber en el Laboratorio',
      desc: 'Comprobar que al cambiar entre Terrazas, Cantos de Boga y Mareas, cambian totalmente las diapositivas, las preguntas y las respuestas sin arrastrar datos del anterior.',
      userToSet: 'user_researcher'
    },
    {
      num: 2,
      title: 'Escenario 2: Cambio de Usuario y Niveles de Visibilidad',
      desc: 'Ingresar como Visitante (solo ve públicos), cambiar a Integrante Comunitaria (ve saberes de su pueblo) y a integrante de otra comunidad (no ve restringidos ajenos).',
      userToSet: 'user_visitor'
    },
    {
      num: 3,
      title: 'Escenario 3: Aportación Externa con Revisión Obligatoria',
      desc: 'Como Estudiante Investigador, proponer un saber. Verificar que queda en revisión sin publicarse solo, hasta que el custodio lo autoriza.',
      userToSet: 'user_researcher'
    },
    {
      num: 4,
      title: 'Escenario 4: Comunidades Independientes (Sin Custodio Universal)',
      desc: 'Verificar que Mamo Senen (Sierra) solo puede gestionar la Sierra Nevada, y NO puede aprobar o modificar saberes afrodescendientes o de pescadores.',
      userToSet: 'user_custodian_sierra'
    },
    {
      num: 5,
      title: 'Escenario 5: Disociación de Permiso de Lectura vs. Permiso de IA',
      desc: 'Consultar el saber reservado "Actas de la Línea Negra": tiene lectura para el custodio pero IA TOTALMENTE PROHIBIDA. Luego conceder permiso de IA en vivo.',
      userToSet: 'user_custodian_sierra'
    },
    {
      num: 6,
      title: 'Escenario 6: Saber Compartido entre Múltiples Comunidades',
      desc: 'El "Pacto de agua limpia" pertenece a Sierra y Taganga. Requiere consentimiento de AMBAS comunidades: Sierra ya aprobó, falta la aprobación de Marino en Taganga.',
      userToSet: 'user_member_pesca'
    },
    {
      num: 7,
      title: 'Escenario 7: Estabilidad Responsiva y Restablecimiento',
      desc: 'Comprobar que todas las tarjetas, formularios y modales se adaptan fluidamente en móviles de 320px hasta pantallas 4K sin desbordamientos horizontales.',
      userToSet: 'user_visitor'
    }
  ];

  const getRoleIcon = (id: string) => {
    switch (id) {
      case 'user_visitor':
        return <Eye className="w-3.5 h-3.5 text-sky-300" />;
      case 'user_researcher':
        return <GraduationCap className="w-3.5 h-3.5 text-cyan-300" />;
      case 'user_member_sierra':
        return <Flower2 className="w-3.5 h-3.5 text-amber-300" />;
      case 'user_custodian_sierra':
        return <Shield className="w-3.5 h-3.5 text-emerald-300" />;
      case 'user_custodian_afro':
        return <Shield className="w-3.5 h-3.5 text-purple-300" />;
      case 'user_member_pesca':
        return <Waves className="w-3.5 h-3.5 text-teal-300" />;
      default:
        return <Users className="w-3.5 h-3.5" />;
    }
  };

  return (
    <aside aria-label="Barra de simulación evaluativa" className="bg-[#06233B] dark:bg-[#050D13] text-white border-b border-slate-800 text-xs py-1.5 px-4 sticky top-16 z-30 transition-colors">
      <div className="max-w-7xl mx-auto">
        
        {/* Compact Single Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Left: Demo Label & Active Identity */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-sky-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border border-white/15 whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-[#F5B82E]" />
              <span>Simulación</span>
            </span>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-200">
              <span className="text-slate-400 hidden sm:inline">Identidad activa:</span>
              <button
                onClick={() => setExpandedSwitcher(!expandedSwitcher)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#004B87] hover:bg-[#005A9C] text-white font-semibold border border-sky-400/40 transition-colors whitespace-nowrap"
                title="Desplegar selector de los 6 perfiles de prueba"
              >
                {getRoleIcon(currentUser.id)}
                <span>{currentUser.name}</span>
                <span className="hidden md:inline text-sky-200 text-[10px]">
                  ({currentUser.roleLabel})
                </span>
                {expandedSwitcher ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Right: Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedSwitcher(!expandedSwitcher)}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-medium border border-white/15 transition-colors whitespace-nowrap"
            >
              <Users className="w-3 h-3 text-sky-300" />
              <span>Cambiar Rol (6)</span>
            </button>

            <button
              onClick={() => setShowScenarioModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5B82E]/20 text-[#F5B82E] hover:bg-[#F5B82E]/30 border border-[#F5B82E]/40 font-semibold text-[11px] transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-3 h-3" />
              <span>7 Escenarios</span>
            </button>

            <button
              onClick={resetDemoData}
              title="Restablecer todos los datos ficticios y permisos"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/15 whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden md:inline">Restablecer</span>
            </button>
          </div>
        </div>

        {/* Collapsible Identity Switcher Tray */}
        {expandedSwitcher && (
          <div className="mt-2 pt-2 border-t border-white/15 flex flex-wrap items-center gap-1.5 pb-1 animate-fade-in">
            <span className="text-[11px] text-slate-300 font-semibold mr-1">
              Seleccionar perfil simulado:
            </span>
            {users.map(u => {
              const isSelected = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setExpandedSwitcher(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors text-[11px] font-medium border whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#004B87] text-white border-sky-300 font-bold'
                      : 'bg-white/5 text-slate-200 border-white/15 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {getRoleIcon(u.id)}
                  <span>{u.name}</span>
                  <span className="opacity-75 text-[10px]">
                    · {u.identity === 'visitor' ? 'Visitante' : u.identity === 'researcher' ? 'Investigador' : 'Comunidad'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* 7 Scenarios Modal */}
      {showScenarioModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D212E] rounded-3xl max-w-2xl w-full p-6 text-[#06233B] dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-[#1E3E54] max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E3E54]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-aluna-cyan/20 text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-aluna-cyan/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
                    Los 7 Escenarios de Prueba Obligatorios
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Ejecuta cada caso para verificar la gobernanza comunitaria y la dinámica del Laboratorio.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScenarioModal(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-[#163244]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scenarios List */}
            <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
              {demoScenarios.map((sc) => {
                const isSelected = activeScenarioNumber === sc.num;
                return (
                  <div
                    key={sc.num}
                    className={`p-4 rounded-2xl border transition-colors flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-sky-50/90 dark:bg-[#132C3E] border-[#004B87] dark:border-aluna-cyan'
                        : 'bg-slate-50 dark:bg-[#0A1924] border-slate-200 dark:border-[#1E3E54] hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#004B87] dark:bg-aluna-cyan text-white dark:text-[#061A17] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {sc.num}
                        </span>
                        <h4 className="font-bold text-xs text-[#06233B] dark:text-white">
                          {sc.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-7 leading-relaxed font-sans">
                        {sc.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        runScenario(sc.num);
                        setShowScenarioModal(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#004B87] hover:bg-[#003865] dark:bg-aluna-cyan dark:hover:bg-aluna-cyan-light text-white dark:text-[#061A17] font-bold text-xs shrink-0 transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Ejecutar</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#1E3E54] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Al pulsar "Ejecutar", se activa el usuario y la pantalla requerida automáticamente.
              </span>
              <button
                onClick={() => setShowScenarioModal(false)}
                className="px-4 py-2 rounded-full bg-slate-200 dark:bg-[#163244] text-[#06233B] dark:text-white font-semibold hover:bg-slate-300"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </aside>
  );
};
