import { useEffect, useRef, useState, type JSX } from "react";
import { Kora } from "./components/Kora";
import { Icono, IconoComunidad } from "./components/icons/Icono";
import { PantallaMedico, Toast } from "./components/Superpuestos";
import { comunidades, navs, type IdComunidad, type Pantalla } from "./data/contenido";
import type { Sesion } from "./data/tipos";
import { enLinea, useApp } from "./state/store";
import "./styles/index.css";
import { Aprende } from "./views/Aprende";
import { Ayuda } from "./views/ayuda/Ayuda";
import { Finca } from "./views/finca/Finca";
import { Historias } from "./views/Historias";
import { Inicio } from "./views/Inicio";
import { Memoria } from "./views/Memoria";
import { Participa } from "./views/participa/Participa";
import { Salud } from "./views/salud/Salud";

const vistas: Partial<Record<Pantalla, () => JSX.Element>> = {
  inicio: Inicio,
  salud: Salud,
  memoria: Memoria,
  ayuda: Ayuda,
  historias: Historias,
  finca: Finca,
  participa: Participa,
  aprende: Aprende
};

/* Lo que se ve sin ser integrante verificado: solo lo que la comunidad decidió compartir */
const PUBLICAS: Pantalla[] = ["inicio", "memoria", "historias", "aprende"];

interface Props {
  comunidad: IdComunidad;
  /** Sesión de la plataforma (o null si no hay sesión) */
  sesion: Sesion | null;
  onIniciarSesion: () => void;
  onVerComunidades: () => void;
}

/**
 * Espacio propio de una comunidad (ruta /comunidad-indigena, /comunidad-afro, /comunidad-campesina).
 * Reúne las secciones del antiguo prototipo (Salud, Participa, Memoria, Ayuda) como páginas nativas de
 * la plataforma. Integrantes verificados ven todo lo de su comunidad; el resto, solo lo compartido.
 * Sus datos viven aparte (/api/v1/salud) y nunca pasan por Ceiba IA ni por el repositorio cultural.
 */
export function EspacioComunidad({ comunidad, sesion, onIniciarSesion, onVerComunidades }: Props) {
  const raiz = useRef<HTMLDivElement>(null);
  useEffect(() => { useApp.getState().iniciar(); }, []);
  useEffect(() => { useApp.getState().setPedirSesion(onIniciarSesion); return () => useApp.getState().setPedirSesion(null); }, [onIniciarSesion]);
  useEffect(() => { useApp.getState().conectarSesion(sesion); }, [sesion]);
  /* Va después de conectarSesion: al cambiar de espacio se recalcula si la persona es integrante */
  useEffect(() => { useApp.getState().abrirEspacio(comunidad); }, [comunidad, sesion?.usuario.id, sesion?.usuario.comunidad]);

  const nav = useApp(s => s.nav);
  const conectado = useApp(s => enLinea(s));
  const servidorCaido = useApp(s => s.servidorCaido);
  const pendientes = useApp(s => s.cola.filter(o => o.usuario_id === s.sesion?.usuario.id).length);
  const alternarRed = useApp(s => s.alternarRed);
  const ir = useApp(s => s.ir);
  const hayFrase = useApp(s => !!(s.ui.parteSel || s.ui.sintomaSel));

  const info = comunidades[comunidad];
  const miembro = sesion?.usuario.comunidad === comunidad;
  const pestanas = (miembro ? (comunidad === "campesina" ? navs.campesina : navs.adentro) : navs.afuera)
    .filter(([id]) => miembro || id !== "aprende" || comunidad === "afro");
  const pantalla: Pantalla = miembro || PUBLICAS.includes(nav.pantalla) ? nav.pantalla : "inicio";
  const Vista = vistas[pantalla] ?? Inicio;

  /* La barra «Frase para el médico» está visible: el botón de Ceiba sube para no taparla */
  const vistaDecir = pantalla === "salud" && (comunidad === "indigena" || (comunidad === "campesina" && nav.sub === "decir"));
  const conFrase = vistaDecir && hayFrase;

  /* Al cambiar de sección se vuelve al comienzo del contenido y se anima la entrada */
  const [animada, setAnimada] = useState(-1);
  const animar = animada !== nav.n;
  useEffect(() => {
    const caja = raiz.current?.getBoundingClientRect();
    if (nav.n > 1 && caja && caja.top < 0) window.scrollBy({ top: caja.top - 80 });
    const t = setTimeout(() => setAnimada(nav.n), 600);
    return () => clearTimeout(t);
  }, [nav.n]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6" ref={raiz}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="w-14 h-14 rounded-2xl inline-flex items-center justify-center shrink-0 border border-slate-200 dark:border-[#1E3E54]"
            style={{ background: info.fondo, color: info.color }}
          >
            <IconoComunidad comunidad={comunidad} tam={30} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#004B87] dark:text-aluna-cyan">Espacio de comunidad</p>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">{info.titulo}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{info.desc}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={alternarRed}
          title={pendientes ? `${pendientes} envío(s) esperando señal` : "Toca para simular que no hay señal"}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            conectado && !servidorCaido
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${conectado && !servidorCaido ? "bg-emerald-500" : "bg-amber-500"}`} />
          {!conectado ? "Sin conexión" : servidorCaido ? "Sin respuesta del servidor" : "En línea"}
          {pendientes > 0 && <span className="px-1.5 rounded-full bg-amber-200 text-amber-900">{pendientes}</span>}
        </button>
      </header>

      <nav className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold" role="tablist" aria-label={`Secciones de ${info.titulo}`}>
        {pestanas.map(([id, nombre]) => (
          <button
            key={id}
            role="tab"
            aria-selected={pantalla === id}
            onClick={() => ir(id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors border inline-flex items-center gap-2 ${
              pantalla === id
                ? "bg-[#004B87] text-white border-[#004B87] font-bold shadow-sm"
                : "bg-white dark:bg-[#0D212E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1E3E54] hover:bg-slate-50 dark:hover:bg-[#132C3E]"
            }`}
          >
            <Icono nombre={id} className="w-4 h-4" />
            {nombre}
          </button>
        ))}
      </nav>

      {!miembro && (
        <div className="px-5 py-4 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] border-l-4 border-l-[#F5B82E] text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
            <strong className="text-[#06233B] dark:text-white">Estás viendo lo que esta comunidad decidió compartir.</strong>{" "}
            Salud, participación y ayuda son para integrantes verificados por su custodia.
          </p>
          <div className="flex gap-2 shrink-0">
            {!sesion && (
              <button type="button" onClick={onIniciarSesion} className="px-3.5 py-1.5 rounded-full bg-[#004B87] text-white font-bold">Iniciar sesión</button>
            )}
            <button type="button" onClick={onVerComunidades} className="px-3.5 py-1.5 rounded-full bg-[#F5B82E] text-[#06233B] font-bold">Solicitar vinculación</button>
          </div>
        </div>
      )}

      <div className="sabia-modulo">
        <div className={`telefono ${nav.ventana ?? "afuera"}${conFrase ? " con-frase" : ""}`} id="telefono">
          {/* key: cada navegación vuelve a montar el contenido y repite la micro-animación de entrada */}
          <main className={`contenido${animar ? " entrada" : ""}`} id="contenido" data-pantalla={pantalla} key={`${comunidad}-${nav.n}`}>
            <Vista />
          </main>
          <PantallaMedico />
          <Kora />
          <Toast />
        </div>
      </div>
    </div>
  );
}
