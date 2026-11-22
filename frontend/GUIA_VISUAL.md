# 🎨 Guía Visual y Sistema de Diseño ALUNA: "Tramas del Saber"
**Plataforma de Diálogo de Saberes · Universidad del Magdalena (UNIMAGDALENA)**  
**Seminario Taller ALUNA IA · Ecosistema Oficial Sincronizado con alunaia.co**

---

## 1. Concepto Creativo: "Tramas del Saber"

La identidad visual **Tramas del Saber** surge del diálogo armónico entre la **ancestralidad, el territorio, la memoria colectiva y la tecnología digital contemporánea**. En los territorios del Caribe colombiano y la Sierra Nevada de Santa Marta, el conocimiento no es una mercancía abstracta ni un conjunto de datos aislados; es una **urdimbre viva** tejida entre:

- Los ríos y cuencas que descienden de la Sierra Nevada hacia el mar.
- Las memorias de los pueblos indígenas, afrodescendientes, pescadores artesanales, comunidades campesinas y palafíticas.
- La soberanía de los datos: las comunidades deciden cómo, cuándo y bajo qué acuerdos de respeto se comparte su conocimiento.
- La tecnología contemporánea: modelos de inteligencia artificial que actúan como mediadores respetuosos, anclados estrictamente en fuentes autorizadas y sin extractivismo.

> **Metáfora gráfica:** Líneas orgánicas y topográficas semejantes a cauces de agua que transitan progresivamente hacia conexiones de nodos digitales. Esta transición es abstracta y moderna; no imita ni se apropia de símbolos sagrados o tejidos ceremoniales sin autorización.

---

## 2. Paleta Cromática Institucional Oficial (alunaia.co)

| Nombre del Token | Código HEX | Rol Simbólico y Territorial | Aplicación en la Interfaz | Ratio de Contraste WCAG 2.2 |
|---|---|---|---|---|
| **Azul Petróleo Oficial ALUNA IA** | `#006B8F` | Color institucional insignia de ALUNA IA. Tecnología, diálogo y río. | Botones primarios, encabezados de marca y contenedores emblemáticos. | **5.2:1** sobre blanco (Cumple AA) |
| **Cian Radiante ALUNA IA** | `#00A3C4` | Conexión neural, luz digital, mar caribeño y estados activos. | Acentos activos, bordes luminosos, enlaces y botones de acción rápida. | **7.4:1** contra `#0A1924` (Cumple AAA) |
| **Abismo Nocturno ALUNA IA** | `#07131B` | Inmersión, cielo nocturno de la Sierra y concentración profunda. | Fondo supremo por defecto de la aplicación y modales oscuros. | **18.2:1** con texto blanco (Cumple AAA) |
| **Pizarra Profunda ALUNA IA** | `#0A1924` | Superficie mineral, pizarra de estudio y vidrio esmerilado. | Tarjetas Bento, paneles de control y contenedores de lectura. | **15.6:1** con texto blanco (Cumple AAA) |
| **Verde Territorio** | `#214E45` | Naturaleza, bosque seco, sierra, sostenibilidad y vida. | Acentos de territorio, etiquetas de ecología y botones de acción firme. | **8.2:1** sobre blanco (Cumple AAA) |
| **Tierra Ancestral** | `#A76648` | Raíces, barro, semillas criollas, memoria y calidez humana. | Etiquetas de custodia, botones de solicitud y alertas comunitarias. | **4.6:1** sobre blanco (Cumple AA) |
| **Dorado Solar** | `#D2A45B` | Luz solar, descubrimiento, amanecer marino y síntesis de IA. | Acentos del Laboratorio de Saberes, medallas e indicadores activos. | **6.5:1** contra `#0A1924` (Cumple AA) |

---

## 3. Integración de Componentes Magic UI

La plataforma incorpora componentes seleccionados de **Magic UI**, adaptados a los tokens y requerimientos interculturales del proyecto:

1. **Bento Grid & Bento Cards (`BentoGrid.tsx`)**:
   - Organiza la portada y el panel principal en una cuadrícula asimétrica moderna.
   - Aplica efectos hover con resplandor sutil en cian institucional (`#00A3C4`).
2. **Blur Fade (`BlurFade.tsx`)**:
   - Desvanecimiento con desenfoque progresivo en cascada (`staggered delay`) para la carga de héroes y modales.
3. **Magic Card (`MagicCard.tsx`)**:
   - Tarjetas de la biblioteca de saberes con un gradiente radial sensible al movimiento del cursor del usuario.
4. **Animated Beam Flow (`AnimatedBeamFlow.tsx`)**:
   - Ilustra en el Laboratorio de Saberes la trazabilidad estricta: desde el documento territorial hacia el modelo de IA con citas verificables.
5. **Texturas y Tramas de Fondo**:
   - Patrón de ruido monocromático sutil y tramado de líneas geométricas abstractas sin folclorización.

---

## 4. Tipografía y Jerarquías Editoriales

ALUNA implementa un sistema tipográfico dual:

1. **Tipografía Narrativa y Editorial:** `Source Serif 4`
   - *Uso:* Títulos principales (`h1`, `h2`), citas tradicionales, títulos de saberes en la biblioteca y notas pedagógicas en diapositivas.
   - *Razón:* Proporciona distinción académica, memoria y respeto a la palabra oral o escrita.
2. **Tipografía de Interfaz y Navegación:** `Plus Jakarta Sans` / `Manrope`
   - *Uso:* Botones, menús de navegación, etiquetas de permisos, formularios y metadatos.
   - *Razón:* Alta legibilidad en pantallas de computadores y celulares con cualquier nivel de escalado (100%, 125%, 150%, 200% zoom).

---

## 5. Matriz Granular de Gobernanza Comunitaria

A diferencia de modelos centralizados o de libre descarga, ALUNA implementa **5 dimensiones de control independiente**:

1. **Consulta / Lectura:**
   - *Público General*: Libre acceso para fines pedagógicos abiertos.
   - *Comunidad Verificada*: Exclusivo para integrantes validados por la custodia.
   - *Custodia Restringida*: Requiere solicitud individual con justificación académica.
   - *Reservado Tradicional*: Exclusivo de autoridades comunitarias.
2. **Descarga de Archivos Fuente:**
   - Puede bloquearse independientemente de que la lectura esté permitida.
3. **Procesamiento con Inteligencia Artificial:**
   - *No permitida*: Bloqueo soberano total de IA con pantalla de advertencia ética.
   - *Consultas Educativas*: Respuestas contextuales ancladas estrictamente a citas del saber.
   - *Derivados con Aprobación*: Generación de presentaciones y guías con revisión obligatoria del custodio.
4. **Obras Derivadas:**
   - Autorización de generación didáctica condicionada a revisión previa a su publicación.
5. **Aprobación Mancomunada por Consenso:**
   - Los saberes compartidos por múltiples comunidades requieren la aprobación de cada una de sus custodias para publicarse.

---

## 6. Accesibilidad e Inclusión (WCAG 2.2 AA)

1. **Indicadores redundantes no dependientes solo del color:** Todo estado o permiso va acompañado de iconos unificados (`Lock`, `Unlock`, `ShieldCheck`, `Bot`, `Users`) y etiquetas textuales explícitas.
2. **Contraste verificado:** Todo texto normal supera 4.5:1; textos grandes superan 3:1.
3. **Escalado tipográfico:** Se utilizaron unidades relativas (`rem`, `em`, `%`) y layouts fluidos (`flex`, `grid`) para prevenir desbordamientos o truncamientos a 200% de zoom.
