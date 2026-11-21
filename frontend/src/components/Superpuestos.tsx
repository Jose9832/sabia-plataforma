import { useApp } from "../state/store";

/** Mensaje flotante breve. */
export function Toast() {
  const toast = useApp(s => s.toast);
  return (
    <div className={`toast${toast ? " visible" : ""}`} id="toast" role="status" aria-live="polite">
      {toast?.texto}
    </div>
  );
}

/** Pantalla completa con la frase del paciente, para mostrársela al médico. */
export function PantallaMedico() {
  const frase = useApp(s => s.fraseMedico);
  const mostrarTexto = useApp(s => s.mostrarTexto);
  return (
    <div className={`pantalla-medico${frase ? " visible" : ""}`} id="pantallaMedico" onClick={() => mostrarTexto(null)}>
      <small>Mensaje del paciente</small>
      <p id="fraseGrande">{frase}</p>
      <small>Toca la pantalla para cerrar</small>
    </div>
  );
}
