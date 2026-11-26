/* Utilidades del prototipo: dictado por voz, montos, fase lunar y enlaces de podcast. */

/* ---------- Dictado (SpeechRecognition) ---------- */
/** Lo que usa la app de la Web Speech API (no todos los navegadores traen sus tipos). */
export interface ResultadoVoz { results: { 0: { 0: { transcript: string } } } }
export interface Reconocedor {
  lang: string;
  interimResults: boolean;
  onresult: ((e: ResultadoVoz) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type VentanaConVoz = Window & {
  SpeechRecognition?: new () => Reconocedor;
  webkitSpeechRecognition?: new () => Reconocedor;
};
const ventana = window as VentanaConVoz;
export const Reconocer: (new () => Reconocedor) | undefined =
  ventana.SpeechRecognition || ventana.webkitSpeechRecognition;

export function crearReconocedor(): Reconocedor | null {
  if (!Reconocer) return null;
  const r = new Reconocer();
  r.lang = "es-CO";
  r.interimResults = false;
  return r;
}

/* ---------- Búsqueda ---------- */
/** Minúsculas y sin tildes: «Estómago» coincide con «estomago». */
export const normalizar = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ---------- Montos ---------- */
export const pesos = (n: number) => "$" + Math.round(n || 0).toLocaleString("es-CO");

/** Dictado por voz del valor ("cincuenta mil", "50000", "1 millón") */
export function interpretarMonto(t: string) {
  t = t.toLowerCase().replace(/\./g, "").replace(/,/g, ".");
  const palabras: Record<string, number> = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, veinte: 20,
    treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200,
    trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900 };
  let total = 0, actual = 0;
  for (const p of t.split(/\s+|y/).filter(Boolean)) {
    if (/^\d+(\.\d+)?$/.test(p)) actual += Number(p);
    else if (palabras[p] !== undefined) actual += palabras[p];
    else if (p.startsWith("mill")) { total += (actual || 1) * 1000000; actual = 0; }
    else if (p === "mil") { total += (actual || 1) * 1000; actual = 0; }
  }
  return Math.round(total + actual);
}

/* ---------- Luna ---------- */
export function faseLunar(fecha = new Date()) {
  const ciclo = 29.530588853;
  const referencia = Date.UTC(2000, 0, 6, 18, 14);           /* luna nueva conocida */
  const edad = (((fecha.getTime() - referencia) / 86400000) % ciclo + ciclo) % ciclo;
  const nombres: [number, string][] = [
    [1.85, "Luna nueva"], [5.54, "Luna creciente"], [9.23, "Cuarto creciente"], [12.92, "Gibosa creciente"],
    [16.61, "Luna llena"], [20.30, "Gibosa menguante"], [23.99, "Cuarto menguante"], [27.68, "Luna menguante"], [99, "Luna nueva"]
  ];
  const nombre = nombres.find(([lim]) => edad < lim)![1];
  const iluminada = (1 - Math.cos(2 * Math.PI * edad / ciclo)) / 2;
  return { edad, nombre, iluminada, creciente: edad < ciclo / 2 };
}

/* ---------- Relatos ---------- */
export const aSeg = (t: string) => { const [m, s] = t.split(":").map(Number); return m * 60 + s; };
export const aTexto = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ---------- Podcasts: reconoce enlaces de YouTube y Spotify ---------- */
export function analizarEnlace(url: string) {
  url = url.trim();
  let m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return { plataforma: "youtube" as const, embed: `https://www.youtube-nocookie.com/embed/${m[1]}`, abrir: `https://www.youtube.com/watch?v=${m[1]}` };
  m = url.match(/youtube\.com\/.*[?&]list=([\w-]+)/);
  if (m) return { plataforma: "youtube" as const, embed: `https://www.youtube-nocookie.com/embed/videoseries?list=${m[1]}`, abrir: `https://www.youtube.com/playlist?list=${m[1]}` };
  m = url.match(/open\.spotify\.com\/(?:intl-[\w-]+\/)?(episode|show|track|playlist|album)\/([A-Za-z0-9]+)/);
  if (m) return { plataforma: "spotify" as const, embed: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, abrir: `https://open.spotify.com/${m[1]}/${m[2]}` };
  return null;
}

/* ---------- QR de ejemplo (historias) ---------- */
export function cuadrosQr(semilla: number) {
  const n = 21; let r = semilla * 9301 + 49297;
  const cuadros: [number, number][] = [];
  const azar = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const enEsquina = (x: number, y: number) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++)
    if (!enEsquina(x, y) && azar() > 0.5) cuadros.push([x, y]);
  return cuadros;
}

export const consultaMapa = (h: { nombre: string; direccion: string }) =>
  encodeURIComponent(`${h.nombre}, ${h.direccion}, Santa Marta, Magdalena, Colombia`);

export const horaActual = () => { const d = new Date(); return `Hoy, ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };
