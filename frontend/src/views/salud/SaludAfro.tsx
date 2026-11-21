/* SALUD PARA LA COMUNIDAD AFRO
   Partería y saberes de las mayores · Botiquín de plantas · Ruta de salud
   con enfoque diferencial · Directorio de sabedoras y agentes comunitarios */
import { BotonLeer, OpcionGrande, TarjetaModulo, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import {
  agentesComunitarios,
  alarmasBebe,
  alarmasEmbarazo,
  alarmasPosparto,
  condicionesAfro,
  derechosSalud,
  saberesParteria
} from "../../data/contenido";
import { useApp } from "../../state/store";
import { Plantas } from "./Plantas";

/* ---------- 1. Partería y saberes de las mayores ---------- */
function Parteria() {
  const { ir, aviso } = useApp.getState();
  const listaAlarma = (titulo: string, items: string[]) => (
    <div className="no-hacer"><b>{titulo}</b><ul>{items.map(i => <li key={i}>{i}</li>)}</ul></div>
  );
  return (
    <>
      <Volver texto="Salud" onClick={() => ir("salud")} />
      <h2 className="titulo-modulo">Partería y saberes de las mayores</h2>
      <p className="subtitulo-pantalla">Un espacio para resguardar lo que saben nuestras parteras</p>
      <div className="nota-gobernanza adentro">Los saberes de la <b>partería afro del Pacífico</b> son Patrimonio Cultural Inmaterial de Colombia (2017), y la partería fue reconocida por la UNESCO como Patrimonio de la Humanidad (2023).</div>
      <div className="titulo-seccion">Saberes de las parteras</div>
      <div className="modulos">
        {saberesParteria.map(s => (
          <TarjetaModulo key={s.titulo} icono={<Icono nombre="parteria" />} fondo="#F7E2D9" color="#8A3B22"
            titulo={s.titulo} desc={s.desc} voz={`${s.titulo}. ${s.desc}`} tituloStyle={{ fontSize: 17 }}
            onClick={() => aviso("Este saber se registrará con las parteras de la comunidad")}
            extra={<span className="insignia-ventana publico" style={{ display: "inline-block", marginTop: 6 }}>Por registrar con las parteras</span>} />
        ))}
      </div>
      <div className="titulo-seccion">Señales de alarma: ir de inmediato al centro de salud</div>
      <BotonLeer style={{ margin: "0 0 12px" }}
        texto={"Señales de alarma en el embarazo: " + alarmasEmbarazo.join(". ") + ". Después del parto: " + alarmasPosparto.join(". ") + ". En el bebé: " + alarmasBebe.join(". ")}>
        Escuchar las señales de alarma
      </BotonLeer>
      {listaAlarma("En el embarazo", alarmasEmbarazo)}
      {listaAlarma("Después del parto", alarmasPosparto)}
      {listaAlarma("En el recién nacido", alarmasBebe)}
      <p className="fuente">La partera acompaña y la comunidad cuida. Ante cualquiera de estas señales, la mujer o el bebé deben ir al centro de salud de inmediato.</p>
    </>
  );
}

/* ---------- 3. Ruta de salud y atención diferencial ---------- */
function RutaSalud() {
  const detalle = useApp(s => s.nav.detalle);
  const { ir, setUi } = useApp.getState();

  if (detalle) {
    const c = condicionesAfro.find(x => x.id === detalle);
    if (!c) return <Volver texto="Ruta de salud" onClick={() => ir("salud", "ruta")} />;
    return (
      <>
        <Volver texto="Ruta de salud" onClick={() => ir("salud", "ruta")} />
        <h2 className="titulo-modulo">{c.titulo}</h2>
        <div className="formulario" style={{ marginTop: 12 }}>
          <div className="seccion-titulo" style={{ marginTop: 0 }}>Qué es</div><p>{c.que}</p>
          <div className="seccion-titulo">Señales</div><ul className="lista-simple">{c.senales.map(s => <li key={s}>{s}</li>)}</ul>
        </div>
        <div className="titulo-seccion">Qué hacer</div>
        <ol className="pasos">{c.hacer.map(h => <li key={h}>{h}</li>)}</ol>
        <div className="caja-urgente"><Icono nombre="aviso" /><span>{c.urgencia}</span></div>
        <BotonLeer texto={`${c.titulo}. ${c.que} Qué hacer: ${c.hacer.join(" ")} ${c.urgencia}`}>Escuchar</BotonLeer>
      </>
    );
  }

  return (
    <>
      <Volver texto="Salud" onClick={() => ir("salud")} />
      <h2 className="titulo-modulo">Ruta de salud y derechos</h2>
      <p className="subtitulo-pantalla">Atención digna, con enfoque diferencial y sin discriminación</p>
      <div className="caja-derechos" style={{ marginTop: 0 }}>
        <div className="caja-derechos-titulo"><Icono nombre="escudo" /> Tus derechos en salud</div>
        <ul>{derechosSalud.map(d => <li key={d}>{d}</li>)}</ul>
      </div>
      <div className="titulo-seccion">Salud de la población afro</div>
      <div className="modulos">
        {condicionesAfro.map(c => (
          <TarjetaModulo key={c.id} icono={<Icono nombre="salud" />} fondo={c.color} color={c.tinte}
            titulo={c.titulo} desc="Qué es, señales y cuándo ir a urgencias" voz={`${c.titulo}. ${c.que}`}
            onClick={() => ir("salud", "ruta", c.id)} />
        ))}
      </div>
      <div className="titulo-seccion">Si te tratan mal o te discriminan en salud</div>
      <ol className="pasos">
        <li>Pide hablar con la oficina de atención al usuario (SIAU) de la clínica u hospital.</li>
        <li>Pon tu queja por escrito ante tu EPS y guarda el número de radicado.</li>
        <li>Si no responden, quéjate ante la Superintendencia Nacional de Salud: en su página web hay formulario, chat y llamada.</li>
        <li>También puedes acudir a la Defensoría del Pueblo o a la Personería.</li>
      </ol>
      <button className="boton-ancho" onClick={() => { setUi({ reporteTipo: "discriminacion" }); ir("ayuda", "derechos"); }}>
        <Icono nombre="balanza" /> Reportarlo en SABIA
      </button>
      <p className="fuente">Información general. Para casos concretos, busca orientación en la Defensoría o en tu consejo comunitario.</p>
    </>
  );
}

/* ---------- 4. Directorio de sabedoras y agentes comunitarios ---------- */
function Sabedoras() {
  const { ir, aviso } = useApp.getState();
  return (
    <>
      <Volver texto="Salud" onClick={() => ir("salud")} />
      <h2 className="titulo-modulo">Sabedoras y agentes comunitarios</h2>
      <p className="subtitulo-pantalla">Personas de confianza autorizadas por el consejo comunitario</p>
      <div className="lista-lugares">
        {agentesComunitarios.map(a => (
          <div key={a.nombre} className="lugar oferta">
            <div className="oferta-cabecera">
              <span className="lugar-ico" style={{ background: "#F3ECD1" }}><Icono nombre="sabedora" style={{ color: "#6E5A12" }} /></span>
              <div className="lugar-info"><strong>{a.nombre}</strong><span className="sub">{a.rol}</span></div>
            </div>
            <div className="oferta-datos">
              <div><b>Dónde</b>{a.zona}</div>
              <div><b>Autorizado por</b>{a.autorizado}</div>
            </div>
            <button className="boton-mini" onClick={() => aviso("Contacto pendiente: el consejo comunitario debe autorizarlo")}>Contactar</button>
          </div>
        ))}
      </div>
      <div className="nota-gobernanza" style={{ marginTop: 14 }}>Solo aparecen las personas que el <b>consejo comunitario</b> autorice, y con su consentimiento.</div>
    </>
  );
}

export function SaludAfro() {
  const sub = useApp(s => s.nav.sub);
  const ir = useApp(s => s.ir);
  if (sub === "parteria") return <Parteria />;
  if (sub === "plantas") return <Plantas variante="afro" />;
  if (sub === "ruta") return <RutaSalud />;
  if (sub === "sabedoras") return <Sabedoras />;
  return (
    <>
      <h2 className="titulo-modulo">Salud</h2>
      <p className="subtitulo-pantalla">Medicina tradicional, partería y salud comunitaria</p>
      <div className="opciones-grandes" style={{ marginTop: 0 }}>
        <OpcionGrande icono="parteria" fondo="#F7E2D9" color="#8A3B22" titulo="Partería y saberes de las mayores" desc="Gestación, parto y cuidado de la mujer" onClick={() => ir("salud", "parteria")} />
        <OpcionGrande icono="hoja" fondo="#E2ECE0" color="var(--verde)" titulo="Botiquín de plantas" desc="Remedios caseros y cuándo ir al médico" onClick={() => ir("salud", "plantas")} />
        <OpcionGrande icono="ruta" fondo="#E8EEF4" color="var(--azul)" titulo="Ruta de salud y derechos" desc="Atención digna y salud de la población afro" onClick={() => ir("salud", "ruta")} />
        <OpcionGrande icono="sabedora" fondo="#F3ECD1" color="#6E5A12" titulo="Sabedoras y agentes" desc="Parteras, sobanderos y promotores" onClick={() => ir("salud", "sabedoras")} />
      </div>
    </>
  );
}
