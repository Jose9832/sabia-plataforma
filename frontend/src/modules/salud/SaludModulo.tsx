import { useEffect, useRef, useState, type JSX } from "react";
import { Encabezado, MenuInferior } from "./components/Encabezado";
import { Kora } from "./components/Kora";
import { PantallaMedico, Toast } from "./components/Superpuestos";
import type { Pantalla } from "./data/contenido";
import type { Sesion } from "./data/tipos";
import { useApp } from "./state/store";
import "./styles/index.css";
import { Acceso } from "./views/Acceso";
import { Aprende } from "./views/Aprende";
import { Ayuda } from "./views/ayuda/Ayuda";
import { Finca } from "./views/finca/Finca";
import { Historias } from "./views/Historias";
import { Inicio } from "./views/Inicio";
import { Memoria } from "./views/Memoria";
import { Participa } from "./views/participa/Participa";
import { Puertas } from "./views/Puertas";
import { Salud } from "./views/salud/Salud";

const vistas: Record<Pantalla, () => JSX.Element> = {
  puertas: Puertas,
  acceso: Acceso,
  inicio: Inicio,
  salud: Salud,
  memoria: Memoria,
  ayuda: Ayuda,
  historias: Historias,
  finca: Finca,
  participa: Participa,
  aprende: Aprende
};

/**
 * Módulo de Salud SABIA dentro de ALUNA (pantalla «Bienestar»).
 * Recibe la sesión de la plataforma; sus datos viven aparte (/api/v1/salud) y nunca
 * pasan por Ceiba ni por el repositorio cultural. Sus estilos están aislados bajo
 * `.sabia-modulo` (ver postcss.config.js), así que no chocan con Tailwind.
 */
export function SaludModulo({ sesion }: { sesion: Sesion | null }) {
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => { useApp.getState().iniciar(); }, []);
  useEffect(() => { useApp.getState().conectarSesion(sesion); }, [sesion]);

  const nav = useApp(s => s.nav);
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  const hayFrase = useApp(s => !!(s.ui.parteSel || s.ui.sintomaSel));

  const conVentana = nav.pantalla !== "puertas" && nav.pantalla !== "acceso";
  /* La barra «Frase para el médico» está visible: el botón de Ceiba sube para no taparla */
  const vistaDecir = nav.pantalla === "salud" && (comunidad === "indigena" || (comunidad === "campesina" && nav.sub === "decir"));
  const conFrase = vistaDecir && hayFrase;

  /* Al cambiar de pantalla se vuelve arriba (en la web se desplaza la página) y se anima la entrada.
     La clase «entrada» se quita al terminar, igual que el prototipo: los cambios dentro de la misma
     pantalla (marcar una opción, abrir un formulario) no vuelven a animarse. */
  const [animada, setAnimada] = useState(-1);
  const animar = animada !== nav.n;
  useEffect(() => {
    /* Al cambiar de pantalla del módulo, se vuelve al comienzo del módulo (no de la página) */
    const caja = raiz.current?.getBoundingClientRect();
    if (nav.n > 0 && caja && caja.top < 0) window.scrollBy({ top: caja.top - 80 });
    const t = setTimeout(() => setAnimada(nav.n), 600);
    return () => clearTimeout(t);
  }, [nav.n]);

  const Vista = vistas[nav.pantalla] ?? Inicio;

  return (
    <div className="sabia-modulo" ref={raiz}>
    <div className={`telefono ${conVentana ? nav.ventana ?? "afuera" : "sin-ventana"}${conFrase ? " con-frase" : ""}`} id="telefono">
      <Encabezado />
      {/* key: cada navegación vuelve a montar el contenido y repite la micro-animación de entrada */}
      <main className={`contenido${animar ? " entrada" : ""}`} id="contenido" data-pantalla={nav.pantalla} key={nav.n}>
        <Vista />
      </main>
      <MenuInferior />
      <footer className="pie-web">
        <b>SABIA</b> · Saberes, Ancestralidad, Bioculturalidad e Inteligencia Articulada<br />
        Piloto · Universidad del Magdalena · Funciona sin internet
      </footer>
      <PantallaMedico />
      <Kora />
      <Toast />
    </div>
    </div>
  );
}
