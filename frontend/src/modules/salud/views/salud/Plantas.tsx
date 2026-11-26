/* Botiquín ancestral: registro comunitario de plantas medicinales de cada comunidad.
   Lectura con voz, buscador por nombre o dolencia, y aporte de nuevas plantas que funciona sin conexión:
   lo que se guarda sin señal queda en la cola (IndexedDB) y se envía solo cuando vuelve la conexión. */
import { useRef, useState } from "react";
import { BotonLeer, Insignia, TarjetaModulo, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import type { IdComunidad } from "../../data/contenido";
import type { Planta } from "../../data/tipos";
import { crearReconocedor, normalizar, type Reconocedor, type ResultadoVoz } from "../../lib/utilidades";
import { enLinea, operacionesPendientes, useApp } from "../../state/store";

const PARTES = ["Hojas", "Raíz", "Corteza", "Flor", "Semilla", "Tallo", "Fruto", "Planta entera"];

interface DatosPlanta {
  nombre: string; nombre_nativo?: string; uso: string; preparacion: string;
  parte_utilizada?: string; precaucion?: string; compartir: boolean;
}

/** Dictado por voz (Web Speech API) para los campos de texto del formulario. */
function useDictado() {
  const [activo, setActivo] = useState<string | null>(null);
  const reconocedor = useRef<Reconocedor | null>(null);
  function dictar(campo: string, alTexto: (t: string) => void) {
    if (activo === campo) { reconocedor.current?.stop(); return; }
    const r = crearReconocedor();
    if (!r) { useApp.getState().aviso("Este navegador no permite dictar. Escribe el texto."); return; }
    reconocedor.current = r;
    setActivo(campo);
    r.onresult = (e: ResultadoVoz) => alTexto(e.results[0][0].transcript);
    r.onerror = () => useApp.getState().aviso("No te escuché bien. Intenta otra vez.");
    r.onend = () => setActivo(null);
    r.start();
  }
  return { activo, dictar };
}

const vacio = { nombre: "", nativo: "", uso: "", preparacion: "", parte: "Hojas", precaucion: "", compartir: false, error: "" };

export function Plantas({ variante }: { variante: IdComunidad }) {
  const detalle = useApp(s => s.nav.detalle);
  const plantasServidor = useApp(s => s.datos.plantas);
  const cola = useApp(s => s.cola);
  const sesion = useApp(s => s.sesion);
  const enRed = useApp(s => enLinea(s));
  const ir = useApp(s => s.ir);
  const { encolar, aviso } = useApp.getState();
  const { activo, dictar } = useDictado();

  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(vacio);

  const campo = variante === "campesina";
  const nombreLista = "Botiquín ancestral";
  const subtitulo = variante === "campesina" ? "Plantas que usan nuestros mayores en la vereda"
    : variante === "afro" ? "Los remedios de la casa, el primer cuidado de la familia"
    : "Plantas y saberes botánicos de nuestros mayores";

  /* Plantas del servidor + las guardadas en el teléfono que aún esperan señal */
  const pendientes: Planta[] = sesion
    ? operacionesPendientes(cola, "planta", sesion.usuario.id).map(op => {
        const d = op.datos as unknown as DatosPlanta;
        return {
          slug: `pendiente-${op.id}`, client_id: String(op.id), comunidad: variante, nombre: d.nombre,
          nombre_nativo: d.nombre_nativo || null, cientifico: null, color: "#E2ECE0", uso: d.uso, preparacion: d.preparacion,
          parte_utilizada: d.parte_utilizada || null, precaucion: d.precaucion ?? "", hospital: "Si hay señales de alarma o no mejora, ve al centro de salud.",
          visibilidad: d.compartir ? "afuera" : "adentro", validada: false, autor_nombre: sesion.usuario.nombre, pendiente: true
        } as Planta;
      })
    : [];
  const enviados = new Set(plantasServidor.map(p => p.client_id).filter(Boolean));
  const todas = [...pendientes.filter(p => !enviados.has(p.client_id)), ...plantasServidor];

  /* Búsqueda por nombre, nombre nativo o dolencia (sin tildes; funciona sin conexión) */
  const claves = normalizar(busqueda).split(/\s+/).filter(Boolean);
  const lista = claves.length
    ? todas.filter(p => {
        const pajar = normalizar([p.nombre, p.nombre_nativo, p.cientifico, p.uso, p.preparacion].filter(Boolean).join(" "));
        return claves.every(w => pajar.includes(w));
      })
    : todas;

  function guardar() {
    const nombre = form.nombre.trim(), uso = form.uso.trim(), preparacion = form.preparacion.trim();
    if (nombre.length < 2) { setForm({ ...form, error: "Escribe el nombre de la planta." }); return; }
    if (uso.length < 3) { setForm({ ...form, error: "Cuenta para qué se usa (por ejemplo: dolor de estómago)." }); return; }
    if (preparacion.length < 3) { setForm({ ...form, error: "Cuenta cómo se prepara (por ejemplo: infusión de hojas)." }); return; }
    const datos: DatosPlanta = {
      nombre, uso, preparacion, compartir: form.compartir, parte_utilizada: form.parte,
      ...(form.nativo.trim() ? { nombre_nativo: form.nativo.trim() } : {}),
      ...(form.precaucion.trim() ? { precaucion: form.precaucion.trim() } : {})
    };
    encolar("planta", datos as unknown as Record<string, unknown>);
    setForm(vacio);
    setAbierto(false);
    aviso(enRed ? "Planta guardada. Gracias por compartir tu saber: se está enviando" : "Sin señal: la planta quedó guardada y se enviará cuando haya internet");
  }

  const dictado = (id: "uso" | "preparacion") => (
    <button type="button" className="boton-ancho secundario" style={{ marginBottom: 12 }}
      onClick={() => dictar(id, t => setForm(f => ({ ...f, [id]: (f[id] ? f[id] + " " : "") + t })))}>
      <Icono nombre="memoria" /> {activo === id ? "Escuchando… toca para parar" : "Dictar con la voz"}
    </button>
  );

  if (detalle) {
    const p = todas.find(x => x.slug === detalle);
    if (!p) return <Volver texto={nombreLista} onClick={() => ir("salud", "plantas")} />;
    const ir_a = campo ? "Ve al hospital si hay:" : "Ve al centro de salud si hay:";
    return (
      <>
        <Volver texto={nombreLista} onClick={() => ir("salud", "plantas")} />
        <div className="tarjeta-palabra">
          <div className="foto-planta grande" style={{ background: p.color, color: "var(--verde)" }}>
            <Icono nombre="hoja" className="" width={64} height={64} style={{ opacity: 0.55 }} /><span>Foto de la planta</span>
          </div>
          <div className="cuerpo">
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>{p.nombre}</h2>
            {p.nombre_nativo && <div style={{ fontSize: 15, color: "var(--texto-suave)", marginBottom: 4 }}>En lengua propia: <b>{p.nombre_nativo}</b></div>}
            {p.cientifico && <div style={{ fontSize: 14, color: "var(--texto-suave)", fontStyle: "italic", marginBottom: 6 }}>{p.cientifico}</div>}
            <div className="relato-meta" style={{ marginBottom: 6 }}>
              {!p.validada && <span className="insignia-ventana publico">Sin validar con los mayores</span>}
              <Insignia x={p} />
              {p.pendiente && <span className="estado-envio pendiente">Pendiente por sincronizar</span>}
            </div>
            <div className="seccion-titulo">Para qué se usa</div><p>{p.uso}</p>
            <div className="seccion-titulo">Cómo se prepara</div><p>{p.preparacion}</p>
            {p.parte_utilizada && <><div className="seccion-titulo">Parte que se usa</div><p>{p.parte_utilizada}</p></>}
            {p.precaucion && <><div className="seccion-titulo">Precaución</div><p>{p.precaucion}</p></>}
            <div className="caja-urgente" style={{ marginTop: 16 }}><Icono nombre="hospital" /><span><b>{ir_a}</b> {p.hospital}</span></div>
            {p.autor_nombre && <p style={{ marginTop: 12, fontSize: 13, color: "var(--texto-suave)" }}>Aporte de {p.autor_nombre}</p>}
            <BotonLeer texto={`${p.nombre}. Para qué se usa: ${p.uso} Cómo se prepara: ${p.preparacion}${p.precaucion ? ` Precaución: ${p.precaucion}` : ""} ${ir_a.replace(":", "")}: ${p.hospital}`}>Escuchar</BotonLeer>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Volver texto="Salud" onClick={() => ir("salud")} />
      <h2 className="titulo-modulo">{nombreLista}</h2>
      <p className="subtitulo-pantalla">{subtitulo}</p>
      <div className="caja-urgente suave"><Icono nombre="aviso" /><span>Este conocimiento es tradicional y <b>no reemplaza la consulta médica</b>.</span></div>

      <input className="campo" type="search" style={{ marginTop: 14 }} placeholder="Buscar por planta o dolencia: tos, fiebre, dolor de estómago…"
        aria-label="Buscar plantas" value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      {lista.length ? (
        <div className="modulos">
          {lista.map(p => (
            <TarjetaModulo key={p.slug} icono={<Icono nombre="hoja" />} fondo={p.color} color="var(--verde)"
              titulo={p.nombre} desc={p.uso} voz={`${p.nombre}. Para qué se usa: ${p.uso} Cómo se prepara: ${p.preparacion}`}
              onClick={() => ir("salud", "plantas", p.slug)}
              extra={<>
                {p.nombre_nativo && <small style={{ display: "block", color: "var(--texto-suave)" }}>En lengua propia: {p.nombre_nativo}</small>}
                <small style={{ display: "block", color: "var(--texto-suave)" }}>Se prepara: {p.preparacion}</small>
                <span className="relato-meta" style={{ marginTop: 4 }}>
                  {p.pendiente && <span className="estado-envio pendiente">Pendiente por sincronizar</span>}
                  {!p.pendiente && !p.validada && p.autor_nombre && p.autor_nombre !== "Prototipo SABIA" && <span className="insignia-ventana publico">Sin validar</span>}
                  <Insignia x={p} />
                </span>
              </>} />
          ))}
        </div>
      ) : (
        <div className="sin-red" style={{ marginTop: 14 }}>
          {busqueda
            ? "No encontramos plantas con esa búsqueda. Prueba con otra palabra."
            : "Aún no hay plantas en el botiquín de esta comunidad. Aporta la primera con el botón de abajo."}
        </div>
      )}

      {!abierto ? (
        <button className="boton-ancho" style={{ marginTop: 18 }} onClick={() => setAbierto(true)}>
          <Icono nombre="hoja" /> Aportar saber de planta
        </button>
      ) : (
        <div className="caja-conectar">
          <h3><Icono nombre="hoja" /> Aportar saber de planta</h3>
          <p>Cuenta una planta que usa tu comunidad. Los mayores o sabedores podrán revisarla después.</p>
          <input className="campo" placeholder="Nombre de la planta (ej. Paico)" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
          <input className="campo" placeholder="Nombre en lengua propia (opcional)" value={form.nativo} onChange={e => setForm({ ...form, nativo: e.target.value })} />
          <textarea className="campo" rows={3} placeholder="¿Para qué se usa? (ej. dolor de estómago, fiebre, tos)" value={form.uso} onChange={e => setForm({ ...form, uso: e.target.value })} />
          {dictado("uso")}
          <textarea className="campo" rows={3} placeholder="¿Cómo se prepara? (ej. infusión de las hojas, emplasto, baño)" value={form.preparacion} onChange={e => setForm({ ...form, preparacion: e.target.value })} />
          {dictado("preparacion")}
          <select className="campo" aria-label="Parte que se usa" value={form.parte} onChange={e => setForm({ ...form, parte: e.target.value })}>
            {PARTES.map(x => <option key={x} value={x}>{x}</option>)}
          </select>
          <textarea className="campo" rows={2} placeholder="Precauciones (opcional): cuándo no usarla" value={form.precaucion} onChange={e => setForm({ ...form, precaucion: e.target.value })} />
          <label className="check-compartir">
            <input type="checkbox" checked={form.compartir} onChange={e => setForm({ ...form, compartir: e.target.checked })} />
            Compartir también con quienes visitan la comunidad (si no, queda solo para la comunidad)
          </label>
          {form.error && <div className="error-campo">{form.error}</div>}
          <button className="boton-ancho" onClick={guardar}>Guardar planta</button>
          <button className="boton-ancho secundario" style={{ marginTop: 8 }} onClick={() => { setAbierto(false); setForm(vacio); }}>Cancelar</button>
        </div>
      )}
    </>
  );
}
