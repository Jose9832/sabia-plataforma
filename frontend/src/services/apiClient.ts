/**
 * Cliente HTTP de la API de ALUNA (FastAPI · /api/v1).
 *
 * - El JWT se guarda en localStorage y viaja en `Authorization: Bearer`.
 * - Si no hay conexión, las escrituras se guardan en una cola local (`aluna_outbox_v1`)
 *   y se reenvían solas al volver la señal. Cada recurso lleva un id generado en el
 *   cliente, así que el servidor no duplica nada si la misma petición llega dos veces.
 *
 * IMPORTANTE: ninguna clave de proveedores de IA va aquí. Las variables VITE_* son públicas.
 */
const BASE = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const CLAVE_TOKEN = 'aluna_token_v1';
const CLAVE_COLA = 'aluna_outbox_v1';
// El plan gratuito del servidor "duerme" tras 15 min sin visitas y tarda hasta ~50 s en despertar:
// esperamos lo suficiente para no cortar una petición que el servidor sí va a completar.
const TIEMPO_MAXIMO = 75000;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** La petición no llegó al servidor (sin internet o servidor apagado). */
export class SinConexionError extends Error {
  constructor() {
    super('Sin conexión con el servidor');
  }
}

export interface PeticionPendiente {
  id: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  createdAt: string;
  descripcion: string;
}

export const token = {
  leer: (): string | null => {
    try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
  },
  guardar: (t: string | null) => {
    try {
      if (t) localStorage.setItem(CLAVE_TOKEN, t);
      else localStorage.removeItem(CLAVE_TOKEN);
    } catch { /* almacenamiento bloqueado */ }
  }
};

export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), TIEMPO_MAXIMO);
  const t = token.leer();
  let resp: Response;
  try {
    resp = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: control.signal
    });
  } catch {
    throw new SinConexionError();
  } finally {
    clearTimeout(temporizador);
  }
  if (!resp.ok) {
    let detalle = `Error ${resp.status}`;
    try {
      const j = await resp.json();
      if (typeof j.detail === 'string') detalle = j.detail;
    } catch { /* sin cuerpo */ }
    throw new ApiError(resp.status, detalle);
  }
  if (resp.status === 204) return undefined as T;
  return resp.json() as Promise<T>;
}

/* ---------- Cola offline ---------- */
export const cola = {
  leer: (): PeticionPendiente[] => {
    try { return JSON.parse(localStorage.getItem(CLAVE_COLA) || '[]'); } catch { return []; }
  },
  guardar: (lista: PeticionPendiente[]) => {
    try { localStorage.setItem(CLAVE_COLA, JSON.stringify(lista)); } catch { /* lleno */ }
  },
  agregar(p: Omit<PeticionPendiente, 'id' | 'createdAt'>) {
    const lista = cola.leer();
    lista.push({ ...p, id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() });
    cola.guardar(lista);
  },
  /** Reenvía en orden. Se detiene en el primer fallo de red; descarta lo que el servidor rechaza. */
  async enviar(): Promise<{ enviadas: number; rechazadas: string[] }> {
    let enviadas = 0;
    const rechazadas: string[] = [];
    const lista = cola.leer();
    while (lista.length) {
      const p = lista[0];
      try {
        await api(p.method, p.path, p.body);
        enviadas++;
      } catch (e) {
        if (e instanceof SinConexionError) break;
        rechazadas.push(`${p.descripcion}: ${(e as Error).message}`);
      }
      lista.shift();
      cola.guardar(lista);
    }
    return { enviadas, rechazadas };
  }
};

export const nuevoId = (prefijo: string) =>
  `${prefijo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
