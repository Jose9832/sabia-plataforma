import { useState } from "react";
import { Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { tiposSemilla } from "../../data/contenido";
import type { Semilla } from "../../data/tipos";
import { enLinea, operacionesPendientes, useApp } from "../../state/store";

const formVacio = { abierto: false, tipo: "Maíz", variedad: "", cantidad: "", busca: "", error: "" };

/* --- Banco de semillas (trueque) --- */
export function Semillas() {
  const servidor = useApp(s => s.datos.semillas);
  const trueques = useApp(s => s.datos.registros.trueques);
  const cola = useApp(s => s.cola);
  const sesion = useApp(s => s.sesion);
  const sincronizando = useApp(s => s.sincronizando);
  const { ir, encolar, aviso } = useApp.getState();
  const [f, setF] = useState(formVacio);
  const [filtro, setFiltro] = useState("Todas");
  const usuarioId = sesion?.usuario.id;

  /* Las que publiqué sin señal aparecen de una vez, marcadas como «Mía» */
  const enviadas = new Set(servidor.map(s => s.client_id).filter(Boolean));
  const propiasPendientes: Semilla[] = operacionesPendientes(cola, "semilla", usuarioId)
    .filter(op => !enviadas.has(op.id))
    .map(op => ({ ...(op.datos as Omit<Semilla, "id">), id: op.id, propia: true, pendiente: true,
      familia: sesion?.usuario.nombre ?? "", vereda: "Mi vereda", busca: String(op.datos.busca || "Lo que me ofrezcan") }));
  const todas = [...propiasPendientes, ...servidor].filter(s => filtro === "Todas" || s.tipo === filtro);
  const truequesEnCola = operacionesPendientes(cola, "trueque", usuarioId).map(o => o.datos.semilla_id);

  function publicarSemilla() {
    if (!f.variedad.trim() || !f.cantidad.trim()) { setF({ ...f, error: "Escribe la variedad y la cantidad." }); return; }
    encolar("semilla", { tipo: f.tipo, variedad: f.variedad.trim(), cantidad: f.cantidad.trim(), busca: f.busca.trim() });
    setF(formVacio);
    aviso("Tus semillas quedaron publicadas");
  }
  function proponerTrueque(id: number | string) {
    encolar("trueque", { semilla_id: id });
    aviso(enLinea(useApp.getState()) ? "Solicitud de trueque enviada" : "Sin señal: la solicitud se enviará cuando haya internet");
  }

  return (
    <>
      <Volver texto="Mi finca" onClick={() => ir("finca")} />
      <h2 className="titulo-modulo">Banco de semillas</h2>
      <p className="subtitulo-pantalla">Semillas nativas y criollas para intercambiar, sin intermediarios</p>
      {f.abierto ? (
        <div className="formulario" style={{ marginBottom: 16 }}>
          <div className="etiqueta-campo">¿Qué semilla tienes?</div>
          <div className="filtros">{tiposSemilla.map(t => <button key={t} className={`chip ${f.tipo === t ? "activo" : ""}`} onClick={() => setF({ ...f, tipo: t })}>{t}</button>)}</div>
          <label className="etiqueta-campo">Variedad</label>
          <input className="campo" value={f.variedad} onChange={e => setF({ ...f, variedad: e.target.value })} placeholder="Ej: maíz criollo blanco" />
          <label className="etiqueta-campo">Cantidad</label>
          <input className="campo" value={f.cantidad} onChange={e => setF({ ...f, cantidad: e.target.value })} placeholder="Ej: 3 kilos, 50 estacas" />
          <label className="etiqueta-campo">¿Qué buscas a cambio?</label>
          <input className="campo" value={f.busca} onChange={e => setF({ ...f, busca: e.target.value })} placeholder="Ej: fríjol o plántulas de aguacate" />
          {f.error && <div className="error-campo">{f.error}</div>}
          <button className="boton-ancho" onClick={publicarSemilla}>Publicar en el banco</button>
          <button className="boton-texto" onClick={() => setF({ ...f, abierto: false })}>Cancelar</button>
        </div>
      ) : (
        <button className="boton-ancho" style={{ margin: "0 0 16px" }} onClick={() => setF({ ...f, abierto: true })}><Icono nombre="semilla" /> Ofrecer mis semillas</button>
      )}
      <div className="filtros">{["Todas", ...tiposSemilla].map(t => <button key={t} className={`chip ${filtro === t ? "activo" : ""}`} onClick={() => setFiltro(t)}>{t}</button>)}</div>
      <div className="lista-lugares">
        {todas.length ? todas.map(s => {
          const enCola = truequesEnCola.includes(s.id);
          const solicitada = enCola || trueques.includes(Number(s.id));
          const pendiente = enCola && !sincronizando;
          return (
            <div key={s.id} className="lugar oferta">
              <div className="oferta-cabecera">
                <span className="lugar-ico" style={{ background: "#F3ECD1" }}><Icono nombre="semilla" style={{ color: "#6E5A12" }} /></span>
                <div className="lugar-info">
                  <strong>{s.variedad}</strong>
                  <span className="sub">{s.familia} · {s.vereda}</span>
                </div>
                {s.propia && <span className="insignia-ventana privado">Mía</span>}
              </div>
              <div className="oferta-datos">
                <div><b>Tiene</b>{s.cantidad}</div>
                <div><b>Busca a cambio</b>{s.busca}</div>
              </div>
              {s.propia
                ? (s.pendiente && !sincronizando ? <div className="estado-envio pendiente">Publicación guardada · se enviará con señal</div> : null)
                : solicitada
                  ? <div className={`estado-envio ${pendiente ? "pendiente" : "ok"}`}>{pendiente ? "Solicitud guardada · se enviará con señal" : "Solicitud enviada a la familia"}</div>
                  : <button className="boton-mini" onClick={() => proponerTrueque(s.id)}>Proponer trueque</button>}
            </div>
          );
        }) : <div className="sin-red">No hay semillas de este tipo todavía.</div>}
      </div>
      <p className="aviso-ejemplo">Las ofertas de otras familias son de ejemplo.</p>
    </>
  );
}
