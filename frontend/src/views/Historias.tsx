import { EtiquetaComunidad, Volver } from "../components/comunes";
import { Icono } from "../components/icons/Icono";
import { comunidades } from "../data/contenido";
import { cuadrosQr } from "../lib/utilidades";
import { useApp } from "../state/store";

/* QR de ejemplo, generado de forma determinista para cada historia */
function QrEjemplo({ semilla }: { semilla: number }) {
  const esquina = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox="0 0 21 21" fill="#2E2A24" aria-label="Código QR de ejemplo">
      {cuadrosQr(semilla).map(([x, y]) => <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" />)}
      {esquina(0, 0)}{esquina(14, 0)}{esquina(0, 14)}
    </svg>
  );
}

/* ---------- HISTORIAS (Conocer) ---------- */
export function Historias() {
  const detalle = useApp(s => s.nav.detalle);
  const historias = useApp(s => s.datos.historias);
  const { ir, aviso } = useApp.getState();

  if (detalle) {
    const h = historias.find(x => x.id === detalle);
    if (!h) return <Volver texto="Historias" onClick={() => ir("historias")} />;
    return (
      <>
        <Volver texto="Historias" onClick={() => ir("historias")} />
        <div className="tarjeta-palabra">
          <div className="foto-planta grande" style={{ background: h.color, color: "var(--tierra)" }}>
            <Icono nombre="hilo" className="" width={70} height={70} style={{ opacity: 0.6 }} /><span>Foto</span>
          </div>
          <div className="cuerpo">
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>{h.nombre}</h2>
            <div className="dato-fila"><span></span><div><b>Hecho por</b>{h.autor} · Comunidad {comunidades[h.comunidad].nombre}</div></div>
            <div className="dato-fila"><span></span><div><b>Material</b>{h.material}</div></div>
            <div className="seccion-titulo">Su historia</div>
            <p className="ejemplo">{h.historia}</p>
            <div className="qr-caja">
              <QrEjemplo semilla={h.id} />
              <p><b>Etiqueta con QR</b><br />Al escanearlo, cualquier persona puede leer esta historia.<br /><small style={{ color: "var(--texto-suave)" }}>(QR de ejemplo)</small></p>
            </div>
            {h.contacto_autorizado && <>
              <div className="seccion-titulo">Compra directa</div>
              <p style={{ fontSize: 14, color: "var(--texto-suave)" }}>La asociación autorizó su contacto para vender sin intermediarios.</p>
              {h.whatsapp
                ? <a className="boton-ancho boton-whatsapp" href={`https://wa.me/${h.whatsapp}`} target="_blank" rel="noopener"><Icono nombre="chat" /> Contactar a la asociación</a>
                : <button className="boton-ancho boton-whatsapp" onClick={() => aviso("Número pendiente: la asociación debe registrarlo")}><Icono nombre="chat" /> Contactar a la asociación</button>}
            </>}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="titulo-modulo">Historias</h2>
      <p style={{ color: "var(--texto-suave)", marginBottom: 14 }}>Quién hace lo que hacemos y qué significa</p>
      {historias.map(h => (
        <button key={h.id} className="historia" onClick={() => ir("historias", null, h.id)}>
          <div className="franja" style={{ background: h.color }}><Icono nombre="hilo" /></div>
          <div className="info"><strong>{h.nombre}</strong><small>{h.autor}</small><div style={{ marginTop: 6 }}><EtiquetaComunidad x={h} /></div></div>
        </button>
      ))}
    </>
  );
}
