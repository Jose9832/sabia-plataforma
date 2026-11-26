import { TarjetaModulo } from "../components/comunes";
import { Icono, IconoComunidad } from "../components/icons/Icono";
import type { NombreIcono } from "../components/icons/iconos";
import { comunidades, type Pantalla } from "../data/contenido";
import { useApp } from "../state/store";

type Tarjeta = [Pantalla & NombreIcono, string, string, string, string];

/* ---------- INICIO DEL ESPACIO DE CADA COMUNIDAD ---------- */
export function Inicio() {
  const ventana = useApp(s => s.nav.ventana);
  const sesion = useApp(s => s.sesion);
  const ir = useApp(s => s.ir);
  const vista = useApp(s => s.comunidadVista);
  const adentro = ventana === "adentro";
  const com = sesion?.usuario.comunidad;
  const c = adentro && com ? comunidades[com] : null;
  const esAfro = com === "afro";

  const todas: Tarjeta[] = adentro && com === "campesina" ? [
    ["salud", "Salud", "Primeros auxilios y plantas de la vereda", "#F3DCD2", "#A0522D"],
    ["finca", "Mi finca", "Semillas, siembra, alertas y cuentas", "#F3ECD1", "#6E5A12"],
    ["memoria", "Memoria", "Voces y saberes de la vereda", "#E6E0F0", "#5E5280"],
    ["ayuda", "Ayuda", "Puestos de salud, vías y trámites del campo", "#DCE6F0", "#3B5F7D"]
  ] : adentro ? [
    ["salud", "Salud", esAfro ? "Partería, plantas y salud comunitaria" : "Decir qué me duele al médico", "#F3DCD2", "#A0522D"],
    ["participa", "Participa", esAfro ? "Encuentros, investigación e historia afro" : "Conversatorios, encuentros e investigación", "#E2ECE0", "#2F5939"],
    ["memoria", "Memoria", "Voces y podcasts de mi comunidad", "#E6E0F0", "#5E5280"],
    ["ayuda", "Ayuda", esAfro ? "Derechos y trámites" : "Hospitales, derechos y trámites", "#DCE6F0", "#3B5F7D"]
  ] : [
    ["memoria", "Memoria", "Voces que las comunidades comparten", "#E6E0F0", "#5E5280"],
    ["historias", "Historias", "Quién hace lo que hacemos", "#F1E3CF", "#8B5E3C"],
    ["aprende", "Aprende", "Historia afro y cómo frenar el racismo", "#F7E2D9", "#8A3B22"]
  ];
  /* «Aprende» (historia afro y antirracismo) es del espacio afro; en los demás no se muestra */
  const tarjetas = todas.filter(t => t[0] !== "aprende" || adentro || vista === "afro");

  return (
    <>
      <div className="saludo">
        <h2>{adentro && sesion ? `Hola, ${sesion.usuario.nombre.split(" ")[0]}` : "Bienvenido"}</h2>
        <p>{adentro ? "¿Qué quieres hacer hoy?" : "Conoce y respeta las culturas del Magdalena"}</p>
      </div>
      {c && com && (
        <div className="chip-comunidad" style={{ background: c.fondo, color: c.color }}>
          <IconoComunidad comunidad={com} tam={18} /> {c.titulo}
        </div>
      )}
      <div className="modulos">
        {tarjetas.map(([id, nombre, desc, fondo, color]) => (
          <TarjetaModulo key={id} icono={<Icono nombre={id} />} fondo={fondo} color={color}
            titulo={nombre} desc={desc} voz={`${nombre}. ${desc}`} onClick={() => ir(id)} />
        ))}
      </div>
      <div className={`nota-gobernanza${adentro ? " adentro" : ""}`} style={{ marginTop: 18 }}>
        {adentro
          ? <>Lo marcado <b>Solo comunidad</b> no se ve desde afuera. Cada comunidad decide qué comparte.</>
          : "Aquí solo aparece lo que cada comunidad decidió compartir."}
      </div>
    </>
  );
}
