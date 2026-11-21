import { OpcionGrande, Volver } from "../components/comunes";
import { useApp } from "../state/store";
import { TarjetaEncuentro } from "./participa/Encuentros";
import { HistoriaAfro, Microrracismo } from "./participa/Saberes";

/* ---------- APRENDE (puerta Conocer) ---------- */
export function Aprende() {
  const sub = useApp(s => s.nav.sub);
  const encuentros = useApp(s => s.datos.encuentros);
  const ir = useApp(s => s.ir);

  if (sub === "historia") return <HistoriaAfro origen="aprende" />;
  if (sub === "microrracismo") return <Microrracismo origen="aprende" />;
  if (sub === "encuentros") return (
    <>
      <Volver texto="Aprende" onClick={() => ir("aprende")} />
      <h2 className="titulo-modulo">Encuentros abiertos</h2>
      <p className="subtitulo-pantalla">Actividades que las comunidades abren a todos</p>
      <div className="lista-lugares">{encuentros.map(e => <TarjetaEncuentro key={e.id} e={e} conInscripcion={false} />)}</div>
      <p className="aviso-ejemplo">Fechas y lugares de ejemplo.</p>
    </>
  );

  return (
    <>
      <h2 className="titulo-modulo">Aprende</h2>
      <p className="subtitulo-pantalla">Conocer al otro es el primer paso contra el racismo</p>
      <div className="opciones-grandes" style={{ marginTop: 0 }}>
        <OpcionGrande icono="linea" fondo="#F7E2D9" color="#8A3B22" titulo="Historia y logros afro" desc="Memoria, resistencia y aportes al país" onClick={() => ir("aprende", "historia")} />
        <OpcionGrande icono="escudo" fondo="#E2ECE0" color="var(--verde)" titulo="¿Qué es un microrracismo?" desc="Cómo reconocerlo y evitarlo" onClick={() => ir("aprende", "microrracismo")} />
        <OpcionGrande icono="agenda" fondo="#E8EEF4" color="var(--azul)" titulo="Encuentros abiertos" desc="Capacitaciones y conversatorios para todos" onClick={() => ir("aprende", "encuentros")} />
      </div>
    </>
  );
}
