/* Cliente de la API de FastAPI con lectura offline-first.
   - GET: con señal pide al servidor y guarda la respuesta en IndexedDB;
          sin señal (o si el servidor no responde) usa la última copia guardada.
   - POST: solo con señal (las acciones offline van por la cola, ver cola.ts). */
import { idb } from "./db";

/* El módulo de Salud usa la misma API que ALUNA, en su propio espacio aislado: /api/v1/salud */
export const API_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api/v1").replace(/\/$/, "") + "/salud";
const TIEMPO_MAXIMO = 10000;

export class ErrorApi extends Error {
  constructor(public status: number, mensaje: string) { super(mensaje); }
}
export class SinConexion extends Error {
  constructor() { super("Sin conexión"); }
}

interface Opciones {
  token?: string | null;
  enLinea: boolean;
}

async function pedir<T>(metodo: string, ruta: string, cuerpo: unknown, { token, enLinea }: Opciones): Promise<T> {
  if (!enLinea) throw new SinConexion();
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO);
  let resp: Response;
  try {
    resp = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: control.signal
    });
  } catch {
    throw new SinConexion();
  } finally {
    clearTimeout(temporizador);
  }
  if (!resp.ok) {
    let detalle = `Error ${resp.status}`;
    try { const j = await resp.json(); if (typeof j.detail === "string") detalle = j.detail; } catch { /* sin cuerpo */ }
    throw new ErrorApi(resp.status, detalle);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}

/** GET con caché en IndexedDB. `clave` separa la caché por persona (la gobernanza también aplica offline). */
export async function obtener<T>(ruta: string, opciones: Opciones & { clave: string }): Promise<{ datos: T; deCache: boolean } | null> {
  const claveCache = `${opciones.clave}::${ruta}`;
  try {
    const datos = await pedir<T>("GET", ruta, undefined, opciones);
    void idb.guardar("cache", datos, claveCache);
    return { datos, deCache: false };
  } catch (e) {
    if (e instanceof ErrorApi && e.status === 401) throw e;
    const guardado = await idb.leer<T>("cache", claveCache);
    return guardado === undefined ? null : { datos: guardado, deCache: true };
  }
}

export const enviar = <T>(ruta: string, cuerpo: unknown, opciones: Opciones) => pedir<T>("POST", ruta, cuerpo, opciones);
