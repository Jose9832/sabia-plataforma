# ALUNA IA · SABIA & CEIBA

**Plataforma de diálogo de saberes de la Universidad del Magdalena** (Acuerdo Superior N.º 06 del 30 de abril de 2026).

- **SABIA** guarda y gobierna los saberes de cada comunidad: lectura *pública, comunitaria, restringida o privada*, custodia territorial por comunidad y publicación por **consenso** cuando un saber pertenece a varias comunidades.
- **CEIBA** consulta y transforma con IA **solo lo autorizado**, siempre con citas, sin inventar y sin hablar en nombre de ninguna comunidad.
- **Salud SABIA** (módulo de Bienestar) acompaña a comunidades indígenas, afrodescendientes y campesinas: primeros auxilios, plantas, partería, rutas de derechos, alertas veredales, cuaderno de cuentas, lectura en voz alta, dictado y la guía **Kora**. Funciona **sin internet** y sus datos están **aislados** del repositorio cultural y de Ceiba.

---

## Tabla de contenido

1. [Arquitectura y carpetas](#arquitectura-y-carpetas)
2. [Levantar todo con Docker](#levantar-todo-con-docker)
3. [Perfiles de demostración](#perfiles-de-demostración)
4. [Los 7 escenarios de evaluación](#los-7-escenarios-de-evaluación)
5. [Gobernanza y permisos](#gobernanza-y-permisos)
6. [Funcionamiento sin conexión](#funcionamiento-sin-conexión)
7. [API REST v1](#api-rest-v1)
8. [Desarrollo sin Docker](#desarrollo-sin-docker)
9. [Pruebas](#pruebas)
10. [Producción](#producción)

---

## Arquitectura y carpetas

El proyecto está separado en **tres carpetas independientes**, cada una con su propio Dockerfile:

```
sabia-plataforma/
├── frontend/   React 19 + Vite + TypeScript + Tailwind (diseño institucional ALUNA) · PWA
│   └── src/
│       ├── screens/            Bienvenida, Biblioteca, Comunidades, Mi Territorio, Laboratorio Ceiba,
│       │                       Panel de Custodia, Aportar saber, Permisos, Solicitudes, Perfil, Bienestar…
│       ├── context/AlunaContext.tsx   Estado conectado a la API (optimista + cola offline)
│       ├── domain/authorization.ts    Reglas de permisos (la interfaz las refleja; el servidor decide)
│       ├── services/apiClient.ts      Cliente HTTP + cola de envíos sin señal
│       └── modules/salud/             Módulo de Salud SABIA (estilos aislados bajo .sabia-modulo)
├── backend/    Python 3.12 + FastAPI + SQLAlchemy 2 + Pydantic + JWT/bcrypt
│   └── app/
│       ├── routers/aluna.py           /api/v1 (auth, saberes, custodia, Ceiba, bienestar)
│       ├── routers/{contenido,finca,participa}.py   /api/v1/salud (módulo de Salud)
│       ├── domain/autorizacion.py     Gobernanza del lado del servidor (espejo de authorization.ts)
│       ├── domain/ceiba.py            Consulta con citas, anti prompt-injection, transformación
│       ├── services/ · models/ · schemas/ · core/ · seed.py
├── database/   PostgreSQL 16: migraciones (Alembic), semillas, esquema, RLS y respaldos
├── docs/       Guía de integración del equipo, reporte final y README del prototipo original
└── docker-compose.yml
```

```
 Navegador (PWA)                 backend (FastAPI)                     database (PostgreSQL 16)
 ┌────────────────────┐  /api   ┌────────────────────────────┐  SQL   ┌──────────────────────────┐
 │ ALUNA + Salud SABIA│ ──────► │ autoriza → recupera → cita │ ─────► │ users · communities ·    │
 │ Service Worker     │ ◄────── │ JWT · bcrypt · auditoría   │        │ knowledges · approvals · │
 │ caché + cola local │  JSON   │ Ceiba determinista (sin    │        │ ai_generations · salud…  │
 └────────────────────┘         │ proveedores externos)      │        └──────────────────────────┘
       nginx :8080                     uvicorn :8000                         :5432
```

---

## Levantar todo con Docker

Requisito: **Docker Desktop**.

```bash
git clone https://github.com/Jose9832/sabia-plataforma.git
cd sabia-plataforma
docker compose up -d --build
```

| Servicio | URL |
|---|---|
| Aplicación web (PWA) | http://localhost:8080 |
| Documentación interactiva de la API | http://localhost:8000/api/docs |
| Chequeo de salud | http://localhost:8000/api/v1/health |
| PostgreSQL | `localhost:5432` · base `sabia` · usuario `sabia` |

Al arrancar, el backend aplica las migraciones de `database/migrations` y carga `database/seeds` (sin duplicar).

```bash
docker compose ps                 # estado
docker compose logs -f backend    # registros de la API
docker compose down               # detener (los datos se conservan)
docker compose down -v            # detener y borrar la base (vuelve a sembrarse al subir)
```

Variables opcionales: copia `.env.example` a `.env` en la raíz (contraseña de Postgres, `SECRET_KEY`, puertos, `ENABLE_DEMO_PROFILES`).

---

## Perfiles de demostración

Se cambian desde el menú de usuario (arriba a la derecha) o se inicia sesión con correo y la contraseña **`aluna2026`**.

| Perfil | Correo | Qué demuestra | Salud SABIA |
|---|---|---|---|
| Sofía Ramos · Visitante | `sofia.ramos@correo.com` | Solo ve saberes públicos | Puerta *Conocer* |
| Carlos Mendoza · Investigador | `cmendoza@unimagdalena.edu.co` | Filiación **pendiente**: solicita accesos y propone saberes | Puerta *Conocer* |
| Aura Villafaña · Integrante Sierra Nevada | `aura.villafana@sierra-nevada.org` | Lee lo comunitario, consulta a Ceiba, transforma para enseñar | Versión indígena |
| Mamo Senen · Custodio Sierra Nevada | `custodia.sierra@alunaia.co` | Aprueba solo trámites de **su** comunidad | Versión indígena |
| Faustina Palacios · Custodia Afrocaribe | `custodia.afro@alunaia.co` | Frontera de autoridad (no decide sobre Sierra) | Versión afro |
| Patrón Marino · Custodio Taganga | `pesca.taganga@alunaia.co` | Co-aprueba el saber mancomunado | Versión territorial/campesina |

Desde el registro también se pueden crear cuentas reales: la vinculación a una comunidad queda **pendiente** hasta que su custodia la apruebe.

---

## Los 7 escenarios de evaluación

| # | Escenario | Cómo probarlo |
|---|---|---|
| 1 | Laboratorio dinámico | Aura → Ceiba IA: alterna *Terrazas*, *Cantos de Boga* y *Vientos y Mareas*; cambian preguntas, citas y materiales |
| 2 | Identidades y permisos | Cambia de perfil: la Biblioteca y la Matriz de Permisos se recalculan con lo que devuelve el servidor |
| 3 | Aporte externo y solicitud | Carlos solicita acceso a *Terrazas* → Mamo Senen lo otorga en el Panel de Custodia → Carlos ya puede leerlo |
| 4 | Frontera de autoridad | Faustina intenta resolver trámites de Sierra Nevada: el servidor responde 403 |
| 5 | Bloqueo soberano de IA | *Acuerdos internos* (privado, IA no permitida): Ceiba se niega con `AI_NOT_ALLOWED` |
| 6 | Consenso intercomunitario | *Cuencas compartidas* (Sierra + Taganga) se publica solo cuando Patrón Marino también aprueba |
| 7 | Derivados pedagógicos | *Transformar para enseñar* crea un borrador que solo la custodia titular puede aprobar |

---

## Gobernanza y permisos

- **Identidad ≠ pertenencia ≠ custodia.** Ser investigador no da acceso comunitario; una filiación *pendiente* no cuenta; un custodio solo decide sobre su comunidad. No existe un "administrador cultural universal".
- **El servidor decide.** `backend/app/domain/autorizacion.py` replica `frontend/src/domain/authorization.ts` y se aplica en cada endpoint. Lo que no puedes leer viaja **sin contenido** (solo título y descripción), así que no se filtra por la API.
- **Ceiba** autoriza antes de recuperar, neutraliza instrucciones incrustadas en las fuentes (*prompt injection*), responde con citas o se niega con un motivo (`NO_READ_PERMISSION`, `AI_NOT_ALLOWED`, `AI_PERMISSION_REVOKED`, `NO_EVIDENCE`, `PROMPT_INJECTION_BLOCKED`). Las claves de proveedores de IA, si algún día se usan, van solo en `backend/.env`, nunca en `VITE_*`.
- **Trazabilidad:** cada decisión de custodia, permiso de IA y consulta queda en `audit_events`.
- **Salud aislada:** el módulo de Bienestar usa `/api/v1/salud` y sus propias tablas; nada de salud entra al repositorio de saberes ni a Ceiba (minimización de datos, Ley 1581 de 2012). La versión del módulo depende de la membresía **verificada** (Sierra → indígena, Afro → afro, campesinos/pescadores/palafitos → territorial).
- **RLS opcional:** `database/schema/politicas_rls.sql` añade una segunda barrera en PostgreSQL para quien se conecte directo a la base.

---

## Funcionamiento sin conexión

1. **La app se instala (PWA):** el Service Worker guarda HTML, JS, CSS, logos y retratos; las fotos del territorio se guardan al verlas.
2. **Lectura:** ALUNA guarda la última copia del estado del servidor; el módulo de Salud guarda cada consulta en IndexedDB y trae un respaldo para el primer uso sin señal.
3. **Escritura:** solicitudes, aprobaciones, aportes, derivados IA, alertas, reportes, trueques y gastos se aplican al instante en pantalla y, si no hay señal, quedan en una **cola local**. Al volver la conexión se envían solos (el menú de usuario muestra cuántos están *en cola*). Cada envío lleva un id generado en el teléfono, así que **nunca se duplica**.
4. **Ceiba sin señal:** responde el motor local de respaldo, solo sobre fuentes ya autorizadas en el teléfono, y marca la respuesta como de respaldo.

> El Service Worker se registra en navegadores reales (Chrome, Edge, Firefox, Safari) sobre `localhost` o HTTPS. Revísalo en *DevTools → Application*.

---

## API REST v1

Documentación completa en **http://localhost:8000/api/docs**.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/auth/login` · `/auth/register` · `/auth/demo/{perfil}` · `/auth/logout` | Sesión (JWT, contraseñas con bcrypt) |
| `GET` | `/api/v1/me` · `/api/v1/bootstrap` | Persona actual · estado inicial filtrado por permisos |
| `GET` | `/api/v1/communities` · `/communities/{id}` | Comunidades y políticas |
| `GET/POST` | `/api/v1/knowledges` · `/knowledges/{id}` | Catálogo, detalle (sin contenido si no hay permiso) y aportes |
| `POST` | `/api/v1/knowledges/{id}/access-requests` | Solicitar acceso a la custodia |
| `POST` | `/api/v1/knowledges/{id}/decisions` | Aprobar o rechazar **por comunidad** (consenso) |
| `GET` | `/api/v1/access-requests/me` · `/custody/review-queue` | Mis solicitudes · bandeja del custodio |
| `POST` | `/api/v1/access-requests/{id}/decisions` | Otorgar o declinar (crea `access_grant`) |
| `POST` | `/api/v1/affiliations` · `/affiliations/{id}/decisions` | Vinculación comunitaria |
| `POST` | `/api/v1/permissions/{id}/grant-ai` · `/permissions/{id}/revoke` | Habilitar o revocar IA |
| `POST` | `/api/v1/ai/query` · `/ai/transform` · `/ai/outputs` | Ceiba: consulta con citas, transformación, derivados |
| `POST` | `/api/v1/ai/outputs/{id}/decisions` | Custodia aprueba o rechaza un derivado |
| `GET/POST` | `/api/v1/wellness/channels` · `/wellness/orientations` | Bienestar (aislado) |
| `*` | `/api/v1/salud/...` | Módulo de Salud SABIA (relatos, lugares, plantas, finca, alertas, reportes, `POST /salud/sync`) |
| `POST` | `/api/v1/demo/reset` | Restablece la demostración (solo con perfiles demo activos) |

---

## Desarrollo sin Docker

```bash
# Base de datos
docker compose up -d db

# Backend
cd backend
python -m venv .venv && .venv\Scripts\activate      # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic -c ../database/alembic.ini upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000

# Frontend (otra terminal)
cd frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:5173  (Vite reenvía /api al backend)
```

---

## Pruebas

```bash
# Backend: 18 pruebas (permisos, Ceiba, anti-inyección, validaciones)
docker compose run --rm --no-deps --entrypoint "python -m pytest -q" backend

# Frontend: 16 pruebas de gobernanza + tipos + compilación
cd frontend && npm test && npm run typecheck && npm run build
```

Las pruebas del backend usan los mismos datos demo que las del frontend, para garantizar que la interfaz y el servidor deciden igual.

---

## Publicar en internet (Render)

El repositorio trae un **Blueprint** (`render.yaml`) que crea la base de datos y la aplicación con un clic. `Dockerfile.render` compila el frontend y lo sirve desde la misma API, así que todo queda en **un solo enlace**.

1. Entra a [render.com](https://render.com) con tu cuenta de GitHub.
2. **New → Blueprint** → elige el repositorio `sabia-plataforma` (si no aparece, da acceso al repositorio en *Configure GitHub App*).
3. Revisa que aparezcan `aluna-db` (Postgres) y `aluna-sabia-ceiba` (web) y pulsa **Apply**.
4. Cuando termine (5–10 min la primera vez), abre el enlace `https://aluna-sabia-ceiba….onrender.com` y compártelo.

Cada `git push` a `main` vuelve a publicar la app. En el plan gratis la app se duerme tras 15 min sin visitas (la primera carga tarda ~1 min) y la base gratuita vence a los 30 días.

## Producción

- Define `SECRET_KEY`, `POSTGRES_PASSWORD` y `CORS_ORIGINS` reales y pon `ENABLE_DEMO_PROFILES=false` (oculta el selector de perfiles y desactiva `/auth/demo` y `/demo/reset`).
- Sirve por **HTTPS** (necesario para el Service Worker, el micrófono y la instalación de la PWA).
- `SEED_ON_START=false` si no quieres los datos de ejemplo.
- Respaldos: `.\database\scripts\respaldar.ps1` y `.\database\scripts\restaurar.ps1`.

---

## Cuidado cultural y alcance

- Todos los perfiles, relatos y comunidades de la demostración son **ficticios o de ejemplo**; no hay saberes sagrados reales ni datos médicos de personas.
- El conocimiento de plantas está pendiente de validación con mayores y sabedoras y **no reemplaza la consulta médica**.
- Los archivos adjuntos de los aportes (audio, video, PDF) todavía se simulan en el navegador; el almacenamiento de archivos (`assets`) es el siguiente paso de la hoja de ruta.
- Créditos del diseño y del modelo de gobernanza: equipo del Seminario Taller ALUNA IA (ver `docs/`).
