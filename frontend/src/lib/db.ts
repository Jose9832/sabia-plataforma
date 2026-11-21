/* IndexedDB sin dependencias.
   - "cache": última respuesta de cada consulta GET a la API (lectura sin señal).
   - "cola":  operaciones creadas sin señal que esperan POST /api/sync. */
const NOMBRE_DB = "sabia";
const VERSION = 1;
export type Almacen = "cache" | "cola";

let conexion: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (conexion) return conexion;
  conexion = new Promise((resolver, rechazar) => {
    if (!("indexedDB" in globalThis)) { rechazar(new Error("IndexedDB no disponible")); return; }
    const pet = indexedDB.open(NOMBRE_DB, VERSION);
    pet.onupgradeneeded = () => {
      const db = pet.result;
      if (!db.objectStoreNames.contains("cache")) db.createObjectStore("cache");
      if (!db.objectStoreNames.contains("cola")) db.createObjectStore("cola", { keyPath: "id" });
    };
    pet.onsuccess = () => resolver(pet.result);
    pet.onerror = () => rechazar(pet.error);
  });
  return conexion;
}

function solicitud<T>(almacen: Almacen, modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return abrir().then(db => new Promise<T>((resolver, rechazar) => {
    const tx = db.transaction(almacen, modo);
    const pet = fn(tx.objectStore(almacen));
    pet.onsuccess = () => resolver(pet.result as T);
    pet.onerror = () => rechazar(pet.error);
  }));
}

export const idb = {
  leer: <T>(almacen: Almacen, clave: IDBValidKey) =>
    solicitud<T | undefined>(almacen, "readonly", s => s.get(clave)).catch(() => undefined),
  todos: <T>(almacen: Almacen) =>
    solicitud<T[]>(almacen, "readonly", s => s.getAll()).catch(() => [] as T[]),
  guardar: (almacen: Almacen, valor: unknown, clave?: IDBValidKey) =>
    solicitud(almacen, "readwrite", s => (clave === undefined ? s.put(valor) : s.put(valor, clave))).catch(() => undefined),
  borrar: (almacen: Almacen, clave: IDBValidKey) =>
    solicitud(almacen, "readwrite", s => s.delete(clave)).catch(() => undefined)
};

/* Persistencia sencilla en localStorage (preferencias y sesión). */
export const leerLocal = <T>(clave: string, defecto: T): T => {
  try { const v = JSON.parse(localStorage.getItem(clave) ?? "null"); return (v ?? defecto) as T; } catch { return defecto; }
};
export const guardarLocal = (clave: string, valor: unknown) => {
  try {
    if (valor === null || valor === undefined) localStorage.removeItem(clave);
    else localStorage.setItem(clave, JSON.stringify(valor));
  } catch { /* almacenamiento lleno o bloqueado */ }
};
