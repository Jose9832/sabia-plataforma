import type { CSSProperties } from "react";
import { comunidades, type IdComunidad } from "../../data/contenido";
import { iconos, simbolos, type NombreIcono } from "./iconos";

interface PropsIcono {
  nombre: NombreIcono;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
}

/** Ícono de línea del sistema visual de SABIA. Por defecto lleva la clase `ico-svg` (24×24). */
export function Icono({ nombre, className = "ico-svg", style, width, height }: PropsIcono) {
  const { d, vb = "0 0 24 24", ancho = 2 } = iconos[nombre];
  return (
    <svg
      className={className || undefined}
      viewBox={vb}
      width={width}
      height={height}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={ancho}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}

/** Símbolo provisional de un síntoma (figura del cuerpo). */
export function Simbolo({ id }: { id: string }) {
  return (
    <svg
      className="simbolo"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: simbolos[id] ?? "" }}
    />
  );
}

/** Ícono propio de cada comunidad (montaña, río, planta). */
export function IconoComunidad({ comunidad, tam = 30 }: { comunidad: IdComunidad; tam?: number }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: comunidades[comunidad].icono }}
    />
  );
}
