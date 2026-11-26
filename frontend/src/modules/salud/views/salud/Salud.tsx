import { useApp } from "../../state/store";
import { DecirMedico } from "./DecirMedico";
import { Plantas } from "./Plantas";
import { SaludAfro } from "./SaludAfro";
import { SaludCampo } from "./SaludCampo";

/** Cada comunidad tiene su propio módulo de salud. */
export function Salud() {
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  const sub = useApp(s => s.nav.sub);
  if (comunidad === "campesina") return <SaludCampo />;
  if (comunidad === "afro") return <SaludAfro />;
  if (sub === "plantas") return <Plantas variante="indigena" />;
  return <DecirMedico />;
}
