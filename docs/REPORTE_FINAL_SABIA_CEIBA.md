# Reporte Final de Implementación — ALUNA IA (Módulo SABIA & CEIBA)

> [!IMPORTANT]
> Se ejecutaron íntegramente las fases **P0 (Aislamiento, Permisos Centralizados y Corrección de Bugs)** y **P1 (Login Formal, Modo Demo Discreto, CEIBA, Bienestar Aislado, Avatares Locales Reales y Corrección de Sobreposiciones)** conservando intacta la identidad visual institucional de `alunaia.co` (**Acuerdo Superior N.º 06 del 30 de abril de 2026**).

---

## Evidencia Visual de la Aplicación Actualizada

````carousel
![Perfiles con Retratos Reales del Territorio y UNIMAGDALENA en LoginScreen](C:/Users/Unimagdalena/.gemini/antigravity/brain/0567b4c3-fcfa-460c-82d1-b8c20781d705/sabia_perfiles_reales_login.png)
<!-- slide -->
![Pregúntale a Ceiba: Tarjeta de Cita Verificable + Negativa Honesta ante Pregunta Fuera de Fuente](C:/Users/Unimagdalena/.gemini/antigravity/brain/0567b4c3-fcfa-460c-82d1-b8c20781d705/ceiba_citas_y_negativa.png)
<!-- slide -->
![Transformar para Enseñar: Salida en Borrador (status = draft · pending_review · public = false)](C:/Users/Unimagdalena/.gemini/antigravity/brain/0567b4c3-fcfa-460c-82d1-b8c20781d705/ceiba_transformar_borrador.png)
<!-- slide -->
![Aislamiento P0.2: Panel de Custodia de Mamo Senen (Sierra Nevada) — Cero borradores Afro](C:/Users/Unimagdalena/.gemini/antigravity/brain/0567b4c3-fcfa-460c-82d1-b8c20781d705/custodia_sierra_aislada.png)
<!-- slide -->
![Aislamiento P0.2: Panel de Custodia de Faustina Palacios (Litoral Afrocaribe) — Cero borradores Sierra](C:/Users/Unimagdalena/.gemini/antigravity/brain/0567b4c3-fcfa-460c-82d1-b8c20781d705/custodia_afro_aislada.png)
<!-- slide -->
![Tarjetas de Comunidades Sin Etiquetas Sobrepuestas ni Nombres de Custodios Cortados](C:/Users/Unimagdalena/.gemini/antigravity/brain/0567b4c3-fcfa-460c-82d1-b8c20781d705/comunidades_tarjetas_limpias.png)
````

---

## 1. Stack Real Detectado (`package.json`)
- **React:** `^19.3.1` (`react`, `react-dom`)
- **TypeScript:** `~7.0.2`
- **Vite:** `^8.3.6` (`@vitejs/plugin-react: ^6.1.2`)
- **Tailwind CSS:** `^3.4.19` (`postcss: ^8.5.32`, `autoprefixer: ^10.6.2`)
- **Linter:** `oxlint: ^1.90.0`
- **Node.js Runtime & Test Runner:** `v24.19.0` (`node:test` + `node:assert/strict`)

---

## 2. Arquitectura Encontrada y Consolidada
- **Dominio Centralizado de Autorización:** [src/domain/authorization.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/domain/authorization.ts) concentra todas las reglas de acceso (`canReadKnowledge`, `canQueryKnowledgeWithAI`, `canTransformKnowledgeWithAI`, `canCustodianReviewResource`, `canReviewKnowledge`, `canReviewAIDerivative`, `hasUnanimousOwnerApproval`).
- **Capa de Servicios Desacoplada:** `src/services/` (`authService.ts`, `knowledgeService.ts`, `accessService.ts`, `aiService.ts`, `communityService.ts`, `wellnessService.ts`) con interfaces listas para sustituir los adaptadores locales por llamadas HTTP a `/api/v1/*`.
- **Contrato Relacional y RLS para Backend:** [docs/BACKEND_CONTRACT_AND_SCHEMA.sql](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/docs/BACKEND_CONTRACT_AND_SCHEMA.sql) documenta el esquema PostgreSQL/Supabase, políticas RLS y endpoints REST para la integración con tu compañero.

---

## 3. Archivos Creados y Modificados (`Archivo → Cambio Realizado`)

| Archivo | Cambio Realizado |
| :--- | :--- |
| [src/types/index.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/types/index.ts) | Añadidos tipos `AiOperation`, `AiOperationPermission`, `AccessGrant`, `CeibaCitation`, `CeibaQueryRequest`, `CeibaQueryResponse`, `TransformRequest`, `communityIds: string[]` en `AILabArtifact` y pantalla `'login'`. |
| [src/domain/authorization.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/domain/authorization.ts) | **(Nuevo — P0.2, P0.3, P0.4, P0.5)** Módulo único de autorización con separación estricta entre `public`, `community` (solo miembros `verified`), `restricted` (exige `access_grant` explícito vigente) y `private`, más unanimidad multicomunidad (`hasUnanimousOwnerApproval`). |
| [src/services/aiService.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/services/aiService.ts) | **(Nuevo — P0.6, P0.7)** Implementa `MockCeibaService` con verificación de permisos **antes** del retrieval, sanitización contra *prompt injection* (`sanitizeRetrievedChunk`), citas estructuradas y flujo `transform` con salida en borrador. |
| [src/services/accessService.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/services/accessService.ts) | **(Nuevo — P0.2)** Filtra bandejas de custodia (`Saberes`, `Accesos`, `Filiaciones`, `Derivados IA`) estrictamente por las comunidades que custodia el usuario activo. |
| [src/services/authService.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/services/authService.ts) | **(Nuevo — P1.1, P1.2)** Servicio de login por correo y control de disponibilidad de perfiles demo (`isDemoProfilesEnabled`). |
| [src/services/knowledgeService.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/services/knowledgeService.ts) | **(Nuevo)** Listado y consulta por ID protegida contra IDOR. |
| [src/services/communityService.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/services/communityService.ts) | **(Nuevo — P0.1)** Resolución de comunidades con membresía verificada por usuario. |
| [src/services/wellnessService.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/services/wellnessService.ts) | **(Nuevo — P1.5)** Servicio independiente para el módulo de Salud/Bienestar, aislado de Ceiba. |
| [src/data/mockData.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/data/mockData.ts) | Reemplazados todos los avatares de Unsplash por **6 retratos locales reales** en `/assets/avatars/avatar_*.jpg` y añadido `communityIds` a `INITIAL_AI_ARTIFACTS` (con borradores separados para Sierra y Afro). |
| [src/context/AlunaContext.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/context/AlunaContext.tsx) | Conectado a `src/domain/authorization.ts`, añadido `loginWithEmail`, `revokeAIPermissionFromKnowledge` y creación de `AccessGrant` al aprobar solicitudes. |
| [src/screens/MyCommunityScreen.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/screens/MyCommunityScreen.tsx) | **(P0.1)** Derivación síncrona de `effectiveCommId` a partir de las membresías verificadas de `currentUser` (elimina la comunidad "pegada" al cambiar de usuario sin parpadeos). |
| [src/screens/CustodianPanelScreen.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/screens/CustodianPanelScreen.tsx) | **(P0.2, P0.4)** Aislamiento total de borradores IA por comunidad, contadores separados, pestaña de revocación de permisos IA en vivo y corrección del nombre `Faustina Palacios`. |
| [src/screens/AILabScreen.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/screens/AILabScreen.tsx) | **(P0.6, P1.4)** Renombrado a **CEIBA**, breadcrumb superior, bloque *"Origen y condiciones de uso"*, flujo 1 **"Pregúntale a Ceiba"** con tarjetas de citas clicables y negativa sin evidencia, y flujo 2 **"Transformar para enseñar"**. |
| [src/screens/LoginScreen.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/screens/LoginScreen.tsx) | **(Nuevo — P1.1)** Pantalla formal de Inicio de Sesión con credenciales separada del panel de cambio rápido de perfiles de demostración. |
| [src/components/layout/Navbar.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/components/layout/Navbar.tsx) | **(P1.2, P1.3)** Eliminada `Guía Visual`, integrado selector rápido de perfiles dentro del menú de usuario superior derecho y contador de custodia aislado por comunidad. |
| [src/components/layout/Footer.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/components/layout/Footer.tsx) | Actualizada referencia al **Acuerdo Superior N.º 06 del 30 de abril de 2026** e indicador discreto de entorno de demostración. |
| [src/App.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/App.tsx) | Retirados `DemoModeBar` y `VisualGuideScreen`; integrada ruta de vista `'login'`. |
| [src/screens/CommunitiesScreen.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/screens/CommunitiesScreen.tsx) y [KnowledgeCard.tsx](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/components/common/KnowledgeCard.tsx) | **(P1.7)** Eliminadas las etiquetas superpuestas sobre las fotos y los truncamientos de nombres de custodios; chips consistentes de visibilidad e IA. |
| [src/tests/authorization.test.ts](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/src/tests/authorization.test.ts) | **(Nuevo)** Suite con los **16 tests obligatorios** de autorización, aislamiento, unanimidad, revocación y defensa contra *prompt injection*. |

---

## 4. Bugs Corregidos (5/5)
1. **Comunidad "pegada" en `MyCommunityScreen.tsx` (P0.1):** Ahora cambia instantáneamente al cambiar `currentUser` (Aura → Sierra; Faustina → Afro; Sofía/Carlos → estado sin membresía verificada).
2. **Filtración de borradores IA entre comunidades en `CustodianPanelScreen.tsx` y `Navbar.tsx` (P0.2):** Mamo Senen solo ve borradores de Sierra Nevada (`Derivados IA: 2`) y jamás ve los de Afrocaribe; Faustina Palacios solo ve los de Afrocaribe (`Derivados IA: 1`) y jamás ve los de Sierra Nevada.
3. **Ambigüedad entre `community` y `restricted` (P0.3):** `community` exige membresía `verified`; `restricted` exige un `AccessGrant` explícito vigente y no revocado.
4. **Sobreposición de etiquetas en fotos de tarjetas y textos cortados (P1.7):** Las regiones y nombres de comunidades ahora se ubican en el cuerpo de la tarjeta, sin chocar con la insignia *"Tu Comunidad Verificada"* ni con los rótulos de las fotografías institucionales.
5. **Avatares genéricos de Unsplash (P1.6 - Opción B):** Sustituidos por 6 retratos reales recortados de tus fotografías locales de la Sierra Nevada y del campus de UNIMAGDALENA en `public/assets/avatars/`.

---

## 5. Funciones REALES vs. Funciones SIMULADAS y Riesgos Abiertos

- **Funciones REALES (Implementadas en código):**
  - Motor de autorización centralizado por objeto y rol territorial (`src/domain/authorization.ts`).
  - Aislamiento estricto de bandejas de custodia y unanimidad multicomunidad (`every`).
  - Revocación en vivo de permisos de IA con bloqueo inmediato en Ceiba.
  - Consulta en **Ceiba** con verificación previa de permisos, sanitización contra *prompt injection*, tarjetas de citas clicables y negativa honesta (`NO_EVIDENCE`).
  - Flujo **"Transformar para enseñar"** que genera borradores (`draft_pending_review`, `public = false`) enviados a la cola del custodio titular.
  - Separación arquitectónica entre el módulo de Bienestar (`wellnessService.ts`) y el repositorio de saberes/Ceiba.
- **Funciones SIMULADAS (Adaptadores locales para demostración):**
  - Persistencia en `localStorage` detrás de `src/services/*` (lista para conectarse al backend REST/PostgreSQL de tu compañero).
  - Perfiles, comunidades y relatos culturales ficticios de demostración académica.
- **Riesgos que siguen abiertos hasta conectar el Backend:**
  - Como toda aplicación SPA que aún opera con adaptador en cliente, la seguridad definitiva en producción requiere que el backend implemente las mismas reglas de `src/domain/authorization.ts` y las políticas RLS de [docs/BACKEND_CONTRACT_AND_SCHEMA.sql](file:///c:/Users/Unimagdalena/Documents/Referencias%20para%20cualquier%20diapositiva%20en%20general/prototipo-aluna-ia/docs/BACKEND_CONTRACT_AND_SCHEMA.sql).

---

## 6. Resultado Exacto de `test`, `typecheck`, `lint` y `build`

- **`npm test` (`node --test src/tests/authorization.test.ts`):** **16 / 16 pruebas aprobadas (`pass 16, fail 0`)** en `111 ms`.
- **`npm run typecheck` (`tsc -b`):** **0 errores** (Código de salida `0`).
- **`npm run lint` (`oxlint`):** **0 errores** (Código de salida `0`).
- **`npm run build` (`tsc -b && vite build`):** **Compilación exitosa en `1.17s`** (`dist/index.html`, `dist/assets/index-Ca_WhIGG.css`, `dist/assets/index-CIUReFSW.js`).

---

## 7. Variables de Entorno (`.env.example`, sin secretos reales)
```dotenv
VITE_APP_NAME="ALUNA IA — SABIA & CEIBA"
VITE_API_BASE_URL="/api/v1"
VITE_ENABLE_DEMO_PROFILES="true"
```
*(Ninguna API key privada de proveedores LLM se expone en variables `VITE_*`).*

---

## 8. Ruta Manual de Sustentación (Paso a Paso en Vivo)
1. **Inicio (`WelcomeScreen`):** Mostrar el lema institucional y hacer clic en **"Iniciar Sesión / Perfiles"**.
2. **Entrar como Aura Villafaña (Integrante Sierra verificada):** Ir a **Biblioteca**, abrir *"Prácticas de siembra en terrazas"* y mostrar el bloque **"Origen y condiciones de uso"**.
3. **Pregúntale a Ceiba:** Pulsar la pregunta sugerida sobre la fase lunar menguante (mostrar respuesta + tarjeta de cita clicable) y luego pulsar el botón ámbar de **pregunta fuera de fuente** (fertilizantes NPK) para demostrar que **Ceiba se niega a inventar**.
4. **Transformar para enseñar:** Cambiar a la pestaña **"2. Transformar para enseñar"**, elegir *Jóvenes / Inicial / Guía de aprendizaje* y pulsar **"Generar borrador y enviar a revisión de custodia"**.
5. **Demostrar aislamiento entre custodios:** Desde el menú de usuario arriba a la derecha, cambiar a **Mamo Senen (Custodio Sierra)** → abrir **Custodia** → ver y aprobar el borrador de Sierra. Luego cambiar a **Faustina Palacios (Custodia Afro)** y mostrar que **en su bandeja solo aparece el borrador Afro y jamás los de la Sierra**.
