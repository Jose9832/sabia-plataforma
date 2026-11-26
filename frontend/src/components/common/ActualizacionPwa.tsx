import React, { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

/**
 * Aviso de «nueva versión». Sin esto, quien ya visitó la web ve la versión anterior (guardada para
 * funcionar sin internet) en la primera carga después de cada despliegue. Al aceptar, se activa la
 * versión nueva y se recarga; así nadie pierde lo que esté escribiendo sin querer.
 */
export const ActualizacionPwa: React.FC = () => {
  const [hayNueva, setHayNueva] = useState(false);
  const actualizar = useRef<((recargar?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    actualizar.current = registerSW({
      immediate: true,
      onNeedRefresh() { setHayNueva(true); },
      // Busca versiones nuevas cada hora mientras la página siga abierta
      onRegisteredSW(_url, registro) {
        if (registro) setInterval(() => { void registro.update(); }, 60 * 60 * 1000);
      }
    });
  }, []);

  if (!hayNueva) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#06233B] text-white text-xs shadow-xl border border-[#1E3E54] max-w-[calc(100%-2rem)]"
    >
      <span>Hay una versión nueva de SABIA.</span>
      <button
        type="button"
        onClick={() => { void actualizar.current?.(true); }}
        className="px-3 py-1.5 rounded-full bg-[#F5B82E] text-[#06233B] font-bold whitespace-nowrap"
      >
        Actualizar
      </button>
      <button type="button" onClick={() => setHayNueva(false)} aria-label="Cerrar aviso" className="text-slate-300 hover:text-white px-1">×</button>
    </div>
  );
};
