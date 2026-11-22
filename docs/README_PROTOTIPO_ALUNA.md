# 🌿 ALUNA — Plataforma de Diálogo de Saberes
**Universidad del Magdalena (UNIMAGDALENA) · Seminario Taller ALUNA IA**  
**Prototipo Interactivo Demostrativo de Experiencia de Producto Digital (Versión Integral Actualizada)**

---

## 1. Resumen de la Actualización Integral

Esta versión representa la **actualización integral del prototipo ALUNA**, resolviendo los puntos críticos identificados en las pruebas de concepto iniciales, elevando la experiencia de diseño al nivel visual del portal oficial **alunaia.co**, e incorporando un modelo estricto de **soberanía de datos y gobernanza comunitaria descentralizada**.

### Principales Mejoras Implementadas

1. **Laboratorio de Saberes Dinámico y Multi-Relato (Corrección del Error Principal)**:
   - Resuelto el problema del documento fijo: ahora, al cambiar de saber en el selector o mediante los accesos directos, se actualizan dinámicamente:
     - El documento activo y su contexto.
     - Las preguntas y respuestas sugeridas con citas textuales verificables.
     - La respuesta de rechazo ante consultas fuera de dominio (*Out-of-Domain Guardrail*).
     - La síntesis y explicación accesible.
     - Las diapositivas interactivas de la presentación (con notas pedagógicas y anclaje al texto).
     - La guía didáctica de aula.
     - El guion de podcast con locutores contextuales.
     - El mapa conceptual de nodos y relaciones.
     - El guion técnico de video.
   - Evaluado y probado exhaustivamente con 3 saberes de diferentes territorios:
     1. *Las Terrazas de Piedra y la Quietud del Agua* (Sierra Nevada).
     2. *Cantos de Boga y Memoria Fluvial del Río Magdalena* (Río Magdalena / Afro).
     3. *Vientos, Mareas y Brisas de Taganga* (Pescadores Artesanales).

2. **Gobernanza Comunitaria sin "Administrador Cultural Universal"**:
   - Se separó la **Identidad de Participación** (*visitante*, *estudiante*, *investigador*, *integrante*, *representante de organización*) de la **Pertenencia Territorial** (*filiación validada por comunidad*) y de la **Autoridad de Custodia** (*custodio específico de una comunidad*).
   - Un custodio de la Sierra Nevada (Mamo Senen) **no puede** aprobar ni rechazar contenidos de la comunidad afrodescendiente de Palenque (custodiada por Aura Hurtado), garantizando respeto a la autodeterminación.

3. **Saberes Mancomunados con Aprobación por Consenso**:
   - Los saberes que vinculan a dos o más territorios (ej. *Caminos Ancestrales de la Línea Negra*, compartido entre Sierra Nevada y Taganga) requieren la **aprobación de todas las custodias vinculadas** antes de publicarse en la biblioteca general.

4. **Flujo de Aporte Adaptativo en 3 Pasos (`UploadScreen.tsx`)**:
   - Selección comunitaria individual o mancomunada.
   - Si el autor es un visitante o investigador externo, el saber queda registrado en estado `pending_review` y se envía a la bandeja del custodio.
   - Declaración de linaje o procedencia y consentimiento informado intercultural.

5. **Matriz Granular e Independiente de Permisos**:
   - Lectura / Consulta (*Público*, *Comunidad*, *Restringido*, *Privado*).
   - Descarga de archivos fuente (*Permitida* o *Bloqueada*).
   - Consulta con IA (*No permitida*, *Consultas educativas*, *Derivados con aprobación*).
   - Generación de obras derivadas (*Habilitada* o *Restringida*).
   - Reutilización pedagógica en aulas universitarias.

6. **Pantalla Nueva: "Mi Comunidad, Mis Decisiones" (`MyCommunityScreen.tsx`)**:
   - Espacio exclusivo donde los integrantes y custodios gestionan la política territorial de IA, la apertura a aportes externos y el registro de autoridades tradicionales.

7. **Rediseño Visual Institucional Oficial ALUNA IA**:
   - Paleta cromática oficial sincronizada con el portal oficial **alunaia.co** (`/acerca`, `/kunsamu`, `/sakuku`):
     - **Azul Petróleo Oficial ALUNA IA**: `#006B8F`
     - **Cian Radiante ALUNA IA**: `#00A3C4`
     - **Abismo Nocturno / Modo Oscuro por Defecto**: `#07131B`
     - **Pizarra Profunda**: `#0A1924`
   - Incorporación de componentes seleccionados de **Magic UI**:
     - *Bento Grid & Bento Cards* para métricas y arquitectura.
     - *Blur Fade* para transiciones suaves en cascada.
     - *Magic Card* con gradientes y halo luminoso interactivo.
     - *Animated Beam Flow* para trazar el flujo ético del saber hacia el modelo de IA.
     - *Texturas de ruido sutil y patrones de tramas*.

8. **Orquestador Interactivo de los 7 Escenarios de Prueba (`DemoModeBar.tsx`)**:
   - Acceso con un clic a los 7 casos de evaluación solicitados por el equipo docente:
     - **Escenario 1**: Laboratorio de Saberes dinámico entre 3 documentos distintos.
     - **Escenario 2**: Cambio de identidades y visualización de permisos.
     - **Escenario 3**: Aporte externo y solicitud formal de acceso.
     - **Escenario 4**: Fronteras de autoridad entre custodios territoriales.
     - **Escenario 5**: Soberanía de datos y bloqueo de IA (*Lock Screen*).
     - **Escenario 6**: Aprobación mancomunada por consenso intercolectivo.
     - **Escenario 7**: Generación y revisión de derivados pedagógicos.

---

## 2. Instrucciones para Ejecutar el Prototipo

El proyecto está construido con **React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Magic UI Components**.

### Paso 1: Abrir la terminal en la carpeta del proyecto
```powershell
cd "c:\Users\Unimagdalena\Documents\Referencias para cualquier diapositiva en general\prototipo-aluna-ia"
```

### Paso 2: Ejecutar el servidor de desarrollo
```powershell
npm run dev
```
La aplicación iniciará en: `http://localhost:5173`

### Paso 3: Compilar para producción y previsualizar
```powershell
npm run build
npm run preview
```
La versión de producción precompilada corre en `http://localhost:4173`.

---

## 3. Estructura de Archivos del Proyecto

```
prototipo-aluna-ia/
│
├── public/
│   └── assets/
│       ├── logos/          # Logos institucionales oficiales ALUNA IA y UNIMAGDALENA
│       ├── photos/         # Fotografías reales del territorio, comunidades y campus
│       └── audios/         # Pistas de audio locales de demostración
│
├── src/
│   ├── types/
│   │   └── index.ts        # Modelos TypeScript: User, Community, GranularPermissions, EducationalData
│   │
│   ├── data/
│   │   └── mockData.ts     # Datos estructurados con 6 usuarios y 6 saberes con datasets educativos
│   │
│   ├── context/
│   │   └── AlunaContext.tsx# Motor de soberanía, orquestador de los 7 escenarios y permisos
│   │
│   ├── lib/
│   │   └── utils.ts        # Utilidad cn() para clases condicionales
│   │
│   ├── components/
│   │   ├── magicui/        # Componentes de Magic UI (BentoGrid, BlurFade, MagicCard, AnimatedBeam)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx      # Barra global con identidad alunaia.co y enlace a Mi Territorio
│   │   │   ├── DemoModeBar.tsx # Barra persistente con selector de usuarios y modal de 7 escenarios
│   │   │   └── Footer.tsx      # Pie de página institucional y advertencias éticas
│   │   │
│   │   └── common/
│   │       ├── KnowledgeCard.tsx        # Tarjeta MagicCard con badges granulares de acceso
│   │       ├── KnowledgeDetailModal.tsx # Modal de lectura completa, audio y enlace al Laboratorio
│   │       ├── RequestAccessModal.tsx   # Modal de solicitud formal de acceso con compromiso
│   │       └── NotificationToast.tsx    # Notificaciones flotantes de estado
│   │
│   ├── screens/
│   │   ├── WelcomeScreen.tsx           # Portada BentoGrid y principios de soberanía
│   │   ├── RegisterScreen.tsx          # Selección de identidad y solicitud de vinculación
│   │   ├── DashboardScreen.tsx         # Panel principal adaptado dinámicamente al rol activo
│   │   ├── CommunitiesScreen.tsx       # Directorio de comunidades y vistas territoriales
│   │   ├── MyCommunityScreen.tsx       # NUEVA PANTALLA: "Mi comunidad, mis decisiones"
│   │   ├── LibraryScreen.tsx           # Biblioteca viva con filtros por formato y acceso granular
│   │   ├── UploadScreen.tsx            # Formulario de aporte en 3 pasos con permisos granulares
│   │   ├── PermissionsManagerScreen.tsx# Matriz de permisos, privacidad y custodia
│   │   ├── AccessRequestsScreen.tsx    # Seguimiento de solicitudes enviadas y aprobadas
│   │   ├── AILabScreen.tsx             # Laboratorio con switcher dinámico y pantalla de bloqueo IA
│   │   ├── CustodianPanelScreen.tsx    # Panel de gobierno y resoluciones del custodio
│   │   ├── ProfileScreen.tsx           # Perfil personal y estado de vinculación comunitaria
│   │   ├── WellnessScreen.tsx          # Módulo preliminar conceptual de ayuda y bienestar (no clínico)
│   │   └── VisualGuideScreen.tsx       # Manual interactivo del sistema de diseño (tokens y Magic UI)
│   │
│   ├── App.tsx             # Enrutador y coordinador global
│   ├── main.tsx            # Punto de entrada de React
│   └── index.css           # Estilos base, texturas y temas
│
├── GUIA_VISUAL.md          # Manual de identidad visual con códigos HEX oficiales
├── tailwind.config.js      # Configuración de colores aluna-petrol, aluna-cyan y sombras
└── package.json            # Dependencias del proyecto
```

---

## 4. Matriz de los 7 Escenarios de Demostración

| # | Escenario | Procedimiento en la Demo | Resultado Verificable |
|---|---|---|---|
| **1** | **Laboratorio Dinámico** | En la barra superior, haz clic en *Escenarios Guiados -> Escenario 1*. En el Laboratorio, alterna entre los botones *1. Terrazas*, *2. Cantos de Boga* y *3. Vientos y Mareas*. | El título, las preguntas sugeridas, las respuestas con citas textuales, la explicación simple y las diapositivas cambian inmediatamente de acuerdo con el saber activo. |
| **2** | **Identidades y Permisos** | Alterna entre los usuarios en la barra superior (Visitante, Carlos Arhuaco, Mamo Senen, Aura Hurtado). | En la Biblioteca y en la Matriz de Permisos cambian en vivo los saberes autorizados, los badges de estado y las opciones disponibles. |
| **3** | **Aporte Externo y Solicitud** | Como Carlos (investigador), intenta consultar un saber restringido y pulsa *Solicitar acceso al custodio*. Luego cambia a Mamo Senen y autorízalo en el Panel de Custodia. | La solicitud se registra con justificación académica, el custodio la aprueba y Carlos obtiene acceso inmediato al contenido. |
| **4** | **Frontera de Autoridad** | Como Aura Hurtado (custodia Afro), intenta resolver trámites de la Sierra Nevada. | El sistema impide que un custodio apruebe saberes ajenos a su territorio; cada autoridad administra únicamente su comunidad. |
| **5** | **Bloqueo Soberano de IA** | Selecciona el saber *Acuerdos Internos y Gobernanza de la Cuenca* en el Laboratorio (o ejecuta el Escenario 5). | Aparece la pantalla de bloqueo de soberanía indicando que la comunidad no autorizó el uso de IA para este material. |
| **6** | **Consenso Intercomunitario** | Revisa el saber *Caminos Ancestrales de la Línea Negra* (vinculado a Sierra Nevada y Taganga). | El saber muestra el estado de aprobación individual por comunidad y solo se publica cuando ambas partes otorgan su visto bueno. |
| **7** | **Derivados Pedagógicos** | En el Laboratorio, pulsa *Guardar derivado pedagógico* y luego revisa el Panel de Custodia en la pestaña *Derivados de IA*. | El material generado con IA queda en borrador condicionado hasta que la custodia comunitaria lo valida formalmente. |

---

## 5. Salvaguardas Éticas y Límites de la Demostración

- **Carácter Demostrativo**: La plataforma no utiliza datos reales protegidos, historias sagradas no autorizadas ni información médica de comunidades.
- **Sin Extracción de Saberes**: No se alimenta ningún modelo comercial con contenidos tradicionales sin soberanía comunitaria previa.
- **Bienestar No Clínico**: El módulo conceptual de orientación y bienestar **no recopila síntomas, no realiza diagnósticos ni receta medicamentos**.
