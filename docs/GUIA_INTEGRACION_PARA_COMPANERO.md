# Guía Rápida de Integración (Frontend + Backend + Módulo de Salud)
## Proyecto ALUNA I.A. — Módulo SABIA & CEIBA (UNIMAGDALENA)

¡Hola! Este paquete contiene el código fuente completo, depurado y verificado de **ALUNA I.A. (SABIA & CEIBA)** listo para que puedas:
1. Integrar tu **Módulo de Salud / Bienestar**.
2. Conectar el **Backend / Base de Datos (API REST o Supabase/PostgreSQL)**.
3. Realizar ajustes o añadir funcionalidades adicionales conservando los perfiles, permisos comunitarios y el diseño institucional aprobado (`alunaia.co` — Acuerdo Superior N.º 06 del 30 de abril de 2026).

---

## 1. Cómo encender el proyecto en tu computador (30 segundos)

1. Abre una terminal dentro de la carpeta `prototipo-aluna-ia`:
   ```bash
   cd prototipo-aluna-ia
   npm install
   npm run dev
   ```
2. Abre en tu navegador: `http://localhost:5173/`
3. Comandos de verificación ya configurados en `package.json`:
   - `npm test` → Ejecuta los **16 tests automatizados** de seguridad, aislamiento entre comunidades y permisos de Ceiba (`16/16 pass`).
   - `npm run typecheck` → Verifica tipos de TypeScript (`tsc -b`).
   - `npm run lint` → Ejecuta el linter (`oxlint`).
   - `npm run build` → Compila la aplicación lista para producción en la carpeta `dist/`.

---

## 2. Cómo integrar tu Módulo de Salud / Bienestar

La arquitectura sigue el patrón **Misma App Shell, Datos Separados** (por privacidad de datos sensibles de salud bajo la Ley 1581 de 2012):

### ¿Qué comparte tu módulo de Salud con SABIA?
- **La barra de navegación (`Navbar`), el pie de página (`Footer`), el Login y el Tema Claro/Oscuro.**
- **El usuario autenticado activo:** Desde cualquier componente de tu módulo de Salud puedes obtener el usuario actual y sus comunidades llamando al hook:
  ```tsx
  import { useAluna } from '../context/AlunaContext';

  const { currentUser, themeMode, showToast } = useAluna();
  ```
- **Dónde colocar tus pantallas de Salud:**
  - Abre [src/screens/WellnessScreen.tsx](./src/screens/WellnessScreen.tsx). Ahí ya está conectada la vista dentro del menú de la aplicación (`activeScreen === 'wellness'`). Puedes reemplazar o ampliar el contenido de `WellnessScreen.tsx` con tus componentes de Salud.
  - Si tu módulo de Salud tiene un servicio o endpoints propios, conéctalos en [src/services/wellnessService.ts](./src/services/wellnessService.ts).
  - **Regla de oro:** No mezcles historias clínicas o síntomas dentro de `INITIAL_KNOWLEDGE_ITEMS` ni los envíes al servicio de `ceibaService` (`src/services/aiService.ts`), para poder sustentar ante el jurado que **los datos sensibles de salud están aislados del repositorio cultural y del RAG de Ceiba**.

---

## 3. Cómo están organizados los Perfiles y Permisos (Para no romper el aislamiento)

Toda la lógica de permisos ya está centralizada en un único archivo:
- **[src/domain/authorization.ts](./src/domain/authorization.ts)**

Incluye los **6 perfiles preconfigurados** (con sus retratos locales en `public/assets/avatars/`):
1. `user_visitor` — **Sofía Ramos** (Visitante General: solo ve saberes `public`).
2. `user_researcher` — **Carlos Mendoza** (Estudiante Investigador: filiación `pending` en Sierra Nevada; ve `public`, solicita `access_grant` para restringidos y propone saberes).
3. `user_member_sierra` — **Aura Villafaña** (Integrante verificada de Sierra Nevada: ve `public` + `community` de Sierra Nevada, consulta a Ceiba y transforma saberes para enseñar).
4. `user_custodian_sierra` — **Mamo Senen** (Custodio Territorial de Sierra Nevada: solo ve y aprueba trámites y borradores IA de `comm_sierra`).
5. `user_custodian_afro` — **Faustina Palacios** (Custodia Comunitaria del Litoral Afrocaribe: solo ve y aprueba trámites y borradores IA de `comm_afro`).
6. `user_member_pesca` — **Patrón Marino Vásquez** (Custodio Pescador de Taganga: custodia `comm_pescadores` y co-aprueba el saber mancomunado compartido entre Sierra Nevada y Taganga).

### Niveles de acceso implementados:
- `public`: Cualquier usuario si el saber está `approved`.
- `community`: Solo miembros con `status === 'verified'` en al menos una comunidad titular del saber (`communityIds`).
- `restricted`: Exige un permiso explícito (`AccessGrant`) aprobado por el custodio (o ser custodio titular).
- `private`: Solo el autor y los custodios verificados de esa comunidad.

---

## 4. Cómo conectar el Backend (Capa de Servicios y SQL)

No necesitas reescribir las pantallas de React para conectar tu Backend. Toda la comunicación pasa por la carpeta **[src/services/](./src/services/)**:

| Servicio | Archivo | Qué hace / Qué endpoint conectar |
| :--- | :--- | :--- |
| **Autenticación** | `src/services/authService.ts` | Login formal (`POST /api/v1/auth/login`) y control de perfiles demo (`VITE_ENABLE_DEMO_PROFILES`). |
| **Saberes** | `src/services/knowledgeService.ts` | Catálogo filtrado por permisos (`GET /api/v1/knowledges`, `GET /api/v1/knowledges/:id`, `POST /api/v1/knowledges`). |
| **Custodia y Accesos** | `src/services/accessService.ts` | Bandejas aisladas por comunidad del custodio (`GET /api/v1/custody/review-queue`, `POST /api/v1/reviews/:id/decisions`). |
| **Ceiba IA & Transformar** | `src/services/aiService.ts` | Consulta asistida con citas (`POST /api/v1/ai/query`) y transformación pedagógica en borrador (`POST /api/v1/ai/transform`). Incluye el prompt de sistema blindado contra *prompt injection* (`CEIBA_SYSTEM_PROMPT`). |
| **Comunidades** | `src/services/communityService.ts` | Directorio y membresías verificadas (`GET /api/v1/communities`). |
| **Salud / Bienestar** | `src/services/wellnessService.ts` | Servicio independiente para tu módulo de Salud. |

### Esquema de Base de Datos (PostgreSQL / Supabase + RLS)
En el archivo **[docs/BACKEND_CONTRACT_AND_SCHEMA.sql](./docs/BACKEND_CONTRACT_AND_SCHEMA.sql)** tienes listo el script SQL con todas las tablas (`users`, `communities`, `memberships`, `knowledges`, `knowledge_owners`, `ai_permissions`, `access_requests`, `access_grants`, `approvals`, `ai_generations`, `ai_citations`, `audit_events`) y las políticas de Row-Level Security (RLS).

### Variables de Entorno (`.env`)
Copia el archivo `.env.example` a `.env`:
```dotenv
VITE_APP_NAME="ALUNA IA — SABIA & CEIBA"
VITE_API_BASE_URL="/api/v1"
VITE_ENABLE_DEMO_PROFILES="true"
```
*(Si en producción deseas ocultar el selector rápido de perfiles demo, cambia `VITE_ENABLE_DEMO_PROFILES="false"`).*
