/* Tipos de datos que llegan de la API (FastAPI) y se guardan en IndexedDB. */
export type IdComunidad = "indigena" | "afro" | "campesina";
export type Visibilidad = "adentro" | "afuera";
export type Ventana = "adentro" | "afuera";

export interface Usuario {
  id: number;
  numero_identificacion: string;
  nombre: string;
  comunidad: IdComunidad;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Relato {
  id: number;
  comunidad: IdComunidad;
  titulo: string;
  sabedor: string;
  duracion: string;
  visibilidad: Visibilidad;
  youtube: string;
  spotify: string;
}

export interface Podcast {
  id: number | string;
  client_id?: string | null;
  comunidad: IdComunidad;
  titulo: string;
  plataforma: "youtube" | "spotify";
  embed: string;
  abrir: string;
  visibilidad: Visibilidad;
  pendiente?: boolean;
}

export interface Lugar {
  id: number;
  categoria: "hospital" | "rural";
  nombre: string;
  tipo: string;
  direccion: string;
}

export interface Planta {
  id?: number;
  slug: string;
  comunidad: IdComunidad;
  nombre: string;
  cientifico: string | null;
  color: string;
  uso: string;
  preparacion: string;
  precaucion: string;
  hospital: string;
}

export interface HistoriaProducto {
  id: number;
  nombre: string;
  color: string;
  autor: string;
  comunidad: IdComunidad;
  material: string;
  historia: string;
  contacto_autorizado: boolean;
  whatsapp: string;
  visibilidad?: Visibilidad;
}

export interface Encuentro {
  id: number;
  comunidad: IdComunidad;
  tipo: string;
  titulo: string;
  fecha: string;
  hora: string;
  lugar: string;
  orienta: string;
  descripcion: string;
  visibilidad: Visibilidad;
}

export interface Investigacion {
  id: number;
  comunidades: IdComunidad[];
  titulo: string;
  grupo: string;
  estado: string;
  busca: string;
  participar: string[];
  devolucion: string;
}

export interface Semilla {
  id: number | string;
  client_id?: string | null;
  tipo: string;
  variedad: string;
  cantidad: string;
  busca: string;
  familia: string;
  vereda: string;
  propia?: boolean;
  pendiente?: boolean;
}

export interface Alerta {
  id: number | string;
  client_id?: string | null;
  tipo: string;
  lugar: string;
  nota: string;
  foto: string | null;
  hora: string;
  autor: string;
  pendiente?: boolean;
}

export interface Gasto {
  client_id: string;
  cultivo: string;
  tipo: string;
  monto: number;
}

export interface Cuentas {
  cultivo: string;
  cargas: number | null;
  precio: number | null;
  gastos: Gasto[];
}

export interface MisRegistros {
  inscripciones: number[];
  investigaciones: number[];
  trueques: number[];
}
