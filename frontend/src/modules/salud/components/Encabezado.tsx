import { comunidades, navs } from "../data/contenido";
import { enLinea, useApp } from "../state/store";
import { Icono, IconoComunidad } from "./icons/Icono";

function BotonesNav() {
  const nav = useApp(s => s.nav);
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  const ir = useApp(s => s.ir);
  const lista = nav.ventana === "adentro" && comunidad === "campesina" ? navs.campesina : navs[nav.ventana ?? "afuera"];
  return (
    <>
      {lista.map(([id, nombre]) => (
        <button key={id} className={nav.pantalla === id ? "activo" : ""} onClick={() => ir(id)} aria-label={nombre}>
          <Icono nombre={id} /><span>{nombre}</span>
        </button>
      ))}
    </>
  );
}

export function Encabezado() {
  const nav = useApp(s => s.nav);
  const sesion = useApp(s => s.sesion);
  const enRed = useApp(s => enLinea(s));
  const pendientes = useApp(s => s.cola.filter(o => o.usuario_id === s.sesion?.usuario.id).length);
  const alternarRed = useApp(s => s.alternarRed);
  const ir = useApp(s => s.ir);
  const conVentana = nav.pantalla !== "puertas" && nav.pantalla !== "acceso";

  return (
    <header className="encabezado">
      <div className="fila-encabezado">
        <div className="marca">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" aria-hidden="true">
            <path d="M2 20 L9 8 L13 14 L16 10 L22 20 Z" /><circle cx="17" cy="5" r="2" />
          </svg>
          <h1>SABIA <small>Saberes vivos · Aluna I.A.</small></h1>
        </div>
        <nav className="menu-superior" aria-label="Secciones">{conVentana && <BotonesNav />}</nav>
        <button
          className={`estado-red${enRed ? "" : " offline"}`}
          id="estadoRed"
          onClick={alternarRed}
          title={pendientes ? `${pendientes} envío(s) esperando señal` : "Toca para simular que no hay señal"}
        >
          <span className="punto"></span><span id="textoRed">{enRed ? "En línea" : "Sin conexión"}</span>
          {pendientes > 0 && <span className="contador-cola" aria-label={`${pendientes} envíos en cola`}>{pendientes}</span>}
        </button>
      </div>
      {conVentana && (
        <button className="boton-puerta" id="botonPuerta" onClick={() => ir("puertas")}>
          {nav.ventana === "adentro" && sesion?.usuario.comunidad ? (
            <>
              <IconoComunidad comunidad={sesion.usuario.comunidad} tam={22} />{" "}
              <b>Comunidad {comunidades[sesion.usuario.comunidad].nombre}</b><span className="cambiar">Cambiar puerta ⇄</span>
            </>
          ) : (
            <><Icono nombre="mundo" /> <b>Conocer</b><span className="cambiar">Cambiar puerta ⇄</span></>
          )}
        </button>
      )}
    </header>
  );
}

export function MenuInferior() {
  const pantalla = useApp(s => s.nav.pantalla);
  const conVentana = pantalla !== "puertas" && pantalla !== "acceso";
  return <nav className="menu-inferior" id="menu">{conVentana && <BotonesNav />}</nav>;
}
