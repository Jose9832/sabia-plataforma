/* SALUD RURAL: primeros auxilios (offline) y plantas de la vereda */
import { BotonEscuchar, BotonLeer, TarjetaModulo, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { primerosAuxilios } from "../../data/contenido";
import { useApp } from "../../state/store";
import { DecirMedico } from "./DecirMedico";
import { Plantas } from "./Plantas";

function Auxilios() {
  const detalle = useApp(s => s.nav.detalle);
  const { ir, setUi } = useApp.getState();

  if (detalle) {
    const a = primerosAuxilios.find(x => x.id === detalle);
    if (!a) return <Volver texto="Primeros auxilios" onClick={() => ir("salud", "auxilios")} />;
    const textoVoz = a.titulo + ". " + a.pasos.map((p, i) => `Paso ${i + 1}. ${p}`).join(" ") + " Lo que no debes hacer: " + a.noHacer.join(". ");
    return (
      <>
        <Volver texto="Primeros auxilios" onClick={() => ir("salud", "auxilios")} />
        <h2 className="titulo-modulo">{a.titulo}</h2>
        <div className="caja-urgente"><Icono nombre="aviso" /><span>{a.urgente}</span></div>
        <div className="acciones-urgencia">
          <a href="tel:123" className="llamar"><Icono nombre="telefono" /> Llamar al 123</a>
          {a.toxicologia && <a href="tel:018000916012" className="llamar secundario"><Icono nombre="telefono" /> Línea Toxicológica<small>01 8000 916012 · gratis, 24 h</small></a>}
        </div>
        <BotonLeer className="boton-ancho secundario boton-escuchar-guia" texto={textoVoz}>Escuchar la guía completa</BotonLeer>
        <div className="titulo-seccion">Qué hacer, paso a paso</div>
        <ol className="pasos">{a.pasos.map(p => <li key={p}>{p}</li>)}</ol>
        <div className="no-hacer"><b>No hagas esto</b><ul>{a.noHacer.map(n => <li key={n}>{n}</li>)}</ul></div>
        <button className="boton-ancho" onClick={() => { setUi({ filtroLugares: "rurales" }); ir("ayuda", "directorio"); }}>
          <Icono nombre="pin" /> Ver puestos de salud cercanos
        </button>
        <p className="fuente">Guía de orientación mientras llegas a atención médica. No reemplaza la atención profesional.</p>
      </>
    );
  }

  return (
    <>
      <Volver texto="Salud" onClick={() => ir("salud")} />
      <h2 className="titulo-modulo">Primeros auxilios</h2>
      <p className="subtitulo-pantalla">Qué hacer mientras llegas al puesto de salud</p>
      <div className="modulos">
        {primerosAuxilios.map(a => (
          <TarjetaModulo key={a.id} icono={<Icono nombre="botiquin" />} fondo={a.color} color={a.tinte}
            titulo={a.titulo} desc={a.desc} voz={`${a.titulo}. ${a.desc}`} onClick={() => ir("salud", "auxilios", a.id)} />
        ))}
      </div>
      <div className="nota-gobernanza adentro" style={{ marginTop: 16 }}>Guardado en el teléfono: funciona <b>sin señal</b>.</div>
    </>
  );
}

export function SaludCampo() {
  const sub = useApp(s => s.nav.sub);
  const ir = useApp(s => s.ir);
  if (sub === "decir") return <><Volver texto="Salud" onClick={() => ir("salud")} /><DecirMedico /></>;
  if (sub === "auxilios") return <Auxilios />;
  if (sub === "plantas") return <Plantas variante="campesina" />;
  return (
    <>
      <h2 className="titulo-modulo">Salud</h2>
      <p className="subtitulo-pantalla">Funciona sin internet, también en la finca</p>
      <div className="emergencia">
        <Icono nombre="telefono" />
        <div><b>Emergencia</b><br /><span style={{ fontSize: 13 }}>Línea nacional de emergencias</span></div>
        <a className="num" href="tel:123" style={{ textDecoration: "none" }}>123</a>
      </div>
      <div className="opciones-grandes" style={{ marginTop: 0 }}>
        <div role="button" className="opcion-grande" onClick={() => ir("salud", "auxilios")}>
          <span className="ico" style={{ background: "#FCEAE4", color: "#B8442A" }}><Icono nombre="botiquin" /></span>
          <span><strong>Primeros auxilios en el campo</strong><small>Serpientes, venenos, calor, heridas</small></span>
          <BotonEscuchar texto="Primeros auxilios en el campo. Qué hacer mientras llegas al puesto de salud." />
        </div>
        <div role="button" className="opcion-grande" onClick={() => ir("salud", "plantas")}>
          <span className="ico" style={{ background: "#E2ECE0", color: "var(--verde)" }}><Icono nombre="hoja" /></span>
          <span><strong>Plantas de la vereda</strong><small>Para qué sirven y cuándo ir al médico</small></span>
          <BotonEscuchar texto="Plantas de la vereda. Para qué sirven, cómo se preparan y cuándo hay que ir al médico." />
        </div>
      </div>
      <button className="enlace-secundario" onClick={() => ir("salud", "decir")}>
        <Icono nombre="salud" /><span><b>Decir qué me duele al médico</b><small>Figura del cuerpo y síntomas</small></span><span className="flecha-mini">›</span>
      </button>
    </>
  );
}
