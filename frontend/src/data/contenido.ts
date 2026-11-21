/* =========================================================
   CONTENIDO DE REFERENCIA (viaja dentro de la app: siempre funciona sin internet)
   Guías, catálogos y textos fijos del prototipo. Lo que cambia con el uso
   (relatos, lugares, plantas, encuentros, alertas…) viene de la API.
   ========================================================= */
import type { NombreIcono } from "../components/icons/iconos";
import type { IdComunidad } from "./tipos";

export type { IdComunidad } from "./tipos";

/* ---------- Comunidades ---------- */
export interface DatosComunidad {
  nombre: string;
  titulo: string;
  desc: string;
  autoridad: string;
  color: string;
  fondo: string;
  icono: string;
}
export const comunidades: Record<IdComunidad, DatosComunidad> = {
  indigena: { nombre: "Indígena", titulo: "Pueblos indígenas", desc: "Pueblos de la Sierra Nevada y la llanura", autoridad: "cabildo",
    color: "#2F5939", fondo: "#E2ECE0", icono: '<path d="M2 20 L9 8 L13 14 L16 10 L22 20 Z"/><circle cx="17" cy="5" r="2"/>' },
  afro: { nombre: "Afrodescendiente", titulo: "Comunidades afrodescendientes", desc: "Consejos comunitarios del Magdalena", autoridad: "consejo comunitario",
    color: "#8A3B22", fondo: "#F7E2D9", icono: '<path d="M2 8 C5 5 8 11 12 8 C16 5 19 11 22 8"/><path d="M2 13 C5 10 8 16 12 13 C16 10 19 16 22 13"/><path d="M2 18 C5 15 8 21 12 18 C16 15 19 21 22 18"/>' },
  campesina: { nombre: "Campesina", titulo: "Comunidades campesinas", desc: "Veredas y organizaciones campesinas", autoridad: "Junta de Acción Comunal o asociación",
    color: "#6E5A12", fondo: "#F3ECD1", icono: '<path d="M12 21 V10"/><path d="M12 13 C6 13 4 8 4 4 C9 4 12 7 12 13 Z"/><path d="M12 11 C16 11 20 9 20 4 C15 4 12 6 12 11 Z"/><path d="M5 21 H19"/>' }
};

/* Cuentas de prueba (sembradas en la base de datos por backend/app/seed.py) */
export const usuariosPrueba: { id: string; comunidad: IdComunidad; clave: string }[] = [
  { id: "1001", comunidad: "indigena", clave: "sabia123" },
  { id: "2001", comunidad: "afro", clave: "sabia123" },
  { id: "3001", comunidad: "campesina", clave: "sabia123" }
];

/* ---------- Navegación ---------- */
export type Pantalla =
  | "puertas" | "acceso" | "inicio" | "salud" | "participa" | "memoria" | "ayuda"
  | "finca" | "historias" | "aprende";

export const navs: Record<"adentro" | "afuera" | "campesina", [Pantalla & NombreIcono, string][]> = {
  adentro: [["inicio", "Inicio"], ["salud", "Salud"], ["participa", "Participa"], ["memoria", "Memoria"], ["ayuda", "Ayuda"]],
  campesina: [["inicio", "Inicio"], ["salud", "Salud"], ["finca", "Mi finca"], ["memoria", "Memoria"], ["ayuda", "Ayuda"]],
  afuera: [["inicio", "Inicio"], ["memoria", "Memoria"], ["historias", "Historias"], ["aprende", "Aprende"]]
};

/* ---------- Salud: figura del cuerpo ---------- */
/* propia: término en la lengua de la comunidad (pendiente: base de datos lingüística). */
export const partesCuerpo = [
  { id: "cabeza", nombre: "Cabeza", art: "la", propia: null as string | null },
  { id: "pecho", nombre: "Pecho", art: "el", propia: null as string | null },
  { id: "estomago", nombre: "Estómago", art: "el", propia: null as string | null },
  { id: "espalda", nombre: "Espalda", art: "la", propia: null as string | null },
  { id: "brazo", nombre: "Brazo", art: "el", propia: null as string | null },
  { id: "pierna", nombre: "Pierna", art: "la", propia: null as string | null }
];
export const sintomas = [
  { id: "ardor", nombre: "Ardor", texto: "ardor", propia: null as string | null, general: false },
  { id: "punzante", nombre: "Dolor punzante", texto: "dolor punzante", propia: null as string | null, general: false },
  { id: "fiebre", nombre: "Fiebre", texto: "fiebre", propia: null as string | null, general: true },
  { id: "mareo", nombre: "Mareo", texto: "mareo", propia: null as string | null, general: true },
  { id: "comezon", nombre: "Comezón", texto: "comezón", propia: null as string | null, general: false },
  { id: "hinchazon", nombre: "Hinchazón", texto: "hinchazón", propia: null as string | null, general: false }
];

/* ---------- Ayuda ---------- */
export const tramites: { icono: NombreIcono; titulo: string; desc: string; necesitas: string[] }[] = [
  { icono: "hospital", titulo: "Afiliación a salud", desc: "Inscribirse en la EPS de la zona o en la IPS propia de la comunidad.",
    necesitas: ["Documento de identidad", "Certificado de tu organización (cabildo, consejo comunitario o asociación)", "Ir con un acompañante si se necesita traducción"] },
  { icono: "documento", titulo: "Documento de identidad", desc: "Registro civil, tarjeta de identidad o cédula.",
    necesitas: ["Registro civil de nacimiento", "Acudir a la Registraduría más cercana", "Preguntar por jornadas en la comunidad"] },
  { icono: "historias", titulo: "Becas para jóvenes", desc: "Convocatorias para estudiar (información de ejemplo).",
    necesitas: ["Aval de tu organización comunitaria", "Certificado de estudios", "Estar atento a las fechas de inscripción"] },
  { icono: "balanza", titulo: "Apoyos y subsidios", desc: "Programas para familias (información de ejemplo).",
    necesitas: ["Documento de identidad", "Estar en el censo de la comunidad", "Preguntar en la Secretaría de Desarrollo Social"] }
];

export const tiposReporte: [string, string][] = [
  ["discriminacion", "Me discriminaron por mi origen"],
  ["microrracismo", "Viví un microrracismo"],
  ["salud", "No me atendieron en salud"],
  ["saberes", "Usaron nuestros saberes sin permiso"],
  ["otro", "Otra situación"]
];
export const tiposReporteCampo: [string, string][] = [
  ["via", "Daño en vía veredal o puente"],
  ["servicios", "Falla de agua o luz"],
  ["ambiente", "Afectación ambiental"]
];

export const brigadas = [
  { fecha: "Sábado 21 de noviembre (ejemplo)", lugar: "Escuela de la vereda El Recreo", servicios: "Medicina general, vacunación y odontología" },
  { fecha: "Sábado 5 de diciembre (ejemplo)", lugar: "Caseta comunal de La Esperanza", servicios: "Control prenatal, crecimiento y desarrollo" }
];
export const transportes = [
  { nombre: "Ambulancia", detalle: "Se solicita por la línea de emergencias", contacto: "123" },
  { nombre: "Transporte comunitario (ejemplo)", detalle: "Sale de la vereda a las 5:00 a. m. hacia Santa Marta", contacto: "" },
  { nombre: "Moto de la Junta de Acción Comunal (ejemplo)", detalle: "Para emergencias, coordinar con el presidente de la JAC", contacto: "" }
];

export const tramitesCampo: { icono: NombreIcono; titulo: string; entidad: string; pasos: string[] }[] = [
  { icono: "finca", titulo: "Formalizar mi tierra", entidad: "Agencia Nacional de Tierras (ANT)",
    pasos: ["Reúne lo que tengas: cédula, papeles de compraventa, recibos del predial y declaraciones de vecinos.",
            "Pregunta en la alcaldía o en la ANT por jornadas de formalización en tu municipio.",
            "Pide la visita y la medición del predio.",
            "Guarda el número de radicado para hacer seguimiento."] },
  { icono: "cuaderno", titulo: "Crédito para el campo", entidad: "Banco Agrario (líneas de Finagro)",
    pasos: ["Ten claro qué vas a sembrar, cuánto cuesta y cuándo cosechas: usa tu Cuaderno de cuentas.",
            "Lleva tu cédula y, si tienes, papeles del predio o contrato de arriendo.",
            "Pregunta en el Banco Agrario por las líneas para pequeño productor.",
            "Lee bien el plan de pagos antes de firmar."] },
  { icono: "documento", titulo: "SISBÉN en zona rural", entidad: "Oficina del SISBÉN de la alcaldía",
    pasos: ["Pide la encuesta en la oficina del SISBÉN o en las jornadas veredales.",
            "Ten a mano los documentos de todas las personas del hogar.",
            "Espera la visita del encuestador en tu casa.",
            "Consulta tu grupo en la alcaldía o en la página del SISBÉN."] },
  { icono: "semilla", titulo: "Convocatorias de insumos", entidad: "Secretaría de Desarrollo Rural / Ministerio de Agricultura",
    pasos: ["Pregunta a tu JAC o asociación por convocatorias abiertas.",
            "Inscríbete con tu asociación: muchas convocatorias son para grupos organizados.",
            "Revisa la fecha de cierre y los requisitos.",
            "Guarda los soportes de lo que recibas."] }
];

/* ---------- Salud rural: primeros auxilios (offline) ---------- */
export interface PrimerAuxilio {
  id: string; titulo: string; desc: string; color: string; tinte: string; urgente: string;
  pasos: string[]; noHacer: string[]; toxicologia?: boolean;
}
export const primerosAuxilios: PrimerAuxilio[] = [
  { id: "serpiente", titulo: "Mordedura de serpiente", desc: "Mientras llegas al hospital", color: "#FCEAE4", tinte: "#B8442A",
    urgente: "Es una emergencia. El único tratamiento es el suero antiofídico en el hospital. Sal ya.",
    pasos: ["Aleja a la persona de la serpiente. Mantenla calmada y quieta: moverse hace que el veneno avance más rápido.",
            "Quítale anillos, pulseras, reloj y ropa apretada cerca de la mordedura, porque la zona se va a hinchar.",
            "Deja el brazo o la pierna quieto, a la altura del corazón o un poco más abajo. Puedes inmovilizarlo con una tablilla.",
            "Lava la herida suavemente con agua y jabón y cúbrela con un trapo limpio.",
            "Llévala de inmediato al hospital y anota la hora de la mordedura.",
            "Si puedes, toma una foto de la serpiente desde lejos. No intentes atraparla."],
    noHacer: ["No hagas torniquete ni amarres", "No cortes ni chupes la herida", "No pongas hielo, emplastos ni remedios en la herida", "No le des alcohol", "No esperes a ver si mejora"] },
  { id: "agroquimicos", titulo: "Intoxicación con agroquímicos", desc: "Venenos, fumigos y abonos químicos", color: "#FFF4D6", tinte: "#9A6B00", toxicologia: true,
    urgente: "Llama a la Línea Toxicológica (gratis, 24 horas) o al 123 y sigue sus instrucciones.",
    pasos: ["Aleja a la persona del lugar y del producto. Si vas a tocar ropa contaminada, protégete las manos.",
            "Quítale la ropa y los zapatos mojados con el producto.",
            "Si cayó en la piel: lávala con abundante agua y jabón durante 15 minutos.",
            "Si cayó en los ojos: enjuágalos con agua limpia corriendo durante 15 minutos.",
            "Si lo tragó o lo respiró: llama a la Línea Toxicológica o al 123 y haz lo que te indiquen.",
            "Lleva al hospital la etiqueta o el envase del producto."],
    noHacer: ["No provoques el vómito si el personal de salud no lo indica", "No le des leche, aceite ni remedios caseros", "No la dejes sola", "No reutilices el trapo contaminado"] },
  { id: "calor", titulo: "Golpe de calor", desc: "Trabajo bajo el sol", color: "#FDEBD8", tinte: "#C0602A",
    urgente: "Busca ayuda urgente si está confundida, se desmaya, convulsiona o deja de sudar.",
    pasos: ["Lleva a la persona a la sombra o a un lugar fresco.",
            "Aflójale o quítale la ropa pesada.",
            "Refréscala: moja su piel con agua fresca y abanícala. Pon paños húmedos en cuello, axilas e ingles.",
            "Si está despierta y puede tragar, dale sorbos de agua.",
            "Que descanse el resto del día."],
    noHacer: ["No le des agua si está confundida o inconsciente", "No le des alcohol ni bebidas con cafeína", "No la dejes volver a trabajar ese día"] },
  { id: "herida", titulo: "Herida con herramienta", desc: "Machete, peinilla, alambre", color: "#FCEAE4", tinte: "#B8442A",
    urgente: "Si la sangre sale a chorros o no para con presión, sigue presionando fuerte y llama al 123.",
    pasos: ["Si puedes, protégete las manos con guantes o una bolsa limpia.",
            "Presiona la herida con un trapo limpio, firme, por lo menos 10 minutos sin levantarlo.",
            "Si el trapo se empapa, pon otro encima. No quites el primero.",
            "Si es en un brazo o una pierna, levántalo por encima del corazón mientras presionas.",
            "Cuando pare de sangrar, cubre con un vendaje limpio.",
            "Ve al puesto de salud: puede necesitar puntos y la vacuna contra el tétano."],
    noHacer: ["No saques objetos clavados en la herida", "No pongas tierra, café, telaraña ni ceniza", "No dejes de presionar para mirar"] },
  { id: "fractura", titulo: "Fractura o golpe fuerte", desc: "Caídas, golpes de animales", color: "#E8EEF4", tinte: "#3B5F7D",
    urgente: "Si el golpe fue en la cabeza, el cuello o la espalda, no la muevas: llama al 123.",
    pasos: ["Deja la parte lastimada como está. No intentes enderezarla.",
            "Inmovilízala con tablillas, cartón o una rama recta, amarrando por encima y por debajo de la lesión, sin apretar de más.",
            "Pon un paño frío (no hielo directo) para bajar la hinchazón.",
            "Si se ve el hueso, cubre la herida con un trapo limpio sin empujar el hueso.",
            "Llévala al puesto de salud o al hospital."],
    noHacer: ["No intentes acomodar el hueso", "No hagas sobar ni masajes en la lesión", "No le des de comer ni beber: puede necesitar cirugía"] }
];

/* ---------- Mi finca ---------- */
export const tiposSemilla = ["Maíz", "Fríjol", "Yuca", "Café", "Frutales", "Otra"];
export const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const mesesLargos = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
/* Referencia general para el Magdalena (dos temporadas de lluvia). Se ajusta con los saberes de cada vereda. */
export const calendarioCultivos = [
  { cultivo: "Maíz", siembra: [3, 4, 8, 9], cosecha: [7, 8, 0, 1] },
  { cultivo: "Fríjol", siembra: [3, 8, 9], cosecha: [6, 11, 0] },
  { cultivo: "Yuca", siembra: [3, 4, 8], cosecha: [0, 1, 2] },
  { cultivo: "Café", siembra: [4, 5], cosecha: [9, 10, 11] },
  { cultivo: "Frutales (mango)", siembra: [4, 9], cosecha: [3, 4, 5] }
];
export const tiposAlerta: { id: string; nombre: string; icono: NombreIcono; color: string; fondo: string }[] = [
  { id: "derrumbe", nombre: "Derrumbe en la vía", icono: "derrumbe", color: "#8A5A2B", fondo: "#F3E6DA" },
  { id: "creciente", nombre: "Creciente de río o quebrada", icono: "creciente", color: "#2F6690", fondo: "#E3EEF7" },
  { id: "plaga", nombre: "Plaga en cultivos", icono: "plaga", color: "#6E5A12", fondo: "#F3ECD1" },
  { id: "otra", nombre: "Otra alerta", icono: "aviso", color: "#B8442A", fondo: "#FCEAE4" }
];
export const tiposGasto = ["Abono", "Jornales", "Semillas e insumos", "Transporte", "Otro"];
export const cultivosCuentas = ["Café", "Maíz", "Yuca", "Fríjol", "Otro"];

/* ---------- Historia y logros afro (hechos verificables) ---------- */
export const historiaAfro = [
  { anio: "Siglo XVII", titulo: "San Basilio de Palenque", texto: "Bajo el liderazgo de Benkos Biohó, personas esclavizadas que se liberaron fundaron palenques. San Basilio de Palenque es considerado el primer pueblo libre de América." },
  { anio: "1851", titulo: "Abolición de la esclavitud", texto: "La ley del 21 de mayo de 1851 abolió la esclavitud en Colombia, con efecto desde el 1 de enero de 1852." },
  { anio: "1991", titulo: "Nación pluriétnica", texto: "La Constitución reconoce y protege la diversidad étnica y cultural de la Nación, y abre el camino para los derechos de las comunidades negras." },
  { anio: "1993", titulo: "Ley 70", texto: "Reconoce la propiedad colectiva de las comunidades negras sobre sus territorios y da origen a los consejos comunitarios." },
  { anio: "2001", titulo: "Día de la Afrocolombianidad", texto: "La Ley 725 establece el 21 de mayo como Día Nacional de la Afrocolombianidad." },
  { anio: "2005", titulo: "Patrimonio de la humanidad", texto: "La UNESCO proclama el espacio cultural de San Basilio de Palenque Obra Maestra del Patrimonio Oral e Inmaterial de la Humanidad." }
];
export const logrosAfro = [
  { nombre: "Manuel Zapata Olivella", logro: "Escritor, médico y antropólogo; una de las voces más importantes de la literatura afrocolombiana." },
  { nombre: "María Isabel Urrutia", logro: "Primera medalla de oro olímpica de Colombia, en levantamiento de pesas (Sídney 2000)." },
  { nombre: "Caterine Ibargüen", logro: "Campeona olímpica de salto triple en Río 2016." },
  { nombre: "Músicas de marimba del Pacífico sur", logro: "Patrimonio Cultural Inmaterial de la Humanidad según la UNESCO (2010)." }
];

/* ---------- Salud para la comunidad afro ---------- */
export const saberesParteria = [
  { titulo: "Cuidado durante la gestación", desc: "Consejos de las parteras para la mujer embarazada." },
  { titulo: "El parto y el acompañamiento", desc: "Cómo acompaña la partera y cuándo se va al hospital." },
  { titulo: "La dieta después del parto", desc: "Los cuidados de la madre en los días después del parto." },
  { titulo: "Baños y bebidas tradicionales", desc: "Preparaciones que usan las mayores para el cuidado de la mujer." },
  { titulo: "Cuidado del recién nacido", desc: "El ombligo, el abrigo y la lactancia según las mayores." }
];
export const alarmasEmbarazo = [
  "Sangrado por la vagina", "Dolor de cabeza fuerte, visión borrosa o ver lucecitas", "Hinchazón de la cara o de las manos",
  "Fiebre", "El bebé se mueve menos o no se mueve", "Sale líquido por la vagina antes de tiempo", "Convulsiones o desmayos", "Dolor fuerte en la barriga"
];
export const alarmasPosparto = ["Sangrado abundante (empapa más de una toalla por hora)", "Fiebre o escalofríos", "Flujo con mal olor", "Dolor de cabeza fuerte o visión borrosa", "Tristeza profunda o ganas de hacerse daño"];
export const alarmasBebe = ["No quiere comer o vomita todo", "Fiebre o está muy frío", "Respira rápido o con dificultad", "Piel u ojos amarillos", "El ombligo está rojo, con pus o mal olor", "Convulsiones o está muy decaído"];

export const condicionesAfro = [
  { id: "falciforme", titulo: "Anemia falciforme", color: "#F7E2D9", tinte: "#8A3B22",
    que: "Es una enfermedad de la sangre que se hereda de los padres y es más frecuente en personas afrodescendientes. Los glóbulos rojos toman forma de hoz y se atascan.",
    senales: ["Crisis de dolor fuerte en huesos, pecho o barriga", "Cansancio y palidez", "Ojos o piel amarillos", "Infecciones frecuentes", "Manos y pies hinchados en los niños"],
    hacer: ["Pide la prueba de sangre (electroforesis de hemoglobina), sobre todo si hay casos en la familia.", "Toma mucha agua y evita el frío extremo.", "Asiste a los controles con el especialista y cumple las vacunas."],
    urgencia: "Ve a urgencias si hay fiebre (sobre todo en niños), dolor de pecho, dificultad para respirar, debilidad en un lado del cuerpo o una crisis de dolor que no cede." },
  { id: "hipertension", titulo: "Presión alta (hipertensión)", color: "#FCEAE4", tinte: "#B8442A",
    que: "Es la presión de la sangre más alta de lo normal. En la población afrodescendiente suele aparecer más temprano y con más fuerza. Muchas veces no da síntomas.",
    senales: ["Casi siempre no se siente nada", "A veces: dolor de cabeza, mareo o zumbido en los oídos"],
    hacer: ["Mídete la presión por lo menos una vez al año, y más seguido si hay casos en tu familia.", "Come con menos sal y menos alimentos de paquete.", "Si te recetaron pastillas, tómalas todos los días aunque te sientas bien.", "Camina o muévete al menos 30 minutos al día."],
    urgencia: "Ve a urgencias si hay dolor de cabeza muy fuerte, dolor en el pecho, visión borrosa, dificultad para hablar o debilidad en un lado del cuerpo." }
];

export const derechosSalud = [
  "En urgencias deben atenderte siempre, sin pedir autorizaciones ni pagos antes.",
  "La ley de salud protege a las comunidades negras, afrocolombianas, raizales y palenqueras, y reconoce la interculturalidad en la atención.",
  "Tienes derecho a un trato digno, a que te expliquen en palabras claras y a recibir copia de tu historia clínica.",
  "Puedes pedir que se respeten tus prácticas tradicionales, como estar acompañada por tu partera, siempre que no pongan en riesgo tu vida.",
  "Discriminar por raza u origen es un delito en Colombia (Ley 1482 de 2011)."
];

export const agentesComunitarios = [
  { nombre: "Partera (ejemplo)", rol: "Partera tradicional", zona: "Barrio o vereda (ejemplo)", autorizado: "Consejo comunitario (ejemplo)" },
  { nombre: "Sobandero (ejemplo)", rol: "Sobandero", zona: "Barrio o vereda (ejemplo)", autorizado: "Consejo comunitario (ejemplo)" },
  { nombre: "Promotora de salud (ejemplo)", rol: "Promotora de salud comunitaria", zona: "Barrio o vereda (ejemplo)", autorizado: "Consejo comunitario (ejemplo)" },
  { nombre: "Sabedora de plantas (ejemplo)", rol: "Medicina tradicional", zona: "Barrio o vereda (ejemplo)", autorizado: "Consejo comunitario (ejemplo)" }
];
