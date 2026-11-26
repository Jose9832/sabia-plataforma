import React, { Suspense, lazy, useMemo, useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  PhoneCall,
  LifeBuoy,
  Lock,
  HeartPulse,
  WifiOff
} from 'lucide-react';
import { useAluna } from '../context/AlunaContext';
import type { Sesion } from '../modules/salud/data/tipos';
import type { User, Community } from '../types';

// El módulo de Salud se descarga aparte (y queda en caché para usarse sin internet)
const SaludModulo = lazy(() => import('../modules/salud/SaludModulo').then(m => ({ default: m.SaludModulo })));

type ComunidadSalud = NonNullable<User['saludComunidad']>;

/* Respaldo sin conexión: misma configuración que guarda el servidor en communities.modulo_salud */
const MODULO_POR_COMUNIDAD: Record<string, ComunidadSalud> = {
  comm_sierra: 'indigena',
  comm_afro: 'afro',
  comm_campesinos: 'campesina',
  comm_pescadores: 'campesina',
  comm_palafitos: 'campesina'
};

/** Comunidad del módulo de Salud: solo cuenta una membresía VERIFICADA por la custodia. */
function comunidadDeSalud(user: User, communities: Community[]): ComunidadSalud | null {
  if (user.saludComunidad) return user.saludComunidad;
  for (const a of user.affiliations) {
    if (a.status !== 'verified' || a.role === 'none') continue;
    const modulo = communities.find(c => c.id === a.communityId)?.saludModulo || MODULO_POR_COMUNIDAD[a.communityId];
    if (modulo) return modulo;
  }
  return null;
}

export const WellnessScreen: React.FC = () => {
  const { showToast, currentUser, communities, wellnessItems, authToken, isAuthenticated, isOnline, sendWellnessOrientation } = useAluna();
  const [tab, setTab] = useState<'sabia' | 'canales'>('sabia');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [modalCanal, setModalCanal] = useState<string | null>(null);
  const [needText, setNeedText] = useState('');

  const comunidad = comunidadDeSalud(currentUser, communities);

  /* Sesión compartida con el módulo: misma cuenta, datos aparte (/api/v1/salud) */
  const sesionSalud: Sesion | null = useMemo(() => (
    isAuthenticated && authToken
      ? { token: authToken, usuario: { id: currentUser.id, nombre: currentUser.name, comunidad } }
      : null
  ), [isAuthenticated, authToken, currentUser.id, currentUser.name, comunidad]);

  // P1.5: canales del servicio independiente de Bienestar (nunca indexado en SABIA/Ceiba)
  const filtered = activeCategory === 'all' ? wellnessItems : wellnessItems.filter(w => w.category === activeCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'orientacion':
        return <HelpCircle className="w-5 h-5 text-[#004B87] dark:text-sky-400" />;
      case 'necesidad':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'apoyo':
        return <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'canales':
      default:
        return <PhoneCall className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await sendWellnessOrientation(needText, modalCanal || undefined);
    if (ok) {
      showToast('Canalización orientativa registrada en el módulo independiente de Bienestar (no se almacena en el repositorio de saberes ni en Ceiba).', 'info');
      setModalCanal(null);
      setNeedText('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header with Architectural Separation Notice (P1.5) */}
      <div className="space-y-3">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
          Orientación, Salud Intercultural y Bienestar Comunitario
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Hola, <strong className="text-[#06233B] dark:text-white">{currentUser.name}</strong>. Aquí encuentras primeros auxilios, plantas, derechos y rutas de atención, incluso sin internet.
        </p>
      </div>

      {/* Aviso de separación de datos (Ley 1581 de 2012) */}
      <div className="px-5 py-4 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] border-l-4 border-l-[#F5B82E] text-xs flex items-start gap-3 shadow-sm">
        <Lock className="w-5 h-5 text-[#004B87] dark:text-aluna-cyan shrink-0 mt-0.5" />
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-[#06233B] dark:text-white">Datos aparte.</strong> Este módulo no recopila historias clínicas ni diagnósticos, y nada de lo que hagas aquí pasa por Ceiba ni por el repositorio de saberes (Ley 1581 de 2012). Lo que envíes sin señal se sincroniza al volver la conexión.
        </p>
      </div>

      {/* Tabs: módulo SABIA · canales institucionales */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold" role="tablist">
        {[
          { id: 'sabia' as const, label: 'Salud comunitaria SABIA', icon: <HeartPulse className="w-4 h-4" /> },
          { id: 'canales' as const, label: 'Orientación y canales institucionales', icon: <PhoneCall className="w-4 h-4" /> }
        ].map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border inline-flex items-center gap-2 ${
              tab === t.id
                ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
                : 'bg-white dark:bg-[#0D212E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50 dark:hover:bg-[#132C3E]'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
        {!isOnline && (
          <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
            <WifiOff className="w-3.5 h-3.5" /> Sin conexión · modo local
          </span>
        )}
      </div>

      {tab === 'sabia' && (
        <section aria-label="Módulo de Salud SABIA" className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {comunidad
              ? <>Entraste como integrante verificado: verás la versión de salud de tu comunidad (<strong className="text-[#06233B] dark:text-white">{comunidad === 'indigena' ? 'indígena' : comunidad === 'afro' ? 'afrodescendiente' : 'campesina y territorial'}</strong>), con lectura en voz alta, dictado y la guía <strong>Ceiba</strong>.</>
              : <>Tu perfil no tiene una comunidad verificada: puedes explorar la puerta <strong>Conocer</strong>. Para ver la salud de tu comunidad, solicita tu vinculación y espera la validación de su custodia.</>}
          </p>
          <Suspense fallback={<div className="p-10 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-xs text-slate-500">Cargando el módulo de salud…</div>}>
            <SaludModulo sesion={sesionSalud} />
          </Suspense>
        </section>
      )}

      {tab === 'canales' && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
            {[
              { id: 'all', label: 'Todas las categorías' },
              { id: 'orientacion', label: '1. Solicitar Orientación' },
              { id: 'necesidad', label: '2. Registrar Necesidad Comunitaria' },
              { id: 'apoyo', label: '3. Red de Apoyo a Sabedores' },
              { id: 'canales', label: '4. Canales Institucionales' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${
                  activeCategory === cat.id
                    ? 'bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm'
                    : 'bg-white dark:bg-[#0D212E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50 dark:hover:bg-[#132C3E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(item => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#132C3E]">
                        {getCategoryIcon(item.category)}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#005A8D] dark:text-[#F5B82E]">
                        {item.category}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#132C3E] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1E3E54]">
                      Servicio aislado de RAG
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#1E3E54] text-xs space-y-3">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Público objetivo: <strong className="text-[#06233B] dark:text-white">{item.communityTarget}</strong><br />
                    Enlace de contacto: <strong className="text-[#004B87] dark:text-aluna-cyan">{item.channelInfo}</strong>
                  </div>
                  <button
                    onClick={() => setModalCanal(item.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#132C3E] dark:hover:bg-[#193A50] text-[#06233B] dark:text-white transition-colors border border-slate-200 dark:border-[#1E3E54] text-center"
                  >
                    Canalizar solicitud orientativa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {modalCanal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" className="bg-white dark:bg-[#0D212E] rounded-3xl max-w-md w-full p-6 text-[#06233B] dark:text-white shadow-2xl border border-slate-200 dark:border-[#1E3E54] space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">Canalización Orientativa de Bienestar</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Registra una solicitud de orientación comunitaria o articulación institucional. No ingreses síntomas ni datos clínicos personales.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor="wellness-need-input" className="font-bold text-[#06233B] dark:text-slate-200 block mb-1">
                  Descripción orientativa del requerimiento:
                </label>
                <textarea
                  id="wellness-need-input"
                  rows={3}
                  required
                  minLength={5}
                  placeholder="Ej. Solicitud de mesa de trabajo sobre abastecimiento hídrico en temporada seca..."
                  value={needText}
                  onChange={(e) => setNeedText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalCanal(null)} className="px-4 py-2 rounded-full font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold">
                  Enviar orientación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
