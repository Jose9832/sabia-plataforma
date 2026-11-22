/* =========================================================
   VOZ (Web Speech API) — lógica del prototipo sin cambios:
   lectura en voz alta frase por frase y elección de la voz más humana.
   ========================================================= */
import { guardarLocal, leerLocal } from "./db";

let timerHabla: ReturnType<typeof setTimeout> | undefined;

export function hablar(texto: string | null | undefined, boton?: HTMLElement | null) {
  if (!texto) return;
  document.querySelectorAll(".hablando").forEach(b => b.classList.remove("hablando"));
  clearTimeout(timerHabla);
  const inicio = Date.now();
  /* el pulso dura al menos 1,2 s para que siempre se note que la app respondió */
  const fin = () => { if (boton) setTimeout(() => boton.classList.remove("hablando"), Math.max(0, 1200 - (Date.now() - inicio))); };
  if (boton) { boton.classList.add("hablando"); timerHabla = setTimeout(fin, Math.max(2500, texto.length * 90)); }
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  /* Se habla frase por frase: suena más natural (pausas reales) y evita que
     algunos navegadores corten los textos largos. */
  const frases = texto.match(/[^.!?¿¡]+[.!?]*|[¿¡][^?!]+[?!]/g) || [texto];
  frases.map(f => f.trim()).filter(Boolean).forEach((frase, i, todas) => {
    const voz = new SpeechSynthesisUtterance(frase);
    if (vozElegida) { voz.voice = vozElegida; voz.lang = vozElegida.lang; } else voz.lang = "es-CO";
    voz.rate = /natural|neural|online|google/i.test(vozElegida ? vozElegida.name : "") ? 1 : 0.92;
    voz.pitch = 1;
    if (i === todas.length - 1) { voz.onend = fin; voz.onerror = fin; }
    speechSynthesis.speak(voz);
  });
}

/* ====== VOZ MÁS HUMANA ======
   Elige automáticamente la voz más natural disponible en el dispositivo:
   1) voces neuronales ("Natural"/"Online") de Microsoft Edge, p. ej. Salomé o Gonzalo (Colombia)
   2) voces de Google en español (Chrome / Android)
   3) cualquier voz en español, prefiriendo la de Colombia */
let vocesEspanol: SpeechSynthesisVoice[] = [];
let vozElegida: SpeechSynthesisVoice | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach(f => f());

function puntajeVoz(v: SpeechSynthesisVoice) {
  const n = v.name.toLowerCase(), l = v.lang.toLowerCase();
  let p = 0;
  if (/natural|neural/.test(n)) p += 60;
  if (/online/.test(n)) p += 20;
  if (/google/.test(n)) p += 35;
  if (l === "es-co") p += 25; else if (/es-(mx|us|419)/.test(l)) p += 12; else if (l === "es-es") p += 6;
  if (/gonzalo/.test(n)) p += 500;          /* voz elegida por el equipo: Gonzalo (Colombia) */
  if (/salom|dalia|jorge|elena|paloma/.test(n)) p += 5;
  if (!v.localService) p += 5;
  return p;
}

function cargarVoces() {
  if (!("speechSynthesis" in window)) return;
  vocesEspanol = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang)).sort((a, b) => puntajeVoz(b) - puntajeVoz(a));
  const guardada = leerLocal<string | null>("sabia-voz-v2", null);
  vozElegida = vocesEspanol.find(v => v.name === guardada) || vocesEspanol[0] || null;
  avisar();
}

export const nombreCortoVoz = () => vozElegida
  ? vozElegida.name.replace(/Microsoft |Online |\(Natural\)|- Spanish|Spanish|\(.*?\)/g, "").replace(/\s+/g, " ").trim() + ` (${vozElegida.lang})`
  : "Voz del sistema";

/** Pasa a la siguiente voz en español. Devuelve false si no hay otras voces. */
export function cambiarVoz(boton: HTMLElement): boolean {
  if (!vocesEspanol.length) return false;
  const i = vozElegida ? vocesEspanol.indexOf(vozElegida) : -1;
  vozElegida = vocesEspanol[(i + 1) % vocesEspanol.length];
  guardarLocal("sabia-voz-v2", vozElegida.name);
  avisar();
  hablar("Hola. Así suena esta voz en SABIA.", boton);
  return true;
}

export function suscribirVoz(fn: () => void) {
  oyentes.add(fn);
  return () => { oyentes.delete(fn); };
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cargarVoces();
  speechSynthesis.onvoiceschanged = cargarVoces;
}
