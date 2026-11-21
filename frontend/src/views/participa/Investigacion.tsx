import { useState } from "react";
import { BotonEscuchar, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { comunidades } from "../../data/contenido";
import { operacionesPendientes, useApp } from "../../state/store";

/* ---------- INVESTIGACIÓN CON NOSOTROS ---------- */
export function Investigacion() {
  const detalle = useApp(s => s.nav.detalle);
  const lista = useApp(s => s.datos.investigaciones);
  const registros = useApp(s => s.datos.registros.investigaciones);
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  const cola = useApp(s => s.cola);
  const usuarioId = useApp(s => s.sesion?.usuario.id);
  const sincronizando = useApp(s => s.sincronizando);
  const { ir, encolar } = useApp.getState();
  const [acepta, setAcepta] = useState(false);
  const autoridad = comunidad ? comunidades[comunidad].autoridad : "organización";

  if (detalle) {
    const inv = lista.find(i => i.id === detalle);
    if (!inv) return <Volver texto="Investigación" onClick={() => ir("participa", "investigacion")} />;
    const enCola = operacionesPendientes(cola, "investigacion", usuarioId).some(o => o.datos.investigacion_id === inv.id);
    const solicitada = enCola || registros.includes(inv.id);
    const pendiente = enCola && !sincronizando;
    return (
      <>
        <Volver texto="Investigación" onClick={() => ir("participa", "investigacion")} />
        <span className="tipo-encuentro" style={{ color: "var(--azul)", display: "block", margin: "2px 0 4px" }}>{inv.estado}</span>
        <h2 className="titulo-modulo" style={{ fontSize: 23 }}>{inv.titulo}</h2>
        <p className="subtitulo-pantalla" style={{ fontSize: 14 }}>{inv.grupo}</p>
        <div className="formulario">
          <div className="seccion-titulo" style={{ marginTop: 0 }}>Qué busca</div><p>{inv.busca}</p>
          <div className="seccion-titulo">Cómo puedes participar</div>
          <ul className="lista-simple">{inv.participar.map(p => <li key={p}>{p}</li>)}</ul>
          <div className="seccion-titulo">Qué recibe la comunidad</div><p>{inv.devolucion}</p>
        </div>
        <div className="caja-derechos">
          <div className="caja-derechos-titulo"><Icono nombre="escudo" /> Tus derechos si participas</div>
          <ul>
            <li><b>Consentimiento previo, libre e informado:</b> te explican todo antes y decides sin presión.</li>
            <li><b>Puedes retirarte</b> cuando quieras, sin dar explicaciones.</li>
            <li>Tu <b>{autoridad}</b> aprueba cómo se usan los datos de la comunidad.</li>
            <li><b>Los resultados vuelven a la comunidad</b> antes de publicarse.</li>
          </ul>
        </div>
        {solicitada
          ? <div className={`resultado-reporte ${pendiente ? "cola" : "ok"}`}>{pendiente
              ? <><b>Sin señal.</b> Tu solicitud se enviará cuando haya internet.</>
              : <><b>Solicitud enviada</b> al equipo de investigación y a tu {autoridad}. Te contactarán para explicarte todo.</>}</div>
          : <>
              <label className="check-compartir" style={{ marginTop: 14 }}>
                <input type="checkbox" checked={acepta} onChange={e => setAcepta(e.target.checked)} /> Leí y entiendo mis derechos
              </label>
              <button className="boton-ancho" style={{ background: "var(--azul)" }} disabled={!acepta}
                onClick={() => { encolar("investigacion", { investigacion_id: inv.id, acepta_derechos: true }); setAcepta(false); }}>
                Quiero participar
              </button>
            </>}
      </>
    );
  }

  return (
    <>
      <Volver texto="Participa" onClick={() => ir("participa")} />
      <h2 className="titulo-modulo">Investigación con nosotros</h2>
      <p className="subtitulo-pantalla">Proyectos de la universidad donde la comunidad participa y decide</p>
      <div className="modulos">
        {lista.map(i => (
          <div key={i.id} className="tarjeta-modulo" role="button" onClick={() => ir("participa", "investigacion", i.id)}>
            <div className="icono-circulo" style={{ background: "#E8EEF4", color: "var(--azul)" }}><Icono nombre="lupa" /></div>
            <div className="textos"><strong style={{ fontSize: 17 }}>{i.titulo}</strong><span>{i.estado}</span></div>
            <BotonEscuchar texto={`${i.titulo}. ${i.busca}`} />
          </div>
        ))}
      </div>
      <p className="aviso-ejemplo">Proyectos de ejemplo. En el piloto, los grupos de investigación registran aquí sus convocatorias.</p>
    </>
  );
}
