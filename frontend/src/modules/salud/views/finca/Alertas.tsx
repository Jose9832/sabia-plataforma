import { useState } from "react";
import { CampoFoto, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { tiposAlerta } from "../../data/contenido";
import type { Alerta } from "../../data/tipos";
import { horaActual } from "../../lib/utilidades";
import { enLinea, operacionesPendientes, useApp } from "../../state/store";

const formVacio = { tipo: null as string | null, lugar: "", nota: "", foto: null as string | null, error: "" };

/* --- Alertas de la vereda (se sincronizan al tomar señal) --- */
export function Alertas() {
  const servidor = useApp(s => s.datos.alertas);
  const abierto = useApp(s => s.ui.formAlertaAbierto);
  const cola = useApp(s => s.cola);
  const sesion = useApp(s => s.sesion);
  const sincronizando = useApp(s => s.sincronizando);
  const { ir, setUi, encolar, aviso } = useApp.getState();
  const [f, setF] = useState(formVacio);

  const enviadas = new Set(servidor.map(a => a.client_id).filter(Boolean));
  const pendientes: Alerta[] = operacionesPendientes(cola, "alerta", sesion?.usuario.id)
    .filter(op => !enviadas.has(op.id))
    .map(op => ({ ...(op.datos as Omit<Alerta, "id" | "autor">), id: op.id, autor: sesion?.usuario.nombre ?? "", pendiente: !sincronizando }))
    .reverse();
  const alertas = [...pendientes, ...servidor];

  function enviarAlerta() {
    if (!f.tipo || !f.lugar.trim()) { setF({ ...f, error: "Elige qué está pasando y escribe dónde." }); return; }
    encolar("alerta", { tipo: f.tipo, lugar: f.lugar.trim(), nota: f.nota.trim(), foto: f.foto, hora: horaActual() });
    setF(formVacio);
    setUi({ formAlertaAbierto: false });
    aviso(enLinea(useApp.getState()) ? "Alerta enviada a la vereda" : "Sin señal: la alerta se enviará cuando haya internet");
  }

  return (
    <>
      <Volver texto="Mi finca" onClick={() => { setUi({ formAlertaAbierto: false }); ir("finca"); }} />
      <h2 className="titulo-modulo">Alertas de la vereda</h2>
      <p className="subtitulo-pantalla">Avisa a tus vecinos. Si no hay señal, la alerta se envía cuando alguien baje al pueblo.</p>
      {abierto ? (
        <div className="formulario" style={{ marginBottom: 16 }}>
          <div className="etiqueta-campo">¿Qué está pasando?</div>
          <div className="opciones-reporte" style={{ marginBottom: 12 }}>
            {tiposAlerta.map(t => (
              <button key={t.id} className={`opcion-reporte con-icono ${f.tipo === t.id ? "sel" : ""}`} onClick={() => setF({ ...f, tipo: t.id })}>
                <span style={{ color: t.color }}><Icono nombre={t.icono} /></span>{t.nombre}
              </button>
            ))}
          </div>
          <label className="etiqueta-campo">¿Dónde?</label>
          <input className="campo" value={f.lugar} onChange={e => setF({ ...f, lugar: e.target.value })} placeholder="Ej: puente de la quebrada" />
          <label className="etiqueta-campo">Detalle (opcional)</label>
          <input className="campo" value={f.nota} onChange={e => setF({ ...f, nota: e.target.value })} placeholder="Ej: no pasan carros" />
          <CampoFoto foto={f.foto} onFoto={foto => setF(prev => ({ ...prev, foto }))} />
          {f.error && <div className="error-campo">{f.error}</div>}
          <button className="boton-ancho" style={{ background: "#B8442A" }} onClick={enviarAlerta}>Enviar alerta</button>
          <button className="boton-texto" onClick={() => setUi({ formAlertaAbierto: false })}>Cancelar</button>
        </div>
      ) : (
        <button className="boton-ancho" style={{ margin: "0 0 16px", background: "#B8442A" }} onClick={() => setUi({ formAlertaAbierto: true })}>
          <Icono nombre="aviso" /> Dar una alerta
        </button>
      )}
      <div className="lista-lugares">
        {alertas.map(a => {
          const t = tiposAlerta.find(x => x.id === a.tipo) ?? tiposAlerta[3];
          return (
            <div key={a.id} className="lugar alerta-item">
              <div className="oferta-cabecera">
                <span className="lugar-ico" style={{ background: t.fondo, color: t.color }}><Icono nombre={t.icono} style={{ color: t.color }} /></span>
                <div className="lugar-info"><strong>{t.nombre}</strong><span className="sub">{a.lugar}</span></div>
              </div>
              {a.nota && <p className="alerta-nota">{a.nota}</p>}
              {a.foto && <img className="foto-evidencia" src={a.foto} alt="Foto de la alerta" />}
              <div className="alerta-pie"><span>{a.autor} · {a.hora}</span>
                <span className={`estado-envio ${a.pendiente ? "pendiente" : "ok"}`}>{a.pendiente ? "Esperando señal" : "Enviada"}</span></div>
            </div>
          );
        })}
      </div>
    </>
  );
}
