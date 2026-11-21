import { Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { calendarioCultivos, meses, mesesLargos } from "../../data/contenido";
import { faseLunar } from "../../lib/utilidades";
import { useApp } from "../../state/store";

function DibujoLuna({ iluminada, creciente }: { iluminada: number; creciente: boolean }) {
  const r = 26, c = 30, rx = Math.abs(1 - 2 * iluminada) * r;
  const ladoLuz = creciente ? 1 : 0;            /* 1 = mitad derecha iluminada */
  const mitad = `M ${c} ${c - r} A ${r} ${r} 0 0 ${ladoLuz} ${c} ${c + r} Z`;
  const colorElipse = iluminada > 0.5 ? "#F4EBD0" : "#3A3A46";
  return (
    <svg viewBox="0 0 60 60" width="64" height="64" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="#3A3A46" />
      <path d={mitad} fill="#F4EBD0" />
      <ellipse cx={c} cy={c} rx={rx} ry={r} fill={colorElipse} />
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,.25)" />
    </svg>
  );
}

/* --- Calendario agrícola + fase de la luna --- */
export function Calendario() {
  const mesElegido = useApp(s => s.ui.mesElegido);
  const { ir, setUi } = useApp.getState();
  const luna = faseLunar();
  const hoy = new Date().getMonth();
  const siembra = calendarioCultivos.filter(c => c.siembra.includes(mesElegido)).map(c => c.cultivo);
  const cosecha = calendarioCultivos.filter(c => c.cosecha.includes(mesElegido)).map(c => c.cultivo);
  const consejoLuna = luna.creciente
    ? "En luna creciente muchos campesinos siembran lo que da fruto y hoja (maíz, fríjol, hortalizas)."
    : "En luna menguante muchos campesinos siembran lo de raíz (yuca, ñame) y cortan madera.";

  return (
    <>
      <Volver texto="Mi finca" onClick={() => ir("finca")} />
      <h2 className="titulo-modulo">Calendario de siembra</h2>
      <div className="tarjeta-luna">
        <DibujoLuna {...luna} />
        <div><small>Hoy</small><b>{luna.nombre}</b><span>{consejoLuna}</span></div>
      </div>
      <div className="titulo-seccion">Elige el mes</div>
      <div className="meses">
        {meses.map((m, i) => (
          <button key={m} className={`mes ${i === mesElegido ? "activo" : ""} ${i === hoy ? "hoy" : ""}`} onClick={() => setUi({ mesElegido: i })}>{m}</button>
        ))}
      </div>
      <div className="actividad">
        <div className="actividad-titulo" style={{ color: "var(--verde)" }}><Icono nombre="semilla" /> Siembra en {mesesLargos[mesElegido]}</div>
        <div className="actividad-cultivos">{siembra.length ? siembra.map(c => <span key={c} className="cultivo">{c}</span>) : <span className="vacio">Nada en este mes</span>}</div>
      </div>
      <div className="actividad">
        <div className="actividad-titulo" style={{ color: "var(--tierra)" }}><Icono nombre="hoja" /> Cosecha en {mesesLargos[mesElegido]}</div>
        <div className="actividad-cultivos">{cosecha.length ? cosecha.map(c => <span key={c} className="cultivo cosecha">{c}</span>) : <span className="vacio">Nada en este mes</span>}</div>
      </div>
      <div className="nota-gobernanza adentro" style={{ marginTop: 14 }}><b>Cabañuelas:</b> anota cómo está el clima en los primeros días de enero; según la tradición, anuncian cómo vendrán los meses del año.</div>
      <p className="fuente">Referencia general para el Magdalena. Ajústala con los saberes de los mayores de tu vereda.</p>
    </>
  );
}
