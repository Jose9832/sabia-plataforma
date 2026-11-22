/**
 * Cliente HTTP de la API de ALUNA (FastAPI · /api/v1).
 *
 * - El JWT se guarda en localStorage y viaja en `Authorization: Bearer`.
 * - Si no hay conexión, las escrituras se guardan en una cola local (`aluna_outbox_v1`)
 *   y se reenvían solas al volver la señal. Cada recurso lleva un id generado en el
 *   cliente, así que el servidor no duplica nada si la misma petición llega dos veces.
 * - Cada acción de la cola queda a nombre de quien la hizo: solo se envía con la sesión
 *   de esa misma persona (en un equipo compartido nadie envía acciones ajenas).
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
  /** Dueño de la acción (el `sub` del token con el que se hizo). */
  usuarioId: string;
}

/** Identificador de la persona dueña del token actual (sin validar la firma: eso lo hace el servidor). */
export function usuarioDelToken(t: string | null = token.leer()): string | null {
  if (!t) return null;
  try {
    const carga = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const datos = JSON.parse(atob(carga.padEnd(carga.length + ((4 - (carga.length % 4)) % 4), '=')));
    return typeof datos.sub === 'string' ? datos.sub : null;
  } catch {
    return null;
  }
}

/** Errores pasajeros: la acción se conserva y se reintenta más tarde. */
const esPasajero = (e: unknown) =>
  e instanceof SinConexionError || (e instanceof ApiError && (e.status >= 500 || e.status === 408 || e.status === 429));

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
export interface ResultadoEnvio {
  enviadas: number;
  rechazadas: string[];
  /** El servidor pidió volver a iniciar sesión: las acciones siguen guardadas. */
  sesionVencida: boolean;
}

export const cola = {
  leer: (): PeticionPendiente[] => {
    try {
      const lista = JSON.parse(localStorage.getItem(CLAVE_COLA) || '[]') as PeticionPendiente[];
      // Las acciones de versiones anteriores no tienen dueño: no se pueden enviar con seguridad.
      return Array.isArray(lista) ? lista.filter(p => p && typeof p.usuarioId === 'string') : [];
    } catch { return []; }
  },
  guardar: (lista: PeticionPendiente[]) => {
    try { localStorage.setItem(CLAVE_COLA, JSON.stringify(lista)); } catch { /* lleno */ }
  },
  /** Acciones pendientes de una persona (por defecto, la de la sesión actual). */
  de: (usuarioId: string | null = usuarioDelToken()): PeticionPendiente[] =>
    usuarioId ? cola.leer().filter(p => p.usuarioId === usuarioId) : [],
  /** Guarda la acción a nombre de la persona con sesión. Sin sesión no se encola. */
  agregar(p: Omit<PeticionPendiente, 'id' | 'createdAt' | 'usuarioId'>): boolean {
    const usuarioId = usuarioDelToken();
    if (!usuarioId) return false;
    const lista = cola.leer();
    lista.push({ ...p, usuarioId, id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() });
    cola.guardar(lista);
    return true;
  },
  /**
   * Reenvía en orden solo las acciones de la persona con sesión.
   * - Sin red, error del servidor (5xx) o demasiados intentos: se detiene y conserva todo.
   * - Sesión vencida (401): se detiene y conserva todo para enviarlo al volver a entrar.
   * - Rechazo de negocio (403, 404, 409, 422…): se descarta y se informa.
   */
  async enviar(): Promise<ResultadoEnvio> {
    const usuarioId = usuarioDelToken();
    const resultado: ResultadoEnvio = { enviadas: 0, rechazadas: [], sesionVencida: false };
    if (!usuarioId) return resultado;
    for (const p of cola.de(usuarioId)) {
      try {
        await api(p.method, p.path, p.body);
        resultado.enviadas++;
      } catch (e) {
        if (esPasajero(e)) break;
        if (e instanceof ApiError && e.status === 401) {
          resultado.sesionVencida = true;
          break;
        }
        resultado.rechazadas.push(`${p.descripcion}: ${(e as Error).message}`);
      }
      // Se relee la cola por si otra pestaña la cambió mientras se enviaba.
      cola.guardar(cola.leer().filter(x => x.id !== p.id));
    }
    return resultado;
  }
};

export const nuevoId = (prefijo: string) =>
  `${prefijo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
