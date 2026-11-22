import { Volver } from "../components/comunes";
import { useApp } from "../state/store";

/* ---------- ACCESO ----------
   Dentro de ALUNA el ingreso es único: la persona entra con su cuenta de la plataforma
   (menú de perfil → Iniciar sesión) y su comunidad sale de la membresía verificada por
   la custodia. Por eso este módulo ya no tiene formulario propio. */
export function Acceso() {
  const ir = useApp(s => s.ir);
  const conSesion = useApp(s => !!s.sesion);
  return (
    <>
      <Volver texto="Volver" onClick={() => ir("puertas")} />
      <h2 className="titulo-modulo">Entra con tu cuenta de ALUNA</h2>
      <p className="subtitulo-pantalla">
        {conSesion
          ? "Tu perfil todavía no tiene una comunidad verificada. Solicita tu vinculación en «Comunidades» y, cuando la custodia la apruebe, aquí verás la salud de tu comunidad."
          : "Inicia sesión desde el menú de perfil de ALUNA. Usamos la misma cuenta para toda la plataforma."}
      </p>
      <div className="nota-gobernanza adentro">
        Cada comunidad decide quién es parte de ella: <b>solo su custodia valida las vinculaciones</b>.
      </div>
    </>
  );
}
