import { useEffect, useRef } from "react";
import { Icono, Simbolo } from "../../components/icons/Icono";
import { partesCuerpo, sintomas } from "../../data/contenido";
import { hablar } from "../../lib/voz";
import { OpcionGrande } from "../../components/comunes";
import { useApp } from "../../state/store";

const etiqueta = (x: { propia: string | null; nombre: string }) => x.propia || x.nombre;

export function generarFrase(parteSel: string | null, sintomaSel: string | null) {
  const p = partesCuerpo.find(x => x.id === parteSel), s = sintomas.find(x => x.id === sintomaSel);
  const lugar = p ? `${p.art} ${p.nombre.toLowerCase()}` : "";
  if (p && s) return s.general ? `El paciente indica ${s.texto} y molestia en ${lugar}.` : `El paciente indica ${s.texto} en ${lugar}.`;
  if (p) return `El paciente señala molestia en ${lugar}…`;
  if (s) return `El paciente indica ${s.texto}…`;
  return null;
}

/* ---------- SALUD: figura del cuerpo + ¿qué sientes? ---------- */
export function DecirMedico() {
  const parteSel = useApp(s => s.ui.parteSel);
  const sintomaSel = useApp(s => s.ui.sintomaSel);
  const { setUi, mostrarTexto } = useApp.getState();
  const ir = useApp(s => s.ir);
  const frase = generarFrase(parteSel, sintomaSel);
  const completa = !!(parteSel && sintomaSel);

  /* La barra se anima solo la primera vez que aparece */
  const habiaFrase = useRef(!!frase);
  const aparece = !!frase && !habiaFrase.current;
  useEffect(() => { habiaFrase.current = !!frase; });

  const elegir = (tipo: "parte" | "sintoma", id: string) => {
    if (tipo === "parte") setUi({ parteSel: parteSel === id ? null : id });
    else setUi({ sintomaSel: sintomaSel === id ? null : id });
  };
  const zona = (id: string) => ({ className: `zona ${parteSel === id ? "sel" : ""}`, onClick: () => elegir("parte", id) });

  return (
    <>
      <h2 className="titulo-modulo">Salud</h2>
      <p style={{ color: "var(--texto-suave)" }}>Toca dónde te duele y qué sientes</p>
      <OpcionGrande icono="hoja" fondo="#E2ECE0" color="var(--verde)" titulo="Botiquín ancestral" desc="Plantas medicinales de nuestra comunidad" onClick={() => ir("salud", "plantas")} />

      <div className="paso-titulo"><span className="paso-num">1</span> ¿Dónde te duele?</div>
      <div className="selector-cuerpo">
        <svg className="figura" viewBox="0 0 120 220" aria-label="Figura del cuerpo">
          <circle cx="60" cy="26" r="20" {...zona("cabeza")} />
          <rect x="18" y="52" width="17" height="72" rx="8" {...zona("brazo")} />
          <rect x="85" y="52" width="17" height="72" rx="8" {...zona("brazo")} />
          <rect x="38" y="50" width="44" height="40" rx="10" {...zona("pecho")} />
          <rect x="40" y="92" width="40" height="36" rx="10" {...zona("estomago")} />
          <rect x="41" y="130" width="17" height="84" rx="8" {...zona("pierna")} />
          <rect x="62" y="130" width="17" height="84" rx="8" {...zona("pierna")} />
        </svg>
        <div className="lista-partes">
          {partesCuerpo.map(p => (
            <button key={p.id} className={`boton-parte ${parteSel === p.id ? "sel" : ""}`} onClick={() => elegir("parte", p.id)}>{etiqueta(p)}</button>
          ))}
        </div>
      </div>

      <div className="paso-titulo"><span className="paso-num">2</span> ¿Qué sientes?</div>
      <div className="grid-sintomas">
        {sintomas.map(s => (
          <button key={s.id} className={`boton-sintoma ${sintomaSel === s.id ? "sel" : ""}`} onClick={() => elegir("sintoma", s.id)}>
            <Simbolo id={s.id} />
            <span className="etiqueta-principal">{etiqueta(s)}</span>
          </button>
        ))}
      </div>

      <div className="nota-pendiente"><Icono nombre="aviso" />
        <span><b>Pendiente:</b> los símbolos son provisionales (se definirán con Wilmer) y las etiquetas se mostrarán en la lengua de la comunidad cuando esté lista la base de datos. Por ahora se ven en español.</span>
      </div>

      {frase ? (
        <div className={`caja-frase ${aparece ? "aparece" : ""}`}>
          <div className="cabecera-frase">
            <small>Frase para el médico</small>
            <button className="limpiar" onClick={() => setUi({ parteSel: null, sintomaSel: null })}>Limpiar</button>
          </div>
          <p>{frase}</p>
          <div className="acciones-frase">
            <button className="principal" onClick={() => mostrarTexto(frase)} disabled={!completa}><Icono nombre="ampliar" /> Mostrar al médico</button>
            <button className="secundario" onClick={e => hablar(frase, e.currentTarget)} disabled={!completa}><Icono nombre="sonido" /> Escuchar</button>
          </div>
        </div>
      ) : (
        <div className="caja-frase-guia">
          <small>Frase para el médico</small>
          <p>Elige dónde te duele y qué sientes. Aquí se armará la frase para mostrarle al médico.</p>
        </div>
      )}
    </>
  );
}
