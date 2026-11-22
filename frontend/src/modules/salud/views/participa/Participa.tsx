import { OpcionGrande } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { useApp } from "../../state/store";
import { Encuentros } from "./Encuentros";
import { Investigacion } from "./Investigacion";
import { HistoriaAfro, Microrracismo } from "./Saberes";

/* ---------- PARTICIPA (Mi comunidad · indígena y afro) ---------- */
export function Participa() {
  const sub = useApp(s => s.nav.sub);
  const afro = useApp(s => s.sesion?.usuario.comunidad === "afro");
  const ir = useApp(s => s.ir);

  if (sub === "encuentros") return <Encuentros />;
  if (sub === "investigacion") return <Investigacion />;
  if (sub === "historia") return <HistoriaAfro origen="participa" />;
  if (sub === "microrracismo") return <Microrracismo origen="participa" />;

  return (
    <>
      <h2 className="titulo-modulo">Participa</h2>
      <p className="subtitulo-pantalla">{afro
        ? "Encuentros, investigación y la historia que nos hace fuertes"
        : "Encuentros para fortalecer el arraigo y la investigación con nosotros"}</p>
      <div className="opciones-grandes" style={{ marginTop: 0 }}>
        <OpcionGrande icono="agenda" fondo="#E2ECE0" color="var(--verde)" titulo="Encuentros"
          desc={afro ? "Capacitaciones, conversatorios y reuniones" : "Conversatorios y reuniones de la comunidad"} onClick={() => ir("participa", "encuentros")} />
        <OpcionGrande icono="lupa" fondo="#E8EEF4" color="var(--azul)" titulo="Investigación con nosotros"
          desc="Proyectos de la U y cómo participar" onClick={() => ir("participa", "investigacion")} />
        {afro && <OpcionGrande icono="linea" fondo="#F7E2D9" color="#8A3B22" titulo="Historia y logros afro"
          desc="Memoria, resistencia y orgullo" onClick={() => ir("participa", "historia")} />}
      </div>
      {afro && (
        <button className="enlace-secundario" onClick={() => ir("participa", "microrracismo")}>
          <Icono nombre="escudo" /><span><b>¿Qué es un microrracismo?</b><small>Cómo reconocerlo y qué hacer</small></span><span className="flecha-mini">›</span>
        </button>
      )}
    </>
  );
}
