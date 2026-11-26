/* Cola de sincronización offline (IndexedDB).
   Todo lo que la persona crea —alertas, reportes, trueques, gastos, inscripciones…—
   se guarda primero aquí con un UUID. Con señal se envía en bloque a POST /api/sync;
   el servidor usa ese UUID para no duplicar nada si el envío se repite. */
import { enviar } from "./api";
import { idb } from "./db";

export type TipoOperacion =
  | "podcast" | "planta" | "semilla" | "trueque" | "alerta" | "reporte"
  | "gasto" | "gasto_borrar" | "cuaderno" | "cuentas_reiniciar"
  | "inscripcion" | "investigacion";

export interface Operacion {
  id: string;
  tipo: TipoOperacion;
  datos: Record<string, unknown>;
  creado_en: string;
  usuario_id: number | string;
}

interface ResultadoSync { id: string; ok: boolean; duplicado: boolean; error: string | null }
interface RespuestaSync { resultados: ResultadoSync[]; procesadas: number; fallidas: number }

export const nuevoId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));

export async function leerCola(): Promise<Operacion[]> {
  const ops = await idb.todos<Operacion>("cola");
  return ops.sort((a, b) => a.creado_en.localeCompare(b.creado_en));
}

export async function agregarACola(op: Operacion): Promise<void> {
  await idb.guardar("cola", op);
}

/** Envía las operaciones de la persona. Devuelve cuántas se enviaron y los errores que devolvió el servidor. */
export async function enviarCola(token: string, usuarioId: number | string): Promise<{ enviadas: number; errores: string[] }> {
  const ops = (await leerCola()).filter(o => o.usuario_id === usuarioId);
  if (!ops.length) return { enviadas: 0, errores: [] };
  const resp = await enviar<RespuestaSync>(
    "/sync",
    { operaciones: ops.map(({ id, tipo, datos, creado_en }) => ({ id, tipo, datos, creado_en })) },
    { token, enLinea: true }
  );
  const errores: string[] = [];
  for (const r of resp.resultados) {
    // Las fallidas también salen de la cola: el servidor ya dijo por qué no las acepta.
    await idb.borrar("cola", r.id);
    if (!r.ok && r.error) errores.push(r.error);
  }
  return { enviadas: resp.procesadas, errores };
}
