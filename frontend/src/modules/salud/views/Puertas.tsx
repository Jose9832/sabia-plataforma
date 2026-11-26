import { useSyncExternalStore } from "react";
import { BotonEscuchar } from "../components/comunes";
import { Icono } from "../components/icons/Icono";
import { cambiarVoz, nombreCortoVoz, suscribirVoz } from "../lib/voz";
import { useApp } from "../state/store";

/* ---------- PUERTAS ---------- */
export function Puertas() {
  const entrar = useApp(s => s.entrar);
  const aviso = useApp(s => s.aviso);
  const comunidad = useApp(s => s.sesion?.usuario.comunidad);
  const conSesion = useApp(s => !!s.sesion);

  /* «Mi comunidad» usa la sesión de ALUNA: entra quien tenga una membresía verificada */
  const entrarAMiComunidad = () => {
    if (comunidad) entrar("adentro");
    else if (conSesion) aviso("Tu perfil aún no tiene una comunidad verificada. Pide tu vinculación en «Comunidades».");
    else aviso("Inicia sesión en ALUNA para entrar a Mi comunidad.");
  };
  const nombreVoz = useSyncExternalStore(suscribirVoz, nombreCortoVoz);

  return (
    <div className="puertas">
      <div className="pregunta">¿Por dónde quieres entrar?</div>
      <div className="puertas-opciones">
        <div role="button" className="puerta adentro" onClick={entrarAMiComunidad}>
          <span className="grande"><Icono nombre="casa" /></span>
          <span><strong>Mi comunidad</strong><small>Indígenas, afrodescendientes y campesinos: salud, memoria y ayuda</small></span>
          <BotonEscuchar texto="Mi comunidad. Para comunidades indígenas, afrodescendientes y campesinas. Entra con tu cuenta de ALUNA." />
        </div>
        <div role="button" className="puerta afuera" onClick={() => entrar("afuera")}>
          <span className="grande"><Icono nombre="mundo" /></span>
          <span><strong>Conocer</strong><small>Para visitantes: memorias e historias compartidas</small></span>
          <BotonEscuchar texto="Conocer. Para visitantes: memorias e historias que la comunidad comparte." />
        </div>
      </div>
      <button
        className="boton-voz"
        onClick={e => { if (!cambiarVoz(e.currentTarget)) aviso("Este dispositivo no tiene otras voces en español"); }}
        aria-label="Cambiar la voz"
      >
        <Icono nombre="sonido" /><span>Voz: <b id="nombreVoz">{nombreVoz}</b></span><small>Cambiar</small>
      </button>
      <div className="pie">Funciona sin internet</div>
    </div>
  );
}
