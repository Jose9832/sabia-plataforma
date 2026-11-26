import React from 'react';
import { useAluna } from '../../context/AlunaContext';
import { MODULO_BIENESTAR_VISIBLE } from '../../config/funciones';
import { ShieldCheck, LogIn } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveScreen, demoModeEnabled } = useAluna();

  return (
    <footer className="bg-[#00213D] dark:bg-[#040D14] text-slate-200 border-t border-white/10 pt-14 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1: Official Institutional Lockup */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logos/escudo_unimag_oficial.png" 
                alt="Escudo UNIMAGDALENA" 
                className="w-11 h-11 object-contain shrink-0"
              />
              <div className="h-9 w-px bg-white/20 shrink-0" />
              <div className="bg-white rounded-xl px-3 py-1.5 shadow-sm inline-flex items-center">
                <img 
                  src="/assets/logos/aluna_logo_full.png" 
                  alt="Aluna I.A. UNIMAGDALENA" 
                  className="h-7 object-contain" 
                />
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Módulo <strong>SABIA</strong> de Diálogo de Saberes, preservación comunitaria y consulta asistida con <strong>Ceiba</strong> sobre fuentes autorizadas.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#F5B82E] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Soberanía y Custodia Comunitaria</span>
            </div>
          </div>

          {/* Col 2: Navegación del Ecosistema */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs text-[#F5B82E] uppercase tracking-widest">
              Módulos de la Plataforma
            </h4>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              <li>
                <button onClick={() => setActiveScreen('dashboard')} className="hover:text-[#F5B82E] transition-colors">
                  Inicio · Ecosistema SABIA
                </button>
              </li>
              <li>
                <button onClick={() => setActiveScreen('communities')} className="hover:text-[#F5B82E] transition-colors">
                  Comunidades y Territorios
                </button>
              </li>
              <li>
                <button onClick={() => setActiveScreen('library')} className="hover:text-[#F5B82E] transition-colors">
                  Biblioteca de Saberes
                </button>
              </li>
              <li>
                <button onClick={() => setActiveScreen('ai_lab')} className="hover:text-[#F5B82E] transition-colors">
                  Pregúntale a Ceiba · Laboratorio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveScreen('custodian')} className="hover:text-[#F5B82E] transition-colors">
                  Panel de Custodia Comunitaria
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Gobernanza y Bienestar */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs text-[#F5B82E] uppercase tracking-widest">
              Gobernanza y Cuidado
            </h4>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              <li>
                <button onClick={() => setActiveScreen('upload')} className="hover:text-[#F5B82E] transition-colors">
                  Aportar un Saber Comunitario
                </button>
              </li>
              <li>
                <button onClick={() => setActiveScreen('permissions')} className="hover:text-[#F5B82E] transition-colors">
                  Matriz de Permisos Granulares
                </button>
              </li>
              <li>
                <button onClick={() => setActiveScreen('requests')} className="hover:text-[#F5B82E] transition-colors">
                  Solicitudes de Acceso
                </button>
              </li>
              {MODULO_BIENESTAR_VISIBLE && (
                <li>
                  <button onClick={() => setActiveScreen('wellness')} className="hover:text-[#F5B82E] transition-colors">
                    Orientación y Bienestar (Módulo Independiente)
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Marco Institucional y Sesión */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs text-[#F5B82E] uppercase tracking-widest">
              Marco Institucional ALUNA I.A.
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Universidad del Magdalena · Santa Marta, Colombia. Alineado con la Política Institucional de IA (<strong className="text-white">Acuerdo Superior N.º 06 del 30 de abril de 2026</strong>).
            </p>
            <button
              onClick={() => setActiveScreen('login')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5B82E] hover:bg-[#E0A61F] text-[#06233B] font-bold text-xs transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar sesión o crear cuenta</span>
            </button>
          </div>

        </div>

        {/* Bottom Discreet Demo Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <p className="text-center md:text-left">
            © 2026 Universidad del Magdalena · Aluna I.A. (SABIA & CEIBA).
          </p>
          {demoModeEnabled && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#F5B82E]" />
              <span>Entorno de demostración · Datos y perfiles ficticios</span>
            </div>
          )}
        </div>

      </div>
    </footer>
  );
};
