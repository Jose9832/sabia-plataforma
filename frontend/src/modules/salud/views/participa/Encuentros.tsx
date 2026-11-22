import { EtiquetaComunidad, Insignia, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import type { Encuentro } from "../../data/tipos";
import { enLinea, operacionesPendientes, useApp } from "../../state/store";

export function TarjetaEncuentro({ e, conInscripcion }: { e: Encuentro; conInscripcion: boolean }) {
  const inscrito = useApp(s => s.datos.registros.inscripciones.includes(e.id));
  const pendiente = useApp(s => !s.sincronizando && operacionesPendientes(s.cola, "inscripcion", s.sesion?.usuario.id)
    .some(o => o.datos.encuentro_id === e.id));
  const { encolar, aviso } = useApp.getState();
  const color = e.tipo === "Capacitación" ? "#8A3B22" : e.tipo === "Reunión" ? "var(--azul)" : "var(--verde)";

  function inscribirse() {
    encolar("inscripcion", { encuentro_id: e.id });
    aviso(enLinea(useApp.getState()) ? "Listo, quedaste inscrito" : "Sin señal: tu inscripción se enviará cuando haya internet");
  }
  const enCola = useApp(s => operacionesPendientes(s.cola, "inscripcion", s.sesion?.usuario.id).some(o => o.datos.encuentro_id === e.id));

  return (
    <div className="lugar oferta encuentro">
      <div className="encuentro-fecha" style={{ color }}><Icono nombre="agenda" /><span>{e.fecha} · {e.hora}</span></div>
      <span className="tipo-encuentro" style={{ color }}>{e.tipo}</span>
      <strong className="encuentro-titulo">{e.titulo}</strong>
      <p className="encuentro-desc">{e.descripcion}</p>
      <div className="oferta-datos">
        <div><b>Dónde</b>{e.lugar}</div>
        <div><b>Lo orienta</b>{e.orienta}</div>
      </div>
      <div className="alerta-pie" style={{ marginTop: 0 }}>
        <span><Insignia x={e} /><EtiquetaComunidad x={e} /></span>
        {conInscripcion
          ? (inscrito || enCola
            ? <span className={`estado-envio ${pendiente ? "pendiente" : "ok"}`}>{pendiente ? "Inscripción esperando señal" : "Estás inscrito"}</span>
            : <button className="boton-mini" onClick={inscribirse}>Me inscribo</button>)
          : <button className="boton-mini" onClick={() => aviso("Inscripción simulada. Te esperamos.")}>Quiero asistir</button>}
      </div>
    </div>
  );
}

export function Encuentros() {
  const encuentros = useApp(s => s.datos.encuentros);
  const ir = useApp(s => s.ir);
  return (
    <>
      <Volver texto="Participa" onClick={() => ir("participa")} />
      <h2 className="titulo-modulo">Encuentros</h2>
      <p className="subtitulo-pantalla">Piloto en la Universidad del Magdalena</p>
      <div className="lista-lugares">{encuentros.map(e => <TarjetaEncuentro key={e.id} e={e} conInscripcion />)}</div>
      <div className="nota-gobernanza adentro" style={{ marginTop: 14 }}>Lo que se grabe en un encuentro solo pasa a <b>Memoria</b> si la comunidad lo autoriza.</div>
      <p className="aviso-ejemplo">Fechas y lugares de ejemplo.</p>
    </>
  );
}
