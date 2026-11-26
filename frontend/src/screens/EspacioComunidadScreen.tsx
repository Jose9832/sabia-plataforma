import React, { Suspense, lazy, useMemo } from 'react';
import { useAluna } from '../context/AlunaContext';
import { comunidadDeSalud } from '../modules/salud/comunidadDeSalud';
import type { IdComunidad } from '../modules/salud/data/contenido';
import type { Sesion } from '../modules/salud/data/tipos';

// El espacio se descarga aparte (y queda en caché para usarse sin internet)
const EspacioComunidad = lazy(() => import('../modules/salud/EspacioComunidad').then(m => ({ default: m.EspacioComunidad })));

/** Página nativa de una comunidad: /comunidad-indigena, /comunidad-afro, /comunidad-campesina. */
export const EspacioComunidadScreen: React.FC<{ comunidad: IdComunidad }> = ({ comunidad }) => {
  const { currentUser, communities, authToken, isAuthenticated, setActiveScreen } = useAluna();
  const suya = comunidadDeSalud(currentUser, communities);

  /* Misma cuenta que la plataforma; los datos de salud van aparte (/api/v1/salud) */
  const sesion: Sesion | null = useMemo(() => (
    isAuthenticated && authToken
      ? { token: authToken, usuario: { id: currentUser.id, nombre: currentUser.name, comunidad: suya } }
      : null
  ), [isAuthenticated, authToken, currentUser.id, currentUser.name, suya]);

  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10 text-xs text-slate-500">Cargando el espacio de la comunidad…</div>}>
      <EspacioComunidad
        comunidad={comunidad}
        sesion={sesion}
        onIniciarSesion={() => setActiveScreen('login')}
        onVerComunidades={() => setActiveScreen('communities')}
      />
    </Suspense>
  );
};
