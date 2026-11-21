/* KORA · botón flotante + panel deslizable (asistente sin internet) */
import { useEffect, useRef, useState } from "react";
import { chipsKora, contextoKora, etiquetasContexto, responderKora } from "../lib/kora";
import { crearReconocedor } from "../lib/utilidades";
import { hablar } from "../lib/voz";
import { useApp, type AccionKora } from "../state/store";
import { BotonEscuchar } from "./comunes";
import { Icono } from "./icons/Icono";

export function Kora() {
  const kora = useApp(s => s.kora);
  const ventana = useApp(s => s.nav.ventana);
  const sesion = useApp(s => s.sesion);
  const { setKora } = useApp.getState();
  const [pregunta, setPregunta] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const reconocedor = useRef<ReturnType<typeof crearReconocedor>>(null);
  const lista = useRef<HTMLDivElement>(null);
  const responderConVoz = useRef(false);
  const ctx = contextoKora(ventana, sesion);

  /* Baja al último mensaje y, si la pregunta fue por voz, lee la respuesta */
  useEffect(() => {
    const l = lista.current;
    if (!l) return;
    l.scrollTop = l.scrollHeight;
    if (responderConVoz.current) {
      responderConVoz.current = false;
      const botones = l.querySelectorAll<HTMLElement>(".kora-msj.kora .escuchar");
      const ultimo = kora.mensajes[kora.mensajes.length - 1];
      hablar(ultimo?.texto, botones[botones.length - 1]);
    }
  }, [kora.mensajes, kora.abierto]);

  function abrirKora() {
    const cambios: Partial<typeof kora> = { abierto: true };
    if (!kora.saludado) {
      cambios.mensajes = [...kora.mensajes, { de: "kora", texto: `Hola${sesion ? ", " + sesion.usuario.nombre.split(" ")[0] : ""}. Soy Kora, tu guía en SABIA. Toca una pregunta, escríbela o dímela con el micrófono.` }];
      cambios.saludado = true;
    }
    setKora(cambios);
  }
  function cerrarKora() { setKora({ abierto: false }); detenerDictado(); }

  function enviarKora(texto: string) {
    texto = (texto || "").trim();
    if (!texto) return;
    const s = useApp.getState();
    const r = responderKora(texto, { contexto: contextoKora(s.nav.ventana, s.sesion), sesion: s.sesion, ventana: s.nav.ventana, datos: s.datos });
    setKora({ mensajes: [...s.kora.mensajes, { de: "persona", texto }, { de: "kora", texto: r.texto, acciones: r.acciones || [] }] });
  }

  function ejecutarAccion(a: AccionKora) {
    if ("tel" in a) { window.location.href = "tel:" + a.tel; return; }
    const s = useApp.getState();
    cerrarKora();
    if (a.antes) s.setUi(a.antes);
    if (a.donde === "adentro" && !(s.nav.ventana === "adentro" && s.sesion)) { s.ir("acceso"); s.aviso("Entra con tu cuenta para ver esta sección"); return; }
    if (a.donde === "afuera" && s.nav.ventana !== "afuera") {
      useApp.setState(st => ({ nav: { ...st.nav, ventana: "afuera" } }));
      void s.cargarDatos();
    }
    s.ir(a.pantalla, a.sub, a.detalle);
  }

  function dictarKora() {
    if (escuchando) { detenerDictado(); return; }
    const r = crearReconocedor();
    if (!r) { useApp.getState().aviso("Este navegador no permite dictar. Toca una pregunta o escríbela."); return; }
    reconocedor.current = r;
    setEscuchando(true);
    r.onresult = (e: { results: { 0: { 0: { transcript: string } } } }) => { responderConVoz.current = true; enviarKora(e.results[0][0].transcript); };
    r.onerror = () => useApp.getState().aviso("No te escuché bien. Intenta otra vez.");
    r.onend = () => setEscuchando(false);
    r.start();
  }
  function detenerDictado() {
    if (reconocedor.current && escuchando) { try { reconocedor.current.stop(); } catch { /* ya se detuvo */ } }
    setEscuchando(false);
  }

  return (
    <div id="kora">
      <button className={`kora-fab${kora.abierto ? " oculto" : ""}`} onClick={abrirKora} aria-label="Abrir a Kora, tu guía">
        <span className="kora-fab-ico"><Icono nombre="kora" /></span><span>Kora</span>
      </button>
      <div className={`kora-fondo${kora.abierto ? " visible" : ""}`} onClick={cerrarKora}></div>
      <section className={`kora-panel${kora.abierto ? " visible" : ""}`} role="dialog" aria-label="Kora, guía de SABIA" aria-hidden={!kora.abierto}>
        <div className="kora-agarre"></div>
        <header className="kora-cabecera">
          <span className="kora-avatar"><Icono nombre="kora" /></span>
          <div><b>Kora</b><small>Tu guía en SABIA · {etiquetasContexto[ctx]} · sin internet</small></div>
          <button className="kora-cerrar" onClick={cerrarKora} aria-label="Cerrar"><Icono nombre="cerrar" /></button>
        </header>
        <div className="kora-mensajes" id="koraMensajes" ref={lista}>
          {kora.mensajes.map((m, i) => m.de === "persona"
            ? <div key={i} className="kora-msj persona">{m.texto}</div>
            : (
              <div key={i} className="kora-msj kora">
                <div className="kora-texto">{m.texto}<BotonEscuchar texto={m.texto} /></div>
                {m.acciones && m.acciones.length > 0 && (
                  <div className="kora-acciones">
                    {m.acciones.map((a, j) => (
                      <button key={j} className={`kora-accion${"tel" in a ? " tel" : ""}`} onClick={() => ejecutarAccion(a)}>
                        {"tel" in a && <Icono nombre="telefono" />}<span>{a.texto}</span><b>›</b>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
        <div className="kora-chips">
          {chipsKora[ctx].map(ch => <button key={ch} onClick={() => enviarKora(ch)}>{ch}</button>)}
        </div>
        <form className="kora-entrada" onSubmit={e => { e.preventDefault(); enviarKora(pregunta); setPregunta(""); }}>
          <button type="button" className={`kora-mic${escuchando ? " hablando" : ""}`} id="koraMic" onClick={dictarKora} aria-label="Preguntar con la voz"><Icono nombre="memoria" /></button>
          <input name="pregunta" autoComplete="off" placeholder="Escribe tu pregunta…" value={pregunta} onChange={e => setPregunta(e.target.value)} />
          <button type="submit" className="kora-enviar" aria-label="Enviar"><Icono nombre="enviar" /></button>
        </form>
      </section>
    </div>
  );
}
