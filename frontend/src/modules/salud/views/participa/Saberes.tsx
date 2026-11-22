/* Historia y logros afro · Microrracismo — se ven adentro (Participa) y afuera (Aprende). */
import { BotonLeer, Volver } from "../../components/comunes";
import { historiaAfro, logrosAfro } from "../../data/contenido";
import { useApp } from "../../state/store";

type Origen = "participa" | "aprende";

export function HistoriaAfro({ origen }: { origen: Origen }) {
  const ir = useApp(s => s.ir);
  return (
    <>
      <Volver texto={origen === "aprende" ? "Aprende" : "Participa"} onClick={() => ir(origen)} />
      <h2 className="titulo-modulo">Historia y logros afro</h2>
      <p className="subtitulo-pantalla">Memoria, resistencia y aportes al país y al territorio</p>
      <BotonLeer style={{ margin: "0 0 16px" }} texto={historiaAfro.map(h => `${h.anio}. ${h.titulo}. ${h.texto}`).join(" ")}>Escuchar la historia</BotonLeer>
      <div className="linea-tiempo">
        {historiaAfro.map(h => (
          <div key={h.anio} className="hito">
            <span className="hito-anio">{h.anio}</span>
            <div className="hito-cuerpo"><strong>{h.titulo}</strong><p>{h.texto}</p></div>
          </div>
        ))}
      </div>
      <div className="titulo-seccion">Orgullo afrocolombiano</div>
      <div className="lista-lugares">
        {logrosAfro.map(l => (
          <div key={l.nombre} className="lugar oferta"><strong style={{ fontSize: 16 }}>{l.nombre}</strong><p className="encuentro-desc" style={{ margin: "4px 0 0" }}>{l.logro}</p></div>
        ))}
      </div>
      <div className="nota-gobernanza" style={{ marginTop: 14 }}>Aquí la comunidad afro del Magdalena agregará su propia historia local: sus personas, sus luchas y sus logros.</div>
    </>
  );
}

const DEFINICION = "Un microrracismo son comentarios, chistes, gestos o actitudes del día a día, a veces sin mala intención, que hacen sentir a una persona menos, distinta o sospechosa por su color de piel o su origen.";

export function Microrracismo({ origen }: { origen: Origen }) {
  const { ir, setUi } = useApp.getState();
  return (
    <>
      <Volver texto={origen === "aprende" ? "Aprende" : "Participa"} onClick={() => ir(origen)} />
      <h2 className="titulo-modulo">¿Qué es un microrracismo?</h2>
      <div className="formulario" style={{ marginTop: 12 }}>
        <p style={{ fontSize: 16, lineHeight: 1.5 }}>Son comentarios, chistes, gestos o actitudes del día a día, a veces sin mala intención, que hacen sentir a una persona menos, distinta o sospechosa por su color de piel o su origen.</p>
        <BotonLeer texto={DEFINICION}>Escuchar</BotonLeer>
      </div>
      <div className="titulo-seccion">Ejemplos</div>
      <ul className="pasos">
        <li>Tocar el cabello de alguien sin pedir permiso.</li>
        <li>Decir que una persona es buena para el baile o el deporte "por naturaleza".</li>
        <li>Sorprenderse con frases como "hablas muy bien" o "no pareces de allá".</li>
        <li>Seguir con la mirada a alguien en una tienda.</li>
        <li>Hacer chistes sobre el color de piel o el origen de alguien.</li>
      </ul>
      <div className="titulo-seccion">Qué puedes hacer</div>
      <div className="no-hacer" style={{ borderLeftColor: "var(--verde)" }}>
        <b style={{ color: "var(--verde)" }}>Si lo vives</b>
        <ul>
          <li>Puedes nombrarlo con calma: "eso que dijiste me hace sentir…".</li>
          <li>Busca apoyo en tu comunidad.</li>
          {origen === "participa" && <li>Repórtalo en Ayuda → Mis derechos.</li>}
        </ul>
      </div>
      <div className="no-hacer" style={{ borderLeftColor: "var(--azul)" }}>
        <b style={{ color: "var(--azul)" }}>Si alguien te dice que lo hiciste</b>
        <ul><li>Escucha sin justificarte.</li><li>Pide disculpas y aprende.</li><li>No lo repitas.</li></ul>
      </div>
      {origen === "participa" && (
        <button className="boton-ancho" onClick={() => { setUi({ reporteTipo: "microrracismo" }); ir("ayuda", "derechos"); }}>Reportar un microrracismo</button>
      )}
    </>
  );
}
