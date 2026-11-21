import { useEffect, useState } from "react";
import { EtiquetaComunidad, Insignia } from "../components/comunes";
import { Icono } from "../components/icons/Icono";
import type { Podcast, Relato } from "../data/tipos";
import { aSeg, aTexto, analizarEnlace } from "../lib/utilidades";
import { enLinea, operacionesPendientes, useApp } from "../state/store";

/* ---------- MEMORIA: relatos offline + podcasts en YouTube / Spotify ---------- */
function BotonesPlataforma({ r }: { r: Relato }) {
  const aviso = useApp(s => s.aviso);
  const boton = (clase: string, icono: "youtube" | "spotify", nombre: string, enlace: string) => enlace
    ? <a className={`boton-plataforma ${clase}`} href={enlace} target="_blank" rel="noopener"><Icono nombre={icono} /> {nombre}</a>
    : <button className={`boton-plataforma ${clase}`} onClick={() => aviso(`Este relato aún no está publicado en ${nombre}`)}><Icono nombre={icono} /> {nombre}</button>;
  return <div className="botones-plataforma">{boton("yt", "youtube", "YouTube", r.youtube)}{boton("sp", "spotify", "Spotify", r.spotify)}</div>;
}

export function Memoria() {
  const ventana = useApp(s => s.nav.ventana);
  const relatos = useApp(s => s.datos.relatos);
  const podcastsServidor = useApp(s => s.datos.podcasts);
  const cola = useApp(s => s.cola);
  const sesion = useApp(s => s.sesion);
  const enRed = useApp(s => enLinea(s));
  const sincronizando = useApp(s => s.sincronizando);
  const { encolar, aviso } = useApp.getState();
  const adentro = ventana === "adentro";

  /* Reproductor simulado de los relatos guardados en el teléfono */
  const [activo, setActivo] = useState<number | null>(null);
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    if (activo === null) return;
    const t = setInterval(() => setSegundos(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [activo]);
  const relatoActivo = relatos.find(x => x.id === activo);
  useEffect(() => {
    if (relatoActivo && segundos >= aSeg(relatoActivo.duracion)) { setActivo(null); setSegundos(0); }
  }, [segundos, relatoActivo]);
  const alternarRelato = (id: number) => { setSegundos(0); setActivo(activo === id ? null : id); };

  /* Podcasts conectados: los del servidor + los que esperan señal en la cola */
  const pendientes: Podcast[] = adentro && sesion
    ? operacionesPendientes(cola, "podcast", sesion.usuario.id).flatMap(op => {
        const d = op.datos as { titulo: string; url: string; compartir: boolean };
        const e = analizarEnlace(d.url);
        return e ? [{ id: op.id, comunidad: sesion.usuario.comunidad, visibilidad: d.compartir ? "afuera" : "adentro",
          titulo: d.titulo || (e.plataforma === "youtube" ? "Podcast en YouTube" : "Podcast en Spotify"), pendiente: !sincronizando, ...e } as Podcast] : [];
      })
    : [];
  const enviados = new Set(podcastsServidor.map(p => p.client_id));
  const listaPodcasts = [...pendientes.filter(p => !enviados.has(String(p.id))), ...podcastsServidor];

  const [form, setForm] = useState({ titulo: "", enlace: "", compartir: false, error: "" });
  function conectarPodcast() {
    const datos = analizarEnlace(form.enlace);
    if (!datos) { setForm({ ...form, error: "El enlace no es de YouTube ni de Spotify. Copia el enlace del video o del episodio." }); return; }
    encolar("podcast", { titulo: form.titulo.trim(), url: form.enlace.trim(), compartir: form.compartir });
    setForm({ titulo: "", enlace: "", compartir: false, error: "" });
    aviso(enRed ? "Podcast conectado" : "Sin señal: el podcast se conectará cuando haya internet");
  }

  return (
    <>
      <h2 className="titulo-modulo">Memoria y voces</h2>
      <div className="banner-directorio" style={{ background: "linear-gradient(120deg,#5E5280,#7D72A0)", boxShadow: "0 10px 24px rgba(94,82,128,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
        <span className="ico"><Icono nombre="memoria" /></span>
        <div><b>Voces de los mayores</b><span>Relatos guardados en el teléfono y publicados como podcast en YouTube y Spotify</span></div>
      </div>

      <div className="titulo-seccion">Relatos guardados (sin internet)</div>
      <div className="lista-relatos">
        {relatos.map(r => {
          const esActivo = activo === r.id;
          return (
            <div key={r.id} className={`relato${esActivo ? " activo" : ""}`}>
              <div className="relato-fila">
                <button className="boton-play" onClick={() => alternarRelato(r.id)} aria-label={esActivo ? "Pausar" : "Reproducir"}>{esActivo ? "❚❚" : "▶"}</button>
                <div className="relato-info">
                  <strong>{r.titulo}</strong>
                  <div className="sabedor">{r.sabedor}</div>
                  <div className="relato-meta">
                    <span className="etiqueta-offline">Guardado offline</span><Insignia x={r} /><EtiquetaComunidad x={r} />
                    <span className="duracion">{esActivo ? aTexto(segundos) + " / " : ""}{r.duracion}</span>
                  </div>
                </div>
              </div>
              {esActivo && <>
                <div className="barra"><div style={{ width: `${segundos / aSeg(r.duracion) * 100}%` }}></div></div>
                <div className="subtitulos">
                  <small>Subtítulos IA · revisados por la comunidad</small>
                  <div className="ikun-sub">(transcripción en lengua propia)</div>
                  <div className="es-sub">Subtítulo de ejemplo {Math.floor(segundos / 4) + 1}: aquí aparece en español lo que dice el mayor.</div>
                </div>
              </>}
              <BotonesPlataforma r={r} />
            </div>
          );
        })}
      </div>

      <div className="titulo-seccion">Podcasts conectados</div>
      {listaPodcasts.length ? listaPodcasts.map(p => (
        <div key={p.id} className="relato" style={{ marginBottom: 10 }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 8, color: p.plataforma === "youtube" ? "#C4302B" : "#1D8F48" }}>
            <Icono nombre={p.plataforma} /> <span style={{ color: "var(--texto)" }}>{p.titulo}</span>
          </strong>
          <div className="relato-meta" style={{ marginTop: 6 }}>
            <Insignia x={p} />
            {p.pendiente && <span className="estado-envio pendiente">Esperando señal</span>}
          </div>
          {enRed
            ? <div className={`reproductor ${p.plataforma === "youtube" ? "yt" : "sp"}`}><iframe src={p.embed} title={p.titulo} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen loading="lazy"></iframe></div>
            : <div className="sin-red">Sin conexión: este podcast se escucha cuando haya internet. Los relatos guardados sí funcionan.</div>}
          <div className="botones-plataforma">
            <a className={`boton-plataforma ${p.plataforma === "youtube" ? "yt" : "sp"}`} href={p.abrir} target="_blank" rel="noopener">
              <Icono nombre="enlace" /> Abrir en {p.plataforma === "youtube" ? "YouTube" : "Spotify"}
            </a>
          </div>
        </div>
      )) : <div className="sin-red">{adentro ? "Aún no hay podcasts conectados. Agrega uno abajo." : "La comunidad aún no ha compartido podcasts."}</div>}

      {adentro && (
        <div className="caja-conectar">
          <h3><Icono nombre="enlace" /> Conectar un podcast</h3>
          <p>Pega el enlace de un video de YouTube o de un episodio de Spotify.</p>
          <input className="campo" placeholder="Título del podcast" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
          <input className="campo" placeholder="https://www.youtube.com/watch?v=…  o  https://open.spotify.com/episode/…" value={form.enlace} onChange={e => setForm({ ...form, enlace: e.target.value })} />
          <label className="check-compartir"><input type="checkbox" checked={form.compartir} onChange={e => setForm({ ...form, compartir: e.target.checked })} /> Compartir también en "Conocer"</label>
          {form.error && <div className="error-campo">{form.error}</div>}
          <button className="boton-ancho" onClick={conectarPodcast}>Conectar</button>
        </div>
      )}
    </>
  );
}
