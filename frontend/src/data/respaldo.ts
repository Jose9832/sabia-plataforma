/* Respaldo offline del primer uso.
   Si la app se abre sin señal y todavía no ha descargado nada del servidor,
   muestra los mismos datos de ejemplo con los que se siembra la base de datos
   (datos/semilla.json, compartido con backend/app/seed.py). */
import {
  alertas as alertasSemilla,
  encuentros as encuentrosSemilla,
  historias as historiasSemilla,
  investigaciones as investigacionesSemilla,
  lugares as lugaresSemilla,
  plantas as plantasSemilla,
  relatos as relatosSemilla,
  semillas as semillasSemilla
} from "../../../datos/semilla.json";
import type {
  Alerta,
  Encuentro,
  HistoriaProducto,
  Investigacion,
  Lugar,
  Planta,
  Relato,
  Semilla
} from "./tipos";

export const respaldo = {
  relatos: relatosSemilla as Relato[],
  lugares: lugaresSemilla as Lugar[],
  plantas: plantasSemilla as Planta[],
  historias: historiasSemilla.map(h => ({ ...h, visibilidad: "afuera" })) as HistoriaProducto[],
  encuentros: encuentrosSemilla as Encuentro[],
  investigaciones: investigacionesSemilla as Investigacion[],
  semillas: semillasSemilla as Semilla[],
  alertas: alertasSemilla.map(a => ({ ...a, foto: null })) as Alerta[]
};
