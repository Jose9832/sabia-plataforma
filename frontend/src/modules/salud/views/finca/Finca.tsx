import { OpcionGrande } from "../../components/comunes";
import { operacionesPendientes, useApp } from "../../state/store";
import { Alertas } from "./Alertas";
import { Calendario } from "./Calendario";
import { Cuentas } from "./Cuentas";
import { Semillas } from "./Semillas";

/* ---------- MI FINCA: semillas, calendario, alertas y cuentas ---------- */
export function Finca() {
  const sub = useApp(s => s.nav.sub);
  const pend = useApp(s => (s.sincronizando ? 0 : operacionesPendientes(s.cola, "alerta", s.sesion?.usuario.id).length));
  const ir = useApp(s => s.ir);

  if (sub === "semillas") return <Semillas />;
  if (sub === "calendario") return <Calendario />;
  if (sub === "alertas") return <Alertas />;
  if (sub === "cuentas") return <Cuentas />;

  return (
    <>
      <h2 className="titulo-modulo">Mi finca</h2>
      <p className="subtitulo-pantalla">La tierra, el clima y los cultivos de la vereda</p>
      <div className="opciones-grandes" style={{ marginTop: 0 }}>
        <OpcionGrande icono="semilla" fondo="#F3ECD1" color="#6E5A12" titulo="Banco de semillas" desc="Trueque de semillas entre veredas" onClick={() => ir("finca", "semillas")} />
        <OpcionGrande icono="calendario" fondo="#E2ECE0" color="var(--verde)" titulo="Calendario de siembra" desc="Siembra, cosecha y fases de la luna" onClick={() => ir("finca", "calendario")} />
        <OpcionGrande icono="aviso" fondo="#FCEAE4" color="#B8442A" titulo="Alertas de la vereda"
          desc={pend ? `${pend} alerta(s) esperando señal` : "Derrumbes, crecientes y plagas"} onClick={() => ir("finca", "alertas")} />
        <OpcionGrande icono="cuaderno" fondo="#E8EEF4" color="var(--azul)" titulo="Cuaderno de cuentas" desc="Cuánto invertí y cuánto gané" onClick={() => ir("finca", "cuentas")} />
      </div>
    </>
  );
}
