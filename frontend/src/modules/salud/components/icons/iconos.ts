/* =========================================================
   ÍCONOS (líneas simples, estilo formal) — trazos del prototipo original.
   Cada ícono: contenido SVG + viewBox + grosor de línea.
   ========================================================= */
export interface DefIcono {
  d: string;
  vb?: string;
  ancho?: number;
}

const i = (d: string, vb = "0 0 24 24", ancho = 2): DefIcono => ({ d, vb, ancho });

export const iconos = {
  inicio: i('<path d="M3 11 L12 3 L21 11"/><path d="M5 10 V21 H19 V10"/>'),
  casa: i('<path d="M2.5 11 L12 3 L21.5 11"/><path d="M6.5 10.6 L12 6 L17.5 10.6"/><path d="M5 10 V19.5 A1.5 1.5 0 0 0 6.5 21 H17.5 A1.5 1.5 0 0 0 19 19.5 V10"/><path d="M10 21 V16.5 A2 2 0 0 1 14 16.5 V21"/>', "0 0 24 24", 1.8),
  mundo: i('<circle cx="11" cy="11" r="8"/><path d="M3 11 H19"/><path d="M11 3 C14 6 14 16 11 19 C8 16 8 6 11 3"/><path d="M14.5 21.5 C14.5 17.5 17 15.5 21.5 15.5 C21.5 19.5 19 21.5 14.5 21.5 Z" fill="currentColor" fill-opacity="0.25"/><path d="M14.5 21.5 L18.5 17.8"/>', "0 0 24 24", 1.8),
  salud: i('<path d="M12 21 C5 15 3 12 3 8.5 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 21 8.5 C21 12 19 15 12 21 Z"/><path d="M12 10 V15 M9.5 12.5 H14.5"/>'),
  memoria: i('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11 A7 7 0 0 0 19 11"/><path d="M12 18 V21"/>'),
  ayuda: i('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6 L9.2 9.2 M14.8 14.8 L18.4 18.4 M18.4 5.6 L14.8 9.2 M9.2 14.8 L5.6 18.4"/>'),
  historias: i('<path d="M4 5 A2 2 0 0 1 6 3 H20 V19 H6 A2 2 0 0 0 4 21 Z"/><path d="M4 19 A2 2 0 0 1 6 17 H20"/>'),
  hospital: i('<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M12 8 V14 M9 11 H15"/><path d="M10 21 V18 H14 V21"/>'),
  balanza: i('<path d="M12 4 V20 M8 20 H16 M5 7 H19"/><path d="M5 7 L2.5 13 H7.5 Z M19 7 L16.5 13 H21.5 Z"/>'),
  documento: i('<path d="M6 3 H14 L19 8 V21 H6 Z"/><path d="M14 3 V8 H19 M9 13 H16 M9 17 H16"/>'),
  telefono: i('<path d="M5 4 H9 L11 9 L8.5 10.5 A11 11 0 0 0 13.5 15.5 L15 13 L20 15 V19 A2 2 0 0 1 18 21 A16 16 0 0 1 3 6 A2 2 0 0 1 5 4 Z"/>'),
  pin: i('<path d="M12 21 C12 21 5 14 5 9 A7 7 0 0 1 19 9 C19 14 12 21 12 21 Z"/><circle cx="12" cy="9" r="2.5"/>'),
  enlace: i('<path d="M10 14 A4 4 0 0 0 16 14 L19 11 A4 4 0 0 0 13 5 L12 6"/><path d="M14 10 A4 4 0 0 0 8 10 L5 13 A4 4 0 0 0 11 19 L12 18"/>'),
  youtube: i('<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9 L15 12 L10 15 Z" fill="currentColor"/>'),
  spotify: i('<circle cx="12" cy="12" r="9.5"/><path d="M7 9.5 C10.5 8.5 14 9 17 10.5 M7.5 12.5 C10.5 11.8 13.5 12.2 16 13.5 M8 15.5 C10.5 15 12.5 15.3 14.5 16.3"/>'),
  ampliar: i('<path d="M4 9 V4 H9 M15 4 H20 V9 M20 15 V20 H15 M9 20 H4 V15"/>'),
  sonido: i('<path d="M4 9 H8 L13 5 V19 L8 15 H4 Z"/><path d="M16.5 8.5 A5 5 0 0 1 16.5 15.5 M19 6 A8.5 8.5 0 0 1 19 18"/>'),
  aviso: i('<path d="M12 3 L22 20 H2 Z"/><path d="M12 10 V14 M12 17 V17.5"/>'),
  candado: i('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11 V7 A4 4 0 0 1 16 7 V11"/>'),
  nube: i('<path d="M7 18 H17 A4 4 0 0 0 17 10 A6 6 0 0 0 5.5 11.5 A3.3 3.3 0 0 0 7 18 Z"/>'),
  hilo: i('<circle cx="12" cy="12" r="8"/><path d="M6 8 C10 10 14 10 18 8 M5 13 C9 15 15 15 19 13 M8 18.5 C11 17 15 17 17 18"/>'),
  logo: i('<path d="M2 20 L9 8 L13 14 L16 10 L22 20 Z"/><circle cx="17" cy="5" r="2"/>', "0 0 24 24", 1.4),

  /* Comunidad campesina */
  finca: i('<path d="M3 11 L12 4 L21 11"/><path d="M5 10 V20 H19 V10"/><path d="M12 20 V14"/><path d="M12 16 C9.5 16 8.5 14 8.5 12.5 C10.5 12.5 12 13.5 12 16 Z"/>'),
  semilla: i('<path d="M12 3 C7 7 6 13 12 21 C18 13 17 7 12 3 Z"/><path d="M12 8 V17"/>'),
  calendario: i('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10 H21 M8 3 V7 M16 3 V7"/>'),
  cuaderno: i('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8 H15 M9 12 H15 M9 16 H12"/>'),
  botiquin: i('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7 V5 H15 V7 M12 10.5 V16.5 M9 13.5 H15"/>'),
  hoja: i('<path d="M12 21 V10"/><path d="M12 13 C6 13 4 8 4 4 C9 4 12 7 12 13 Z"/><path d="M12 11 C16 11 20 9 20 4 C15 4 12 6 12 11 Z"/>'),
  camara: i('<path d="M4 8 H8 L10 5 H14 L16 8 H20 V19 H4 Z"/><circle cx="12" cy="13" r="3.5"/>'),
  chat: i('<path d="M4 20 L5.5 15.5 A8 8 0 1 1 8.5 18.5 Z"/><path d="M9 11 H15 M9 14 H13"/>'),
  derrumbe: i('<path d="M3 20 H21 L14 6 L9 13 Z"/><circle cx="6" cy="16.5" r="1.4"/><circle cx="9.5" cy="18" r="1"/>'),
  creciente: i('<path d="M2 8 C5 5 8 11 12 8 C16 5 19 11 22 8"/><path d="M2 13 C5 10 8 16 12 13 C16 10 19 16 22 13"/><path d="M2 18 C5 15 8 21 12 18 C16 15 19 21 22 18"/>'),
  plaga: i('<ellipse cx="12" cy="13.5" rx="4" ry="6"/><path d="M12 7.5 V5 M10 4 L12 5 L14 4 M8 10.5 L4 8.5 M16 10.5 L20 8.5 M8 14 H4 M16 14 H20 M8.5 17.5 L5 20 M15.5 17.5 L19 20"/>'),
  camino: i('<path d="M8 3 L4 21 M16 3 L20 21 M12 4 V7 M12 10 V13 M12 16 V20"/>'),
  dictar: i('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11 A7 7 0 0 0 19 11"/><path d="M12 18 V21"/>'),

  /* Participa y aprende */
  participa: i('<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20 C3 15.5 6 13.5 9 13.5 C12 13.5 15 15.5 15 20"/><path d="M15 14.2 C17.8 13.8 21 15.2 21 19"/>'),
  aprende: i('<path d="M2 9 L12 4 L22 9 L12 14 Z"/><path d="M6 11 V16 C8 18 16 18 18 16 V11"/><path d="M22 9 V15"/>'),
  agenda: i('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10 H21 M8 3 V7 M16 3 V7"/><circle cx="12" cy="15" r="2"/>'),
  lupa: i('<circle cx="11" cy="11" r="6.5"/><path d="M16 16 L21 21"/>'),
  linea: i('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M6 8.5 V15.5 M10 6 H20 M10 18 H20"/>'),
  escudo: i('<path d="M12 3 L20 6 V12 C20 16.5 16.5 20 12 21 C7.5 20 4 16.5 4 12 V6 Z"/><path d="M9 12 L11 14 L15 10"/>'),

  /* Salud afro */
  parteria: i('<circle cx="12" cy="6" r="3"/><path d="M8 21 V14 C8 11 10 10 12 10 C15.5 10 17 12.5 17 15 C17 17.5 15 19 12.5 19 H11"/><circle cx="13.5" cy="15" r="2"/>'),
  ruta: i('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19 H15 A3.5 3.5 0 0 0 15 12 H9 A3.5 3.5 0 0 1 9 5 H16"/>'),
  sabedora: i('<circle cx="12" cy="7" r="3.5"/><path d="M5 21 C5 16 8 13.5 12 13.5 C16 13.5 19 16 19 21"/><path d="M15.5 4.5 C17.5 3 19.5 4 19.5 6"/>'),

  /* Kora */
  kora: i('<path d="M12 3 C12 8 16 12 21 12 C16 12 12 16 12 21 C12 16 8 12 3 12 C8 12 12 8 12 3 Z"/><circle cx="18.5" cy="5.5" r="1.3" fill="currentColor" stroke="none"/>', "0 0 24 24", 1.8),
  enviar: i('<path d="M4 12 L20 4 L14 20 L11.5 13 Z"/><path d="M11.5 13 L20 4"/>'),
  cerrar: i('<path d="M6 6 L18 18 M18 6 L6 18"/>')
} satisfies Record<string, DefIcono>;

export type NombreIcono = keyof typeof iconos;

/* Símbolos de síntomas — PROVISIONALES, se reemplazan por la simbología definida con Wilmer */
export const simbolos: Record<string, string> = {
  ardor: '<path d="M12 31 C8 25 16 22 12 14 M20 31 C16 23 24 20 20 9 M28 31 C24 25 32 22 28 14"/>',
  punzante: '<path d="M5 20 H25 M19 14 L25 20 L19 26"/><circle cx="32" cy="20" r="3"/>',
  fiebre: '<rect x="17" y="5" width="6" height="21" rx="3"/><circle cx="20" cy="30" r="5"/><path d="M20 13 V27"/>',
  mareo: '<path d="M20 20 a2 2 0 1 1 4 0 a5 5 0 1 1 -10 0 a8 8 0 1 1 16 0 a11 11 0 1 1 -22 0"/>',
  comezon: '<circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="22" cy="10" r="1.8" fill="currentColor"/><circle cx="29" cy="17" r="1.8" fill="currentColor"/><circle cx="15" cy="21" r="1.8" fill="currentColor"/><circle cx="25" cy="25" r="1.8" fill="currentColor"/><circle cx="11" cy="30" r="1.8" fill="currentColor"/><circle cx="20" cy="31" r="1.8" fill="currentColor"/><circle cx="30" cy="30" r="1.8" fill="currentColor"/>',
  hinchazon: '<circle cx="20" cy="20" r="5"/><circle cx="20" cy="20" r="10" stroke-dasharray="3 3"/><circle cx="20" cy="20" r="15" stroke-dasharray="2 4"/>'
};
