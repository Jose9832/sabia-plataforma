import { useApp } from "../../state/store";
import { DecirMedico } from "./DecirMedico";
import { SaludAfro } from "./SaludAfro";
import { SaludCampo } from "./SaludCampo";

/** Cada comunidad tiene su propio módulo de salud. */
export function Salud() {
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  if (comunidad === "campesina") return <SaludCampo />;
  if (comunidad === "afro") return <SaludAfro />;
  return <DecirMedico />;
}
