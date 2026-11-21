import type { ReactNode } from "react";
import { Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { brigadas, transportes } from "../../data/contenido";
import type { Lugar } from "../../data/tipos";
import { consultaMapa } from "../../lib/utilidades";
import { enLinea, useApp } from "../../state/store";

export function Hospitales({ lista, chips, nota }: { lista: Lugar[]; chips?: ReactNode; nota?: string | null }) {
  const abierto = useApp(s => s.ui.hospitalAbierto);
  const enRed = useApp(s => enLinea(s));
  const { ir, setUi } = useApp.getState();
  return (
    <>
      <Volver texto="Ayuda" onClick={() => { setUi({ hospitalAbierto: null }); ir("ayuda"); }} />
      <h2 className="titulo-modulo">{chips ? "Dónde me atienden" : "Hospitales en Santa Marta"}</h2>
      <p style={{ color: "var(--texto-suave)", marginBottom: 14 }}>Toca un lugar para ver su ubicación</p>
      {chips}
      <div className="lista-lugares">
        {lista.map(h => {
          const esAbierto = abierto === h.id;
          return (
            <div key={h.id} className={`lugar${esAbierto ? " abierto" : ""}`}>
              <button className="lugar-cabecera" onClick={() => setUi({ hospitalAbierto: esAbierto ? null : h.id })}>
                <span className="lugar-ico puesto"><Icono nombre="hospital" /></span>
                <span className="lugar-info">
                  <strong>{h.nombre}</strong>
                  <span className="sub">{h.tipo}</span>
                </span>
                <span style={{ color: "var(--tierra-clara)", fontSize: 22 }}>{esAbierto ? "˄" : "˅"}</span>
              </button>
              {esAbierto && (
                <div className="lugar-detalle">
                  <div className="dato-fila"><span style={{ color: "var(--azul)" }}><Icono nombre="pin" /></span>
                    <div><b>Ubicación</b><span className="direccion-grande">{h.direccion}</span><br />Santa Marta, Magdalena</div></div>
                  {enRed
                    ? <div className="mapa"><iframe src={`https://maps.google.com/maps?q=${consultaMapa(h)}&z=16&output=embed`} loading="lazy" title={`Mapa de ${h.nombre}`}></iframe></div>
                    : <div className="sin-red">Sin conexión: el mapa se carga cuando haya internet. La dirección está guardada en el teléfono.</div>}
                  <div className="acciones-lugar">
                    <a href={`https://www.google.com/maps/search/?api=1&query=${consultaMapa(h)}`} target="_blank" rel="noopener">Abrir en Google Maps</a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="fuente">{nota || "Direcciones tomadas de directorios públicos de salud (2024). Verificar antes de usar."}<br />Los médicos tradicionales se registrarán solo con autorización de la comunidad.</p>
    </>
  );
}

/* AYUDA CAMPESINA: puestos veredales, brigadas y transporte */
export function LugaresCampo() {
  const filtro = useApp(s => s.ui.filtroLugares);
  const lugares = useApp(s => s.datos.lugares);
  const { ir, setUi, aviso } = useApp.getState();
  const filtros: [typeof filtro, string][] = [["ciudad", "Santa Marta"], ["rurales", "Puestos rurales"], ["brigadas", "Brigadas y transporte"]];
  const chips = (
    <div className="filtros">
      {filtros.map(([id, t]) => (
        <button key={id} className={`chip ${filtro === id ? "activo" : ""}`} onClick={() => setUi({ filtroLugares: id, hospitalAbierto: null })}>{t}</button>
      ))}
    </div>
  );

  if (filtro === "brigadas") return (
    <>
      <Volver texto="Ayuda" onClick={() => { setUi({ hospitalAbierto: null }); ir("ayuda"); }} />
      <h2 className="titulo-modulo">Dónde me atienden</h2>
      {chips}
      <div className="titulo-seccion" style={{ marginTop: 6 }}>Próximas brigadas de salud</div>
      {brigadas.map(b => (
        <div key={b.fecha} className="tramite"><div className="fila"><span className="emo" style={{ color: "var(--verde)" }}><Icono nombre="calendario" /></span>
          <div><strong>{b.fecha}</strong><small>{b.lugar}</small></div></div>
          <ul><li>{b.servicios}</li></ul></div>
      ))}
      <div className="titulo-seccion">Transporte y ambulancias</div>
      {transportes.map(t => (
        <div key={t.nombre} className="tramite"><div className="fila"><span className="emo" style={{ color: "var(--azul)" }}><Icono nombre="camino" /></span>
          <div style={{ flex: 1 }}><strong>{t.nombre}</strong><small>{t.detalle}</small></div>
          {t.contacto
            ? <a className="boton-mini" href={`tel:${t.contacto}`}>Llamar</a>
            : <button className="boton-mini" onClick={() => aviso("Contacto pendiente: la JAC debe registrarlo")}>Llamar</button>}</div></div>
      ))}
      <p className="fuente">Brigadas y transporte son datos de ejemplo. La Junta de Acción Comunal los mantiene al día.</p>
    </>
  );

  const lista = lugares.filter(l => l.categoria === (filtro === "rurales" ? "rural" : "hospital"));
  return <Hospitales lista={lista} chips={chips}
    nota={filtro === "rurales" ? "Centros de la red pública distrital en zona rural. Horarios: consultar en cada puesto." : null} />;
}
