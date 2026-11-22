/* =========================================================================
   KORA · guía de SABIA
   Asistente 100 % sin internet: entiende preguntas por palabras clave,
   busca en los datos de la app y responde con botones que llevan a la sección.
   (Misma base de conocimiento del prototipo.)
   ========================================================================= */
import {
  calendarioCultivos,
  comunidades,
  historiaAfro,
  mesesLargos,
  primerosAuxilios,
  tramites,
  type IdComunidad,
  type Pantalla
} from "../data/contenido";
import type { Sesion, Ventana } from "../data/tipos";
import type { AccionKora, Datos, Ui } from "../state/store";
import { faseLunar, pesos } from "./utilidades";

export type ContextoKora = "inicio" | "afuera" | IdComunidad;

export interface CtxKora {
  contexto: ContextoKora;
  sesion: Sesion | null;
  ventana: Ventana | null;
  datos: Datos;
}

interface Respuesta { texto: string; acciones?: AccionKora[] }

export const sinTildes = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:]/g, " ");

export const contextoKora = (ventana: Ventana | null, sesion: Sesion | null): ContextoKora => {
  if (ventana === "adentro" && sesion?.usuario.comunidad) return sesion.usuario.comunidad;   /* indigena | afro | campesina */
  if (ventana === "afuera") return "afuera";
  return "inicio";
};

export const etiquetasContexto: Record<ContextoKora, string> = {
  inicio: "Bienvenida", afuera: "Conocer", indigena: "Comunidad indígena", afro: "Comunidad afro", campesina: "Comunidad campesina"
};

export const chipsKora: Record<ContextoKora, string[]> = {
  inicio: ["¿Qué es SABIA?", "¿Qué puerta elijo?", "¿Funciona sin internet?", "¿Cómo creo mi cuenta?"],
  afuera: ["¿Qué es SABIA?", "Historia afro", "¿Qué es un microrracismo?", "Encuentros abiertos", "Productos de las comunidades"],
  indigena: ["Me duele algo", "Hospitales en Santa Marta", "Conversatorios", "Reportar un problema", "Relatos de los mayores"],
  afro: ["Señales de alarma en el embarazo", "Plantas para la tos", "Anemia falciforme", "Reportar discriminación", "Historia afro", "Capacitaciones"],
  campesina: ["Me mordió una culebra", "¿Qué siembro este mes?", "Dar una alerta", "Mis cuentas", "Puestos de salud rurales", "Formalizar mi tierra"]
};

/* ---------- Acciones (botón grande que lleva a la sección) ---------- */
/* donde: "adentro" (necesita cuenta), "afuera" (puerta Conocer) o "cualquiera" */
const accion = (texto: string, pantalla: Pantalla, sub: string | null = null, detalle: string | number | null = null,
  donde: "adentro" | "afuera" | "cualquiera" = "adentro", antes?: Partial<Ui>): AccionKora => ({ texto, pantalla, sub, detalle, donde, antes });
const llamar = (texto: string, numero: string): AccionKora => ({ texto, tel: numero });

interface Intencion {
  claves: string[];
  contextos?: ContextoKora[];
  prioridad?: number;
  responder: (ctx: CtxKora) => Respuesta;
}

const nombre = (ctx: CtxKora) => (ctx.sesion ? ", " + ctx.sesion.usuario.nombre.split(" ")[0] : "");
const adentroCon = (ctx: CtxKora) => ctx.ventana === "adentro" && !!ctx.sesion;

/* ---------- Base de conocimiento (intenciones) ---------- */
const intenciones: Intencion[] = [
  { claves: ["hola", "buenas", "buenos dias", "buenas tardes", "quien eres", "como te llamas"],
    responder: ctx => ({ texto: `¡Hola${nombre(ctx)}! Soy Ceiba, tu guía de salud en SABIA. Pregúntame lo que necesites o toca una de las preguntas de abajo.` }) },
  { claves: ["que es sabia", "para que sirve", "que hace esta app", "que es esto", "sabia"],
    responder: () => ({ texto: "SABIA es una herramienta para que las comunidades indígenas, afrodescendientes y campesinas guarden y compartan sus saberes, cuiden su salud y conozcan sus derechos. Funciona sin internet y cada comunidad decide qué se comparte afuera." }) },
  { claves: ["puerta", "que elijo", "diferencia", "mi comunidad", "entrar"], contextos: ["inicio", "afuera"],
    responder: () => ({ texto: "Hay dos puertas. «Mi comunidad» es para los miembros de las comunidades: entras con tu número de identificación y contraseña. «Conocer» es para visitantes: muestra lo que las comunidades deciden compartir.",
      acciones: [accion("Entrar a Mi comunidad", "acceso", null, null, "cualquiera"), accion("Ir a Conocer", "inicio", null, null, "afuera")] }) },
  { claves: ["internet", "sin senal", "no hay senal", " senal ", "sin conexion", "offline", "datos moviles", "wifi"],
    responder: () => ({ texto: "Sí, SABIA funciona sin internet. Lo que envíes sin señal (reportes, alertas o inscripciones) queda guardado en el teléfono y se envía solo cuando vuelve la conexión." }) },
  { claves: ["cuenta", "registr", "contrasena", "clave", "crear cuenta", "iniciar sesion", "ingresar"], contextos: ["inicio", "afuera"],
    responder: () => ({ texto: "Toca «Mi comunidad», elige tu comunidad y luego «Regístrate». Solo necesitas tu nombre, tu número de identificación y una contraseña.",
      acciones: [accion("Crear mi cuenta", "acceso", null, null, "cualquiera")] }) },
  { claves: ["voz", "leer", "no se leer", "escuchar", "sonido", "audio"],
    responder: () => ({ texto: "Toca el botón con el parlante en cualquier tarjeta y la app te lo lee en voz alta. Aquí conmigo también puedes tocar el micrófono y hacerme la pregunta hablando." }) },
  { claves: ["salir", "cerrar sesion", "cambiar de puerta", "cambiar puerta"],
    responder: () => ({ texto: "Puedes salir con el botón de arriba, junto al nombre de tu comunidad.", acciones: [accion("Volver al inicio de SABIA", "puertas", null, null, "cualquiera")] }) },

  /* Emergencias: siempre disponibles */
  { claves: ["emergencia", "urgencia", "ambulancia", "123", "grave", "accidente"],
    responder: () => ({ texto: "Si es una emergencia, llama ya al 123, la línea nacional de emergencias. Es gratuita y atiende las 24 horas.", acciones: [llamar("Llamar al 123", "123")] }) },

  /* Salud */
  { claves: ["hospital", "clinica", "donde me atienden", "puesto de salud", "puestos de salud", "centro de salud", "medico cerca", "rurales"],
    responder: ctx => {
      const c = ctx.contexto;
      if (c === "afro") return { texto: "En una emergencia llama al 123. En Salud → Ruta de salud y derechos encuentras cómo exigir atención digna, y en Sabedoras y agentes, a las personas de confianza de tu comunidad.",
        acciones: [llamar("Llamar al 123", "123"), accion("Ruta de salud y derechos", "salud", "ruta"), accion("Sabedoras y agentes", "salud", "sabedoras")] };
      if (c === "campesina") return { texto: "Tienes los hospitales de Santa Marta, los puestos de salud rurales (Guachaca, Minca y Taganga) y las brigadas y el transporte.",
        acciones: [accion("Puestos de salud rurales", "ayuda", "directorio", null, "adentro", { filtroLugares: "rurales" }), accion("Hospitales de Santa Marta", "ayuda", "directorio", null, "adentro", { filtroLugares: "ciudad" })] };
      if (c === "indigena") return { texto: "En Ayuda está la lista de hospitales y clínicas de Santa Marta. Toca uno para ver su dirección y el mapa.", acciones: [accion("Ver hospitales", "ayuda", "directorio")] };
      return { texto: "Los hospitales están en «Mi comunidad» → Ayuda. Si es una emergencia, llama al 123.", acciones: [llamar("Llamar al 123", "123"), accion("Entrar a Mi comunidad", "acceso", null, null, "cualquiera")] };
    } },
  { claves: ["duele", "dolor", "sintoma", "me siento mal", "enfermo", "medico", "fiebre", "mareo"],
    responder: ctx => {
      const c = ctx.contexto;
      if (c === "indigena") return { texto: "En Salud tocas en la figura dónde te duele y qué sientes, y la app arma una frase para mostrarle al médico.", acciones: [accion("Decir qué me duele", "salud")] };
      if (c === "campesina") return { texto: "En Salud tienes primeros auxilios para el campo y la opción de armar una frase para el médico con la figura del cuerpo.",
        acciones: [accion("Primeros auxilios", "salud", "auxilios"), accion("Decir qué me duele al médico", "salud", "decir")] };
      if (c === "afro") return { texto: "En Salud encuentras el botiquín de plantas con cuándo ir al centro de salud, y la ruta de salud con tus derechos. Si es grave, llama al 123.",
        acciones: [accion("Botiquín de plantas", "salud", "plantas"), accion("Ruta de salud y derechos", "salud", "ruta"), llamar("Llamar al 123", "123")] };
      return { texto: "La sección de Salud está en «Mi comunidad». Si es grave, llama al 123.", acciones: [llamar("Llamar al 123", "123"), accion("Entrar a Mi comunidad", "acceso", null, null, "cualquiera")] };
    } },

  /* Primeros auxilios (respuesta corta segura para todos; guía completa para campesinos) */
  ...([["serpiente", ["serpiente", "culebra", "mordedura", "mordio", "picadura de culebra"], "Mantén a la persona quieta y calmada, quítale anillos y ropa apretada, y llévala ya al hospital. No hagas torniquete, no cortes ni chupes la herida."],
      ["agroquimicos", ["veneno", "fumig", "agroquim", "intoxic", "plaguicida", "insecticida"], "Aleja a la persona del producto, quítale la ropa contaminada y lava la piel con mucha agua y jabón por 15 minutos. Llama a la Línea Toxicológica 01 8000 916012 o al 123. No provoques el vómito."],
      ["calor", ["golpe de calor", "insolacion", "mucho calor", "desmayo por el sol"], "Llévala a la sombra, aflójale la ropa y refréscala con agua y aire. Si está despierta, dale sorbos de agua. Si está confundida o se desmaya, llama al 123."],
      ["herida", ["herida", "machete", "corte", "sangra", "sangrado", "peinilla"], "Presiona la herida con un trapo limpio por 10 minutos sin levantarlo. Si sigue sangrando, pon otro trapo encima y sigue presionando. Si sale a chorros, llama al 123."],
      ["fractura", ["fractura", "hueso", "se cayo", "caida", "quebro", "golpe fuerte"], "No intentes enderezar la parte lastimada. Inmovilízala con tablillas o cartón y lleva a la persona al puesto de salud. Si el golpe fue en la cabeza, el cuello o la espalda, no la muevas y llama al 123."]
     ] as [string, string[], string][]).map(([id, claves, resumen]): Intencion => ({ claves, prioridad: 3,
       responder: ctx => ({ texto: resumen, acciones: [
         ...(ctx.contexto === "campesina" ? [accion("Ver la guía completa", "salud", "auxilios", id)] : []),
         ...(id === "agroquimicos" ? [llamar("Línea Toxicológica", "018000916012")] : []),
         llamar("Llamar al 123", "123")] }) })),

  /* Comunidad afro: partería, plantas y condiciones */
  { claves: ["embarazo", "embarazada", "parto", "partera", "parteria", "gestacion", "recien nacido", "bebe", "dieta"], contextos: ["afro"],
    responder: () => ({ texto: "En Partería y saberes de las mayores están los saberes de las parteras y las señales de alarma. Si hay sangrado, dolor de cabeza fuerte, fiebre o el bebé se mueve menos, hay que ir al centro de salud de inmediato.",
      acciones: [accion("Partería y señales de alarma", "salud", "parteria")] }) },
  { claves: ["falciforme", "anemia"], contextos: ["afro"],
    responder: () => ({ texto: "La anemia falciforme es una enfermedad de la sangre que se hereda y es más frecuente en personas afrodescendientes. Da crisis de dolor, cansancio y ojos amarillos. Con fiebre o dolor de pecho, hay que ir a urgencias.",
      acciones: [accion("Ver anemia falciforme", "salud", "ruta", "falciforme")] }) },
  { claves: ["presion", "hipertension", "tension alta"], contextos: ["afro"],
    responder: () => ({ texto: "La presión alta casi nunca da síntomas. Mídela por lo menos una vez al año, come con menos sal y toma tus pastillas todos los días si te las recetaron.",
      acciones: [accion("Ver presión alta", "salud", "ruta", "hipertension")] }) },
  { claves: ["sobandero", "promotor", "promotora", "sabedora", "agente comunitario"], contextos: ["afro"],
    responder: () => ({ texto: "En Sabedoras y agentes están las parteras, sobanderos y promotores autorizados por el consejo comunitario.", acciones: [accion("Sabedoras y agentes", "salud", "sabedoras")] }) },

  /* Derechos y reportes */
  { claves: ["microrracismo", "micro racismo", "comentario racista", "chiste racista"],
    responder: ctx => adentroCon(ctx) && ctx.sesion!.usuario.comunidad !== "campesina"
      ? { texto: "Un microrracismo es un comentario, chiste o actitud del día a día que te hace sentir menos por tu color de piel u origen. Puedes aprender a reconocerlo y reportarlo.",
          acciones: [accion("¿Qué es un microrracismo?", "participa", "microrracismo"), accion("Reportarlo", "ayuda", "derechos", null, "adentro", { reporteTipo: "microrracismo" })] }
      : { texto: "Un microrracismo es un comentario, chiste o actitud del día a día que hace sentir menos a alguien por su color de piel u origen. En Aprende te explicamos cómo reconocerlo y evitarlo.",
          acciones: [accion("¿Qué es un microrracismo?", "aprende", "microrracismo", null, "afuera")] } },
  { claves: ["reportar", "report", "denunciar", "discrimin", "racismo", "me trataron mal", "maltrato", "queja", "derecho"],
    responder: ctx => adentroCon(ctx)
      ? { texto: `En Ayuda → ${ctx.contexto === "campesina" ? "Reportes y derechos" : "Mis derechos"} puedes contar lo que pasó con un toque y grabar un mensaje. Solo lo ve tu ${comunidades[ctx.sesion!.usuario.comunidad!].autoridad}. Si no hay señal, se envía después.`,
          acciones: [accion("Hacer un reporte", "ayuda", "derechos")] }
      : { texto: "Los reportes se hacen desde «Mi comunidad» → Ayuda, para que los reciba la autoridad de tu comunidad.", acciones: [accion("Entrar a Mi comunidad", "acceso", null, null, "cualquiera")] } },
  { claves: ["tramite", "cedula", "documento", "registro civil", "beca", "subsidio", "apoyo", "sisben", " eps ", "afiliacion"],
    responder: () => ({ texto: "En Ayuda → Trámites y apoyos te explicamos qué llevar para cada trámite.", acciones: [accion("Ver trámites", "ayuda", "tramites")] }) },
  { claves: ["tierra", "titulo", "formalizar", " ant ", "credito", "banco agrario", "finagro", "insumos"], contextos: ["campesina"],
    responder: () => ({ texto: "En Trámites del campo tienes, paso a paso, cómo formalizar tu tierra con la ANT, pedir crédito en el Banco Agrario, el SISBÉN rural y las convocatorias de insumos.", acciones: [accion("Trámites del campo", "ayuda", "tramites")] }) },

  /* Mi finca (campesinos) */
  { claves: ["semilla", "trueque", "intercambi"], contextos: ["campesina"],
    responder: () => ({ texto: "En el Banco de semillas puedes ofrecer tus semillas y proponer trueques con otras familias, sin intermediarios.", acciones: [accion("Banco de semillas", "finca", "semillas")] }) },
  { claves: ["siembr", "sembrar", "cosecha", "luna", "calendario", "cabanuela"], contextos: ["campesina"],
    responder: () => {
      const luna = faseLunar(), mesHoy = new Date().getMonth(), mes = mesesLargos[mesHoy];
      const siembra = calendarioCultivos.filter(c => c.siembra.includes(mesHoy)).map(c => c.cultivo.toLowerCase());
      return { texto: `Hoy hay ${luna.nombre.toLowerCase()}. En ${mes}, según la referencia general, ${siembra.length ? "se siembra " + siembra.join(", ") : "no hay siembras principales"}. Ajústalo con los saberes de tu vereda.`,
        acciones: [accion("Calendario de siembra", "finca", "calendario", null, "adentro", { mesElegido: mesHoy })] };
    } },
  { claves: ["alerta", "derrumbe", "creciente", "plaga", "broca", " via ", "puente", "rio crecido"], contextos: ["campesina"],
    responder: () => ({ texto: "En Alertas de la vereda avisas a tus vecinos de derrumbes, crecientes o plagas, con foto si quieres. Si no hay señal, se envía cuando alguien tome señal.", acciones: [accion("Dar una alerta", "finca", "alertas", null, "adentro", { formAlertaAbierto: true })] }) },
  { claves: ["cuentas", "cuaderno", "gane", "perdi", "invert", "gasto", "carga", "precio", "plata", "negociar"], contextos: ["campesina"],
    responder: ctx => {
      const c = ctx.datos.cuentas;
      const invertido = c.gastos.reduce((s, g) => s + g.monto, 0), vendido = (c.cargas || 0) * (c.precio || 0);
      return { texto: invertido || vendido
        ? `En tu cuaderno llevas invertido ${pesos(invertido)} y vendido ${pesos(vendido)}: ${vendido - invertido >= 0 ? "vas ganando" : "vas perdiendo"} ${pesos(Math.abs(vendido - invertido))}.`
        : "En el Cuaderno de cuentas anotas lo que gastas y lo que vendes, y la app te dice si ganas o pierdes y a cuánto vender cada carga.",
        acciones: [accion("Abrir mis cuentas", "finca", "cuentas")] };
    } },

  /* Participa, memoria, aprende, historias */
  { claves: ["encuentro", "conversatorio", "reunion", "capacitacion", "evento", "taller", "actividad"],
    responder: ctx => adentroCon(ctx) && ctx.sesion!.usuario.comunidad !== "campesina"
      ? { texto: "En Participa → Encuentros están los próximos conversatorios, reuniones y capacitaciones. Te inscribes con un toque.", acciones: [accion("Ver encuentros", "participa", "encuentros")] }
      : { texto: "En Aprende → Encuentros abiertos están las actividades que las comunidades abren a todos.", acciones: [accion("Encuentros abiertos", "aprende", "encuentros", null, "afuera")] } },
  { claves: ["investigacion", "investigar", "proyecto", "participar en", "universidad", "estudio"],
    responder: () => ({ texto: "En Participa → Investigación con nosotros ves los proyectos de la universidad, cómo participar y tus derechos: consentimiento, poder retirarte y recibir los resultados.", acciones: [accion("Investigación con nosotros", "participa", "investigacion")] }) },
  { claves: ["historia afro", "palenque", "benkos", "ley 70", "afrocolombian", "abolicion", "logros"],
    responder: ctx => adentroCon(ctx) && ctx.sesion!.usuario.comunidad === "afro"
      ? { texto: "Desde San Basilio de Palenque, el primer pueblo libre de América, hasta la Ley 70 y los logros de grandes figuras afrocolombianas: todo está en Historia y logros afro.", acciones: [accion("Historia y logros afro", "participa", "historia")] }
      : { texto: "Desde San Basilio de Palenque, el primer pueblo libre de América, hasta la Ley 70 y los logros de grandes figuras afrocolombianas: está en Aprende.", acciones: [accion("Historia y logros afro", "aprende", "historia", null, "afuera")] } },
  { claves: ["relato", "mayores", "memoria", "podcast", "youtube", "spotify", "cuento", "historia de"],
    responder: ctx => ({ texto: "En Memoria están los relatos de los mayores guardados en el teléfono, y los podcasts conectados de YouTube o Spotify.", acciones: [accion("Ir a Memoria", "memoria", null, null, ctx.ventana === "afuera" ? "afuera" : "adentro")] }) },
  { claves: ["producto", "comprar", "mochila", "cafe", "cacao", "artesania", "vender"],
    responder: () => ({ texto: "En Conocer → Historias está quién hace cada producto y su historia. Algunas asociaciones autorizan su contacto para comprar directo, sin intermediarios.", acciones: [accion("Ver historias", "historias", null, null, "afuera")] }) }
];

/* Plantas por nombre (solo donde la app las muestra) */
function intencionPlantas(q: string, ctx: CtxKora): Respuesta | null {
  const c = ctx.contexto;
  const lista = c === "campesina" || c === "afro" ? ctx.datos.plantas.filter(p => p.comunidad === c) : [];
  const p = lista.find(x => q.includes(sinTildes(x.nombre).split(" ")[0]));
  if (p) return { texto: `${p.nombre}: ${p.uso} Precaución: ${p.precaucion}`, acciones: [accion(`Ver ficha de ${p.nombre}`, "salud", "plantas", p.slug)] };
  if (lista.length && /\b(plantas?|remedios?|hierbas?|tos|gripa|aromaticas?|bebidas?|botiquin)\b/.test(q))
    return { texto: `En el botiquín están ${lista.map(x => x.nombre.split(" ")[0].toLowerCase()).join(", ")}. Cada ficha dice para qué sirve, cómo se prepara y cuándo ir al médico.`,
      acciones: [accion("Abrir el botiquín", "salud", "plantas")] };
  return null;
}

/* Búsqueda libre en los datos de la app cuando ninguna intención coincide */
function buscarEnDatos(q: string, ctx: CtxKora): Respuesta | null {
  const palabras = q.split(/\s+/).filter(w => w.length > 3);
  if (!palabras.length) return null;
  const c = ctx.contexto, adentro = adentroCon(ctx), d = ctx.datos;
  const fuentes: { t: string; a: AccionKora }[] = [
    ...d.relatos.map(r => ({ t: r.titulo + " " + r.sabedor, a: accion(r.titulo, "memoria", null, null, adentro ? "adentro" : "afuera") })),
    ...(adentro && c !== "campesina" ? d.encuentros.map(e => ({ t: e.titulo + " " + e.tipo, a: accion(e.titulo, "participa", "encuentros") })) : []),
    ...(adentro && c === "indigena" ? d.lugares.filter(h => h.categoria === "hospital").map(h => ({ t: h.nombre + " " + h.direccion, a: accion(h.nombre, "ayuda", "directorio") })) : []),
    ...(adentro ? tramites.map(t => ({ t: t.titulo + " " + t.desc, a: accion(t.titulo, "ayuda", "tramites") })) : []),
    ...(!adentro || c === "afro" ? historiaAfro.map(h => ({ t: h.titulo + " " + h.texto, a: accion(h.titulo, adentro ? "participa" : "aprende", "historia", null, adentro ? "adentro" : "afuera") })) : []),
    ...(c === "campesina" ? primerosAuxilios.map(a => ({ t: a.titulo + " " + a.desc, a: accion(a.titulo, "salud", "auxilios", a.id) })) : []),
    ...(!adentro ? d.historias.map(h => ({ t: h.nombre + " " + h.material, a: accion(h.nombre, "historias", null, h.id, "afuera") })) : [])
  ];
  const resultados = fuentes
    .map(f => ({ ...f, puntos: palabras.filter(w => sinTildes(f.t).includes(w)).length }))
    .filter(f => f.puntos > 0).sort((a, b) => b.puntos - a.puntos).slice(0, 3);
  if (!resultados.length) return null;
  return { texto: "Encontré esto en SABIA:", acciones: resultados.map(r => r.a) };
}

export function responderKora(pregunta: string, ctx: CtxKora): Respuesta {
  const q = " " + sinTildes(pregunta) + " ";
  const c = ctx.contexto;
  let mejor: Intencion | null = null, puntos = 0;
  for (const it of intenciones) {
    if (it.contextos && !it.contextos.includes(c)) continue;
    const n = it.claves.filter(k => q.includes(k)).length;
    const p = n ? n + (it.prioridad || 0) + (it.contextos ? 0.5 : 0) : 0;   /* lo propio de cada comunidad pesa un poco más */
    if (p > puntos) { mejor = it; puntos = p; }
  }
  /* Una planta nombrada gana a una intención débil; la búsqueda genérica de plantas solo si nada más coincide */
  const plantas = intencionPlantas(q, ctx);
  const primera = plantas?.acciones?.[0];
  if (plantas && (puntos === 0 || (puntos < 3 && primera && "detalle" in primera && primera.detalle))) return plantas;
  if (mejor) return mejor.responder(ctx);
  return buscarEnDatos(q, ctx) || { texto: "Todavía no sé responder eso. Prueba con otras palabras o toca una de las preguntas de abajo." };
}
