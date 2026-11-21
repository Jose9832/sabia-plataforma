import { useEffect, useState } from "react";
import { CampoFoto, OpcionGrande, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { comunidades, tiposReporte, tiposReporteCampo, tramites, tramitesCampo } from "../../data/contenido";
import { enLinea, useApp } from "../../state/store";
import { Hospitales, LugaresCampo } from "./Lugares";

/* ---------- MIS DERECHOS / REPORTES ---------- */
function Derechos() {
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  const reporteTipo = useApp(s => s.ui.reporteTipo);
  const { ir, setUi, encolar } = useApp.getState();
  const [audio, setAudio] = useState<"" | "grabando" | "listo">("");
  const [resultado, setResultado] = useState<null | "ok" | "cola">(null);
  const [foto, setFoto] = useState<string | null>(null);
  const campo = comunidad === "campesina";
  const autoridad = comunidad ? comunidades[comunidad].autoridad : "organización comunitaria";

  /* Grabación simulada (como en el prototipo): se registra que el reporte lleva audio */
  useEffect(() => {
    if (audio !== "grabando") return;
    const t = setTimeout(() => setAudio("listo"), 2500);
    return () => clearTimeout(t);
  }, [audio]);

  function enviarReporte() {
    if (!reporteTipo) return;
    encolar("reporte", { tipo: reporteTipo, tiene_audio: audio === "listo", foto });
    setResultado(enLinea(useApp.getState()) ? "ok" : "cola");
  }

  return (
    <>
      <Volver texto="Ayuda" onClick={() => { setUi({ reporteTipo: null }); ir("ayuda"); }} />
      <h2 className="titulo-modulo">{campo ? "Reportes y derechos" : "Mis derechos"}</h2>
      <p style={{ color: "var(--texto-suave)" }}>Tu reporte solo lo ve tu {autoridad}.</p>
      <div className="paso-titulo"><span className="paso-num">1</span> ¿Qué pasó?</div>
      <div className="opciones-reporte">
        {(campo ? [...tiposReporteCampo, ...tiposReporte] : tiposReporte).map(([id, txt]) => (
          <button key={id} className={`opcion-reporte ${reporteTipo === id ? "sel" : ""}`} onClick={() => { setUi({ reporteTipo: id }); setResultado(null); }}>{txt}</button>
        ))}
      </div>
      <div className="paso-titulo"><span className="paso-num">2</span> {campo ? "Agrega evidencia" : "Cuéntalo con tu voz"}</div>
      {campo && <CampoFoto foto={foto} onFoto={setFoto} />}
      <button className="boton-ancho secundario" onClick={() => setAudio("grabando")} disabled={audio === "grabando"}>
        {audio === "grabando" ? "Grabando…" : audio === "listo" ? "Audio grabado (0:12) · Grabar otra vez" : "Grabar mensaje (opcional)"}
      </button>
      <button className="boton-ancho" onClick={enviarReporte} disabled={!reporteTipo}>Enviar reporte</button>
      {resultado === "ok" && <div className="resultado-reporte ok"><b>Reporte enviado</b> a tu {autoridad}. Ellos te contactarán y, si es necesario, lo llevarán a la Defensoría del Pueblo.</div>}
      {resultado === "cola" && <div className="resultado-reporte cola"><b>No hay señal.</b> Tu reporte quedó guardado en el teléfono y se enviará solo cuando haya internet.</div>}
    </>
  );
}

/* ---------- TRÁMITES ---------- */
function Tramites() {
  const campo = useApp(s => s.sesion?.usuario.comunidad === "campesina");
  const ir = useApp(s => s.ir);
  return (
    <>
      <Volver texto="Ayuda" onClick={() => ir("ayuda")} />
      <h2 className="titulo-modulo">Trámites y apoyos</h2>
      <p style={{ color: "var(--texto-suave)", marginBottom: 14 }}>{campo ? "Paso a paso y en lenguaje claro" : "Qué necesitas llevar para cada trámite"}</p>
      {campo && <>
        <div className="titulo-seccion" style={{ marginTop: 6 }}>Trámites del campo</div>
        {tramitesCampo.map(t => (
          <div key={t.titulo} className="tramite">
            <div className="fila"><span className="emo" style={{ color: "#6E5A12" }}><Icono nombre={t.icono} /></span><div><strong>{t.titulo}</strong><small>{t.entidad}</small></div></div>
            <ol className="pasos compactos">{t.pasos.map(p => <li key={p}>{p}</li>)}</ol>
          </div>
        ))}
        <p className="aviso-ejemplo" style={{ marginBottom: 8 }}>Información general en lenguaje claro. Verifica los requisitos vigentes con cada entidad.</p>
        <div className="titulo-seccion">Otros trámites</div>
      </>}
      {tramites.map(t => (
        <div key={t.titulo} className="tramite">
          <div className="fila"><span className="emo" style={{ color: "var(--tierra)" }}><Icono nombre={t.icono} /></span><div><strong>{t.titulo}</strong><small>{t.desc}</small></div></div>
          <ul>{t.necesitas.map(n => <li key={n}>{n}</li>)}</ul>
        </div>
      ))}
      <p className="aviso-ejemplo">Información de ejemplo. La comunidad la mantiene actualizada.</p>
    </>
  );
}

/* ---------- AYUDA ---------- */
export function Ayuda() {
  const sub = useApp(s => s.nav.sub);
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  const lugares = useApp(s => s.datos.lugares);
  const ir = useApp(s => s.ir);
  const esAfro = comunidad === "afro", esCampesino = comunidad === "campesina";

  /* La comunidad afro no usa emergencias ni hospitales en Ayuda */
  if (sub === "directorio" && !esAfro) return esCampesino ? <LugaresCampo /> : <Hospitales lista={lugares.filter(l => l.categoria === "hospital")} />;
  if (sub === "derechos") return <Derechos />;
  if (sub === "tramites") return <Tramites />;

  return (
    <>
      <h2 className="titulo-modulo">Ayuda</h2>
      <p style={{ color: "var(--texto-suave)" }}>¿Qué necesitas?</p>
      {!esAfro && (
        <div className="emergencia" style={{ marginTop: 14 }}>
          <Icono nombre="telefono" />
          <div><b>Emergencia</b><br /><span style={{ fontSize: 13 }}>Línea nacional de emergencias</span></div>
          <span className="num">123</span>
        </div>
      )}
      <div className="opciones-grandes" style={esAfro ? undefined : { marginTop: 0 }}>
        {!esAfro && (esCampesino
          ? <OpcionGrande icono="hospital" fondo="#DCE6F0" titulo="Dónde me atienden" desc="Hospitales, puestos rurales y brigadas"
              voz="Dónde me atienden. Hospitales de Santa Marta, puestos de salud rurales, brigadas y transporte." onClick={() => ir("ayuda", "directorio")} />
          : <OpcionGrande icono="hospital" fondo="#DCE6F0" titulo="Hospitales en Santa Marta" desc="Nombre y ubicación"
              voz="Hospitales en Santa Marta. Toca uno para ver su nombre y ubicación." onClick={() => ir("ayuda", "directorio")} />)}
        <OpcionGrande icono="balanza" fondo="#FBE3DC" titulo={esCampesino ? "Reportes y derechos" : "Mis derechos"}
          desc={esCampesino ? "Vías, agua, luz, ambiente y trato" : "Contar si me trataron mal"}
          voz="Mis derechos. Para contar si te trataron mal o te discriminaron." onClick={() => ir("ayuda", "derechos")} />
        <OpcionGrande icono="documento" fondo="#F1E3CF" titulo="Trámites y apoyos" desc={esCampesino ? "Tierras, crédito, SISBÉN e insumos" : "Salud, documentos, becas"}
          voz="Trámites y apoyos. Salud, documentos y becas." onClick={() => ir("ayuda", "tramites")} />
      </div>
    </>
  );
}
