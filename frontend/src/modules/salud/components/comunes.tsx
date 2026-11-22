/* Piezas reutilizables de la interfaz (equivalen a los ayudantes de plantilla del prototipo). */
import { useState, type CSSProperties, type ReactNode } from "react";
import { comunidades, type IdComunidad } from "../data/contenido";
import type { Visibilidad } from "../data/tipos";
import { hablar } from "../lib/voz";
import { useApp } from "../state/store";
import { Icono } from "./icons/Icono";
import type { NombreIcono } from "./icons/iconos";

/** Botón redondo «Escuchar» (lee el texto en voz alta). */
export function BotonEscuchar({ texto }: { texto: string }) {
  return (
    <button
      className="escuchar"
      aria-label="Escuchar"
      onClick={e => { e.stopPropagation(); hablar(texto.replace(/'/g, ""), e.currentTarget); }}
    >
      <Icono nombre="sonido" />
    </button>
  );
}

/** Botón grande secundario que lee un texto largo (guías, fichas, historia). */
export function BotonLeer({ texto, children, className = "boton-ancho secundario", style }: {
  texto: string; children: ReactNode; className?: string; style?: CSSProperties;
}) {
  return (
    <button className={className} style={style} onClick={e => hablar(texto, e.currentTarget)}>
      <Icono nombre="sonido" /> {children}
    </button>
  );
}

export function Volver({ texto, onClick }: { texto: string; onClick: () => void }) {
  return <button className="volver" onClick={onClick}>‹ {texto}</button>;
}

/** Tarjeta ancha «opción grande»: ícono · texto · escuchar. */
export function OpcionGrande({ icono, fondo, color, titulo, desc, voz, onClick }: {
  icono: NombreIcono; fondo: string; color?: string; titulo: string; desc: string; voz?: string; onClick: () => void;
}) {
  return (
    <div role="button" className="opcion-grande" onClick={onClick}>
      <span className="ico" style={{ background: fondo, color }}><Icono nombre={icono} /></span>
      <span><strong>{titulo}</strong><small>{desc}</small></span>
      <BotonEscuchar texto={voz ?? `${titulo}. ${desc}`} />
    </div>
  );
}

/** Tarjeta de módulo: ícono en círculo · título · descripción · escuchar. */
export function TarjetaModulo({ icono, fondo, color, titulo, desc, voz, onClick, tituloStyle, extra }: {
  icono: ReactNode; fondo: string; color: string; titulo: string; desc: string; voz: string; onClick: () => void;
  tituloStyle?: CSSProperties; extra?: ReactNode;
}) {
  return (
    <div className="tarjeta-modulo" role="button" onClick={onClick}>
      <div className="icono-circulo" style={{ background: fondo, color }}>{icono}</div>
      <div className="textos"><strong style={tituloStyle}>{titulo}</strong><span>{desc}</span>{extra}</div>
      <BotonEscuchar texto={voz} />
    </div>
  );
}

/** «Compartido» / «Solo comunidad» (solo se ve dentro de Mi comunidad). */
export function Insignia({ x }: { x: { visibilidad?: Visibilidad } }) {
  const ventana = useApp(s => s.nav.ventana);
  if (ventana !== "adentro") return null;
  return x.visibilidad === "afuera"
    ? <span className="insignia-ventana publico">Compartido</span>
    : <span className="insignia-ventana privado">Solo comunidad</span>;
}

/** Comunidad dueña del contenido (solo se ve en Conocer). */
export function EtiquetaComunidad({ x }: { x: { comunidad?: IdComunidad } }) {
  const ventana = useApp(s => s.nav.ventana);
  if (!x.comunidad || ventana !== "afuera") return null;
  const c = comunidades[x.comunidad];
  return <span className="insignia-ventana" style={{ background: c.fondo, color: c.color }}>{c.nombre}</span>;
}

/** Foto de evidencia (cámara del celular o galería). Se reduce antes de guardarla para que viaje bien sin señal. */
export function CampoFoto({ foto, onFoto }: { foto: string | null; onFoto: (f: string | null) => void }) {
  const [cargando, setCargando] = useState(false);
  const cargar = (archivo: File | undefined) => {
    if (!archivo) return;
    setCargando(true);
    const lector = new FileReader();
    lector.onload = () => {
      reducirImagen(String(lector.result)).then(f => { onFoto(f); setCargando(false); });
    };
    lector.readAsDataURL(archivo);
  };
  return (
    <>
      <label className="boton-foto">
        <Icono nombre="camara" /> {cargando ? "Cargando foto…" : foto ? "Cambiar foto" : "Agregar foto (opcional)"}
        <input type="file" accept="image/*" capture="environment" hidden onChange={e => cargar(e.target.files?.[0])} />
      </label>
      {foto && <img className="foto-evidencia" src={foto} alt="Foto adjunta" />}
    </>
  );
}

function reducirImagen(dataUrl: string, lado = 1280): Promise<string> {
  return new Promise(resolver => {
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, lado / Math.max(img.width, img.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(img.width * escala);
      lienzo.height = Math.round(img.height * escala);
      lienzo.getContext("2d")?.drawImage(img, 0, 0, lienzo.width, lienzo.height);
      resolver(lienzo.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolver(dataUrl);
    img.src = dataUrl;
  });
}
