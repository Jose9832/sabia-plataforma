/* =========================================================
   ESTADO Y NAVEGACIÓN
   Un solo almacén (zustand) con la navegación por pantallas del prototipo,
   la sesión (JWT), el estado de la red, los datos de la API y la cola offline.
   ========================================================= */
import { create } from "zustand";
import { type IdComunidad, type Pantalla } from "../data/contenido";
import { respaldo } from "../data/respaldo";
import type {
  Alerta,
  Cuentas,
  Encuentro,
  HistoriaProducto,
  Investigacion,
  Lugar,
  MisRegistros,
  Planta,
  Podcast,
  Relato,
  Semilla,
  Sesion,
  Ventana
} from "../data/tipos";
import { ErrorApi, obtener } from "../lib/api";
import { agregarACola, enviarCola, leerCola, nuevoId, type Operacion, type TipoOperacion } from "../lib/cola";
import { guardarLocal, leerLocal } from "../lib/db";

export interface Nav {
  ventana: Ventana | null;
  pantalla: Pantalla;
  sub: string | null;
  detalle: string | number | null;
  /** cuenta cada navegación: vuelve a animar la entrada y sube al inicio de la página */
  n: number;
}

export interface Ui {
  filtroLugares: "ciudad" | "rurales" | "brigadas";
  hospitalAbierto: number | null;
  reporteTipo: string | null;
  formAlertaAbierto: boolean;
  mesElegido: number;
  parteSel: string | null;
  sintomaSel: string | null;
}

export interface Datos {
  relatos: Relato[];
  podcasts: Podcast[];
  lugares: Lugar[];
  plantas: Planta[];
  historias: HistoriaProducto[];
  encuentros: Encuentro[];
  investigaciones: Investigacion[];
  semillas: Semilla[];
  alertas: Alerta[];
  cuentas: Cuentas;
  registros: MisRegistros;
}

export type AccionKora =
  | { texto: string; tel: string }
  | { texto: string; pantalla: Pantalla; sub: string | null; detalle: string | number | null;
      donde: "adentro" | "afuera" | "cualquiera"; antes?: Partial<Ui> };

export interface MensajeKora { de: "kora" | "persona"; texto: string; acciones?: AccionKora[] }

interface Estado {
  nav: Nav;
  /** Espacio de comunidad que se está viendo (ruta /comunidad-…). */
  comunidadVista: IdComunidad | null;
  /** La plataforma lo registra: abre su pantalla de inicio de sesión. */
  pedirSesion: (() => void) | null;
  ui: Ui;
  sesion: Sesion | null;
  modoSinConexion: boolean;
  navegadorEnLinea: boolean;
  sincronizando: boolean;
  toast: { texto: string; n: number } | null;
  fraseMedico: string | null;
  datos: Datos;
  cola: Operacion[];
  kora: { abierto: boolean; mensajes: MensajeKora[]; saludado: boolean };

  ir: (pantalla: Pantalla, sub?: string | null, detalle?: string | number | null) => void;
  /** Abre el espacio de una comunidad: «adentro» si la persona es integrante verificada, «afuera» si no. */
  abrirEspacio: (comunidad: IdComunidad) => void;
  setPedirSesion: (fn: (() => void) | null) => void;
  setUi: (cambios: Partial<Ui>) => void;
  aviso: (texto: string) => void;
  mostrarTexto: (texto: string | null) => void;
  alternarRed: () => void;
  setNavegadorEnLinea: (v: boolean) => void;
  /** La sesión la gestiona ALUNA: el módulo solo la recibe (o null al cerrar sesión). */
  conectarSesion: (sesion: Sesion | null) => void;
  cargarDatos: () => Promise<void>;
  encolar: (tipo: TipoOperacion, datos: Record<string, unknown>, id?: string) => Operacion | null;
  sincronizar: (silencioso?: boolean) => Promise<void>;
  setCuentas: (fn: (c: Cuentas) => Cuentas) => void;
  setKora: (cambios: Partial<Estado["kora"]>) => void;
  iniciar: () => void;
}

const cuentasVacias = (cultivo = "Café"): Cuentas => ({ cultivo, cargas: null, precio: null, gastos: [] });
const claveCuentas = (s: Sesion | null) => (s ? `sabia-cuentas-u${s.usuario.id}` : "");
const TIPOS_CUENTAS: TipoOperacion[] = ["gasto", "gasto_borrar", "cuaderno", "cuentas_reiniciar"];

const datosIniciales = (): Datos => ({
  relatos: [], podcasts: [], lugares: respaldo.lugares, plantas: [], historias: respaldo.historias,
  encuentros: [], investigaciones: [], semillas: [], alertas: [], cuentas: cuentasVacias(),
  registros: { inscripciones: [], investigaciones: [], trueques: [] }
});

export const enLinea = (s: Pick<Estado, "modoSinConexion" | "navegadorEnLinea">) => !s.modoSinConexion && s.navegadorEnLinea;

let timerToast: ReturnType<typeof setTimeout> | undefined;
let iniciadoModulo = false;
let sincronizandoAhora = false;

export const useApp = create<Estado>()((set, get) => ({
  nav: { ventana: "afuera", pantalla: "inicio", sub: null, detalle: null, n: 0 },
  comunidadVista: null,
  pedirSesion: null,
  ui: {
    filtroLugares: "ciudad", hospitalAbierto: null, reporteTipo: null,
    formAlertaAbierto: false, mesElegido: new Date().getMonth(), parteSel: null, sintomaSel: null
  },
  sesion: null,
  modoSinConexion: false,
  navegadorEnLinea: typeof navigator === "undefined" ? true : navigator.onLine,
  sincronizando: false,
  toast: null,
  fraseMedico: null,
  datos: datosIniciales(),
  cola: [],
  kora: { abierto: false, mensajes: [], saludado: false },

  ir: (pantalla, sub = null, detalle = null) => {
    /* «acceso» y «puertas» vienen de la guía Ceiba: el inicio de sesión es de la plataforma */
    if (pantalla === "acceso") { get().pedirSesion?.(); return; }
    const destino: Pantalla = pantalla === "puertas" ? "inicio" : pantalla;
    set(s => ({ nav: { ...s.nav, pantalla: destino, sub, detalle, n: s.nav.n + 1 } }));
  },

  abrirEspacio: comunidad => {
    const u = get().sesion?.usuario;
    const ventana: Ventana = u?.comunidad === comunidad ? "adentro" : "afuera";
    set(s => ({ comunidadVista: comunidad, nav: { ventana, pantalla: "inicio", sub: null, detalle: null, n: s.nav.n + 1 } }));
    void get().cargarDatos();
  },

  setPedirSesion: fn => set({ pedirSesion: fn }),

  setUi: cambios => set(s => ({ ui: { ...s.ui, ...cambios } })),

  aviso: texto => {
    set(s => ({ toast: { texto, n: (s.toast?.n ?? 0) + 1 } }));
    clearTimeout(timerToast);
    timerToast = setTimeout(() => set({ toast: null }), 2800);
  },

  mostrarTexto: texto => set({ fraseMedico: texto }),

  alternarRed: () => {
    const sinConexion = !get().modoSinConexion;
    set({ modoSinConexion: sinConexion });
    if (enLinea(get())) {
      void get().sincronizar(false).then(() => get().cargarDatos());
    }
  },

  setNavegadorEnLinea: v => {
    set({ navegadorEnLinea: v });
    if (v && enLinea(get())) void get().sincronizar(false);
  },

  /* Descarga (o lee de IndexedDB sin señal) lo que corresponde al espacio y la comunidad actuales. */
  cargarDatos: async () => {
    const s = get();
    const u = s.sesion?.usuario;
    const adentro = s.nav.ventana === "adentro" && !!u;
    const clave = u ? `u${u.id}` : "publico";
    const opc = { token: s.sesion?.token, enLinea: enLinea(s), clave };
    const publico = { ...opc, clave: "publico" };
    const ventanaQ = adentro ? "adentro" : "afuera";
    const vista = s.comunidadVista;
    /* Desde afuera solo se ve lo que ESA comunidad decidió compartir */
    const deLaVista = <T extends { comunidad: IdComunidad }>(lista: T[]) =>
      !adentro && vista ? lista.filter(x => x.comunidad === vista) : lista;
    const visibles = <T extends { comunidad: IdComunidad; visibilidad: string }>(lista: T[]) =>
      adentro ? lista.filter(x => x.comunidad === u!.comunidad) : deLaVista(lista.filter(x => x.visibilidad === "afuera"));

    try {
      const [relatos, podcasts, lugares, historias, encuentros] = await Promise.all([
        obtener<Relato[]>(`/relatos?ventana=${ventanaQ}`, opc),
        obtener<Podcast[]>(`/podcasts?ventana=${ventanaQ}`, opc),
        obtener<Lugar[]>("/lugares", publico),
        obtener<HistoriaProducto[]>("/historias", publico),
        obtener<Encuentro[]>(`/encuentros?ventana=${ventanaQ}`, opc)
      ]);
      const nuevos: Partial<Datos> = {
        relatos: relatos ? deLaVista(relatos.datos) : visibles(respaldo.relatos),
        podcasts: deLaVista(podcasts?.datos ?? []),
        lugares: lugares?.datos ?? respaldo.lugares,
        historias: deLaVista(historias?.datos ?? respaldo.historias),
        encuentros: encuentros ? deLaVista(encuentros.datos) : visibles(respaldo.encuentros)
      };
      if (adentro && u) {
        const [investigaciones, plantas, registros] = await Promise.all([
          obtener<Investigacion[]>("/investigaciones", opc),
          obtener<Planta[]>(`/plantas?comunidad=${u.comunidad}`, opc),
          obtener<MisRegistros>("/mis-registros", opc)
        ]);
        nuevos.investigaciones = investigaciones?.datos ?? respaldo.investigaciones.filter(i => i.comunidades.includes(u.comunidad!));
        nuevos.plantas = plantas?.datos ?? respaldo.plantas.filter(p => p.comunidad === u.comunidad);
        nuevos.registros = registros?.datos ?? get().datos.registros;
        if (u.comunidad === "campesina") {
          const [semillas, alertas, cuentas] = await Promise.all([
            obtener<Semilla[]>("/semillas", opc),
            obtener<Alerta[]>("/alertas", opc),
            obtener<Cuentas>("/cuentas", opc)
          ]);
          nuevos.semillas = semillas?.datos ?? respaldo.semillas;
          nuevos.alertas = alertas?.datos ?? respaldo.alertas;
          /* El cuaderno se edita sin señal: solo se reemplaza si no hay cambios esperando en la cola. */
          const cambiosPendientes = get().cola.some(o => TIPOS_CUENTAS.includes(o.tipo));
          if (cuentas && !cuentas.deCache && !cambiosPendientes) {
            nuevos.cuentas = cuentas.datos;
            guardarLocal(claveCuentas(get().sesion), cuentas.datos);
          }
        }
      }
      set(st => ({ datos: { ...st.datos, ...nuevos } }));
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 401) {
        get().ir("inicio");
        get().aviso("Tu sesión terminó. Entra otra vez con tu cuenta.");
      }
    }
  },

  /* Todo lo que se crea pasa por la cola: con señal se envía de inmediato; sin señal, espera. */
  encolar: (tipo, datos, id = nuevoId()) => {
    const u = get().sesion?.usuario;
    if (!u) return null;
    const op: Operacion = { id, tipo, datos, creado_en: new Date().toISOString(), usuario_id: u.id };
    set(s => ({ cola: [...s.cola, op] }));
    void agregarACola(op).then(() => { if (enLinea(get())) void get().sincronizar(true); });
    return op;
  },

  sincronizar: async (silencioso = false) => {
    const s = get();
    if (sincronizandoAhora || !enLinea(s) || !s.sesion) return;
    const { token, usuario } = s.sesion;
    if (!s.cola.some(o => o.usuario_id === usuario.id)) return;
    sincronizandoAhora = true;
    set({ sincronizando: true });
    try {
      const { enviadas, errores } = await enviarCola(token, usuario.id);
      set({ cola: await leerCola() });
      if (!silencioso && enviadas > 0) get().aviso(`Hay señal: se enviaron ${enviadas} envío(s) guardado(s)`);
      if (errores.length) get().aviso(`No se pudo enviar: ${errores[0]}`);
      await get().cargarDatos();
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 401) {
        get().ir("inicio");
        get().aviso("Tu sesión terminó. Entra otra vez con tu cuenta.");
      }
      /* Sin conexión con el servidor: todo sigue guardado en la cola. */
    } finally {
      sincronizandoAhora = false;
      set({ sincronizando: false });
    }
  },

  setCuentas: fn => {
    set(s => {
      const cuentas = fn(s.datos.cuentas);
      guardarLocal(claveCuentas(s.sesion), cuentas);
      return { datos: { ...s.datos, cuentas } };
    });
  },

  setKora: cambios => set(s => ({ kora: { ...s.kora, ...cambios } })),

  conectarSesion: sesion => {
    const actual = get().sesion;
    if (actual?.token === sesion?.token && actual?.usuario.comunidad === sesion?.usuario.comunidad) return;
    /* «adentro» solo si la persona es integrante verificada de la comunidad que se está viendo */
    const ventanaPara = (vista: IdComunidad | null, c?: IdComunidad | null): Ventana => (vista && c === vista ? "adentro" : "afuera");
    if (!sesion) {
      set(s => ({ sesion: null, nav: { ventana: "afuera", pantalla: "inicio", sub: null, detalle: null, n: s.nav.n + 1 },
                  kora: { ...s.kora, saludado: false, mensajes: [] }, datos: datosIniciales() }));
      void get().cargarDatos();
      return;
    }
    const cambioDePersona = actual?.usuario.id !== sesion.usuario.id;
    set(s => ({
      sesion,
      nav: { ventana: ventanaPara(s.comunidadVista, sesion.usuario.comunidad), pantalla: "inicio", sub: null, detalle: null, n: s.nav.n + 1 },
      kora: cambioDePersona ? { ...s.kora, saludado: false, mensajes: [] } : s.kora,
      datos: { ...s.datos, cuentas: leerLocal(claveCuentas(sesion), cuentasVacias()) }
    }));
    void get().cargarDatos().then(() => get().sincronizar(true));
  },

  /* Arranque: recupera la cola guardada y escucha los cambios de red (una sola vez). */
  iniciar: () => {
    if (iniciadoModulo) return;
    iniciadoModulo = true;
    void leerCola().then(cola => {
      set({ cola });
      void get().cargarDatos().then(() => get().sincronizar(true));
    });
    window.addEventListener("online", () => get().setNavegadorEnLinea(true));
    window.addEventListener("offline", () => get().setNavegadorEnLinea(false));
    /* Reintento periódico por si el servidor estaba caído aunque hubiera señal */
    setInterval(() => { if (get().cola.length) void get().sincronizar(true); }, 30000);
  }
}));

/* ---------- Selectores de conveniencia ---------- */
export const useEnLinea = () => useApp(s => enLinea(s));
export const useSesion = () => useApp(s => s.sesion);
export const useComunidad = () => useApp(s => s.sesion?.usuario.comunidad ?? null);

/** Operaciones de la cola de la persona actual, de un tipo dado. */
export const operacionesPendientes = (cola: Operacion[], tipo: TipoOperacion, usuarioId?: number | string) =>
  cola.filter(o => o.tipo === tipo && o.usuario_id === usuarioId);
