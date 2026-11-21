# SABIA · Saberes vivos

**S**aberes, **A**ncestralidad, **B**ioculturalidad e **I**nteligencia **A**rticulada.

Plataforma intercultural para comunidades **indígenas, afrodescendientes y campesinas** de la Sierra Nevada y el Magdalena. Funciona **sin internet** (offline-first), lee en voz alta, entiende el dictado por voz e incluye a **Kora**, una guía que responde sin conexión.

> Piloto · Universidad del Magdalena

---

## Tabla de contenido

1. [Arquitectura](#arquitectura)
2. [Requisitos](#requisitos)
3. [Levantar todo con Docker (recomendado)](#levantar-todo-con-docker-recomendado)
4. [Cuentas de prueba](#cuentas-de-prueba)
5. [Desarrollo local sin Docker](#desarrollo-local-sin-docker)
6. [Cómo funciona el modo sin conexión](#cómo-funciona-el-modo-sin-conexión)
7. [Gobernanza de datos](#gobernanza-de-datos)
8. [API REST](#api-rest)
9. [Base de datos y migraciones](#base-de-datos-y-migraciones)
10. [Pruebas](#pruebas)
11. [Estructura del repositorio](#estructura-del-repositorio)
12. [Despliegue a producción](#despliegue-a-producción)

---

## Arquitectura

```
┌──────────────────────────────┐        ┌─────────────────────────┐       ┌──────────────┐
│ Frontend · PWA               │  /api  │ Backend · FastAPI       │  SQL  │ PostgreSQL 16│
│ React + Vite + TypeScript    │ ─────► │ routers → services →    │ ────► │ (volumen     │
│ Service Worker (Workbox)     │        │ models (SQLAlchemy 2)   │       │  pgdata)     │
│ IndexedDB: caché + cola      │ ◄───── │ JWT · bcrypt · Pydantic │       │              │
│ Web Speech API · Kora        │  JSON  │ Alembic · seed.py       │       │              │
└──────────────────────────────┘        └─────────────────────────┘       └──────────────┘
        nginx :8080                              uvicorn :8000                  :5432
```

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite 6, TypeScript (estricto), zustand, vite-plugin-pwa |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, passlib/bcrypt, PyJWT |
| Base de datos | PostgreSQL 16 |
| Infraestructura | Docker Compose (db + backend + frontend con nginx) |

---

## Requisitos

- **Docker Desktop** (con Docker Compose v2). Es lo único necesario para correr todo.
- Opcional, para desarrollar sin Docker: **Node.js 20+** y **Python 3.12+**.

---

## Levantar todo con Docker (recomendado)

1. Clona el repositorio:

   ```bash
   git clone https://github.com/<tu-usuario>/sabia-plataforma.git
   cd sabia-plataforma
   ```

2. (Opcional) Copia las variables de entorno y cámbialas. Si no lo haces, se usan valores de desarrollo:

   ```bash
   cp .env.example .env
   ```

   > En producción cambia **siempre** `SECRET_KEY` y `POSTGRES_PASSWORD`.

3. Construye y levanta los tres servicios con un solo comando:

   ```bash
   docker compose up -d --build
   ```

   Al arrancar, el backend aplica las migraciones de Alembic y ejecuta `seed.py`, que carga los datos de ejemplo del prototipo (usuarios, relatos, hospitales, plantas, encuentros, investigaciones, semillas y alertas). La carga es idempotente: no duplica nada si reinicias.

4. Abre la aplicación:

   | Servicio | URL |
   |---|---|
   | Aplicación web (PWA) | http://localhost:8080 |
   | Documentación interactiva de la API | http://localhost:8000/api/docs |
   | Chequeo de salud | http://localhost:8000/api/salud |
   | PostgreSQL | `localhost:5432` · base `sabia` · usuario `sabia` |

Comandos útiles:

```bash
docker compose ps                 # estado de los servicios
docker compose logs -f backend    # ver los registros de la API
docker compose down               # detener (los datos se conservan)
docker compose down -v            # detener y BORRAR la base de datos (vuelve a sembrarse al subir)
```

---

## Cuentas de prueba

| Comunidad | Número de identificación | Contraseña |
|---|---|---|
| Indígena | `1001` | `sabia123` |
| Afrodescendiente | `2001` | `sabia123` |
| Campesina | `3001` | `sabia123` |

También puedes crear una cuenta nueva desde **Mi comunidad → elige tu comunidad → Regístrate**. Las contraseñas se guardan con hash **bcrypt**; la sesión usa un **JWT** de 30 días para que la app siga funcionando en el campo sin señal.

---

## Desarrollo local sin Docker

### Backend

```bash
# 1. Solo la base de datos en Docker
docker compose up -d db

# 2. Entorno de Python
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    ·    Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# 3. Migraciones, datos de ejemplo y servidor con recarga automática
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev          # http://localhost:5173  (Vite reenvía /api a http://localhost:8000)
```

Otros comandos: `npm run build` (compila la PWA en `dist/`), `npm run preview`, `npm run typecheck`.

> **Sin Node instalado:** puedes compilar el frontend dentro de Docker con `docker compose build frontend`.

---

## Cómo funciona el modo sin conexión

SABIA está pensada para veredas y resguardos donde la señal va y viene.

1. **La aplicación se instala** (PWA): el Service Worker de Workbox guarda HTML, JS, CSS e íconos. La app abre aunque no haya internet y se puede “Agregar a la pantalla de inicio”.
2. **Lectura sin señal:** cada consulta a la API se guarda en **IndexedDB** (`src/lib/api.ts`). Sin conexión, la app muestra la última copia. En el primer uso sin red muestra los datos de ejemplo de `datos/semilla.json`. Las guías (primeros auxilios, trámites, historia afro, partería…) viajan dentro de la app.
3. **Escritura sin señal:** todo lo que la persona crea —**alertas, reportes de derechos, trueques, semillas, gastos del cuaderno, inscripciones, solicitudes de investigación y podcasts**— entra primero a una **cola en IndexedDB** con un UUID (`src/lib/cola.ts`) y aparece de inmediato en pantalla como *“Esperando señal”*.
4. **Sincronización automática:** al recuperar la conexión (evento `online`, el botón *En línea / Sin conexión* del encabezado o un reintento cada 30 s), la cola se envía completa a **`POST /api/sync`**. El servidor:
   - procesa cada operación en su propio *SAVEPOINT* (si una falla, las demás se guardan);
   - usa el UUID como `client_id` único, así que **un reenvío nunca duplica** registros;
   - marca cada registro con su estado de sincronización (`origen = en_linea | cola_offline`, `creado_en_cliente`, `sincronizado_en`).
5. El encabezado muestra un contador con los envíos pendientes.

**Para probarlo:** entra como `3001`, toca **En línea** para pasar a **Sin conexión**, da una alerta en *Mi finca → Alertas* y vuelve a tocar el indicador: verás *“Hay señal: se enviaron 1 envío(s) guardado(s)”* y la alerta pasa a *Enviada*.

> El Service Worker se registra en navegadores reales (Chrome, Edge, Firefox, Safari) sobre `localhost` o HTTPS. Revísalo en *DevTools → Application → Service Workers*.

---

## Gobernanza de datos

Cada comunidad decide qué comparte. Los relatos, podcasts, encuentros e historias tienen una bandera de **visibilidad**:

- `adentro` → **Solo comunidad**: lo ven únicamente las personas de esa comunidad, con sesión.
- `afuera` → **Compartido**: la comunidad autorizó mostrarlo en la puerta **Conocer**.

El filtro se aplica **en el servidor** (`?ventana=adentro` exige JWT y filtra por la comunidad de la cuenta; `?ventana=afuera` solo devuelve lo compartido). Los reportes de derechos solo los recibe la autoridad de la comunidad (cabildo, consejo comunitario o Junta de Acción Comunal), y Mi finca solo está disponible para la comunidad campesina.

---

## API REST

Documentación completa y probador en **http://localhost:8000/api/docs**.

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/registro` | Crear cuenta (nombre, identificación, contraseña, comunidad) |
| `POST` | `/api/auth/login` | Ingresar; valida que la cuenta sea de la comunidad elegida |
| `GET` | `/api/auth/yo` | Datos de la sesión |
| `GET` | `/api/relatos?ventana=` | Relatos de los mayores (gobernanza adentro/afuera) |
| `GET/POST` | `/api/podcasts` | Podcasts de YouTube/Spotify conectados por la comunidad |
| `GET` | `/api/lugares?categoria=hospital\|rural` | Hospitales y puestos de salud rurales |
| `GET` | `/api/plantas?comunidad=` | Botiquín de plantas |
| `GET` | `/api/historias` | Historias de quién hace cada producto |
| `GET` | `/api/encuentros?ventana=` | Conversatorios, capacitaciones y reuniones |
| `POST` | `/api/encuentros/{id}/inscripcion` | Inscribirse a un encuentro |
| `GET` | `/api/investigaciones` | Investigaciones con la comunidad |
| `POST` | `/api/investigaciones/{id}/participar` | Participar (consentimiento informado) |
| `GET` | `/api/mis-registros` | Inscripciones, investigaciones y trueques propios |
| `GET/POST` | `/api/semillas` | Banco de semillas · `POST /api/semillas/{id}/trueque` |
| `GET/POST` | `/api/alertas` | Alertas veredales (con foto) |
| `GET/PATCH` | `/api/cuentas` | Cuaderno de cuentas · `POST/DELETE /api/cuentas/gastos` · `POST /api/cuentas/reiniciar` |
| `POST` | `/api/reportes` | Reporte de derechos · `GET /api/reportes/mios` |
| `POST` | `/api/sync` | **Cola offline**: recibe y procesa operaciones guardadas sin señal |

Ejemplo de sincronización:

```json
POST /api/sync
Authorization: Bearer <token>
{
  "operaciones": [
    { "id": "6f1c…", "tipo": "alerta", "creado_en": "2026-11-21T15:00:00Z",
      "datos": { "tipo": "derrumbe", "lugar": "Puente de la quebrada", "nota": "No pasan carros" } },
    { "id": "a9d2…", "tipo": "gasto",
      "datos": { "client_id": "c8c0…", "tipo": "Abono", "monto": 50000, "cultivo": "Café" } }
  ]
}
```

Tipos admitidos: `podcast`, `semilla`, `trueque`, `alerta`, `reporte`, `gasto`, `gasto_borrar`, `cuaderno`, `cuentas_reiniciar`, `inscripcion`, `investigacion`.

---

## Base de datos y migraciones

Modelos (en `backend/app/models/`): `Usuario`, `Relato`, `Podcast`, `Lugar`, `Planta`, `HistoriaProducto`, `Encuentro`, `Inscripcion`, `Investigacion`, `SolicitudInvestigacion`, `SemillaTrueque`, `SolicitudTrueque`, `AlertaVeredal`, `ReporteDerechos`, `GastoCosecha` y `CuadernoCosecha`.

```bash
# Crear una migración nueva después de cambiar un modelo
docker compose exec backend alembic revision --autogenerate -m "describe el cambio"
docker compose exec backend alembic upgrade head

# Volver a cargar los datos de ejemplo desde cero
docker compose down -v && docker compose up -d --build
```

Los datos de ejemplo viven en **`datos/semilla.json`**: los usa `seed.py` para poblar PostgreSQL y el frontend como respaldo del primer uso sin señal.

---

## Pruebas

```bash
# Backend (pruebas unitarias)
docker compose run --rm --no-deps --entrypoint "python -m pytest -q" backend
# o, en local:  cd backend && pytest -q

# Frontend (verificación de tipos y compilación)
cd frontend && npm run typecheck && npm run build
```

---

## Estructura del repositorio

```
sabia-plataforma/
├── docker-compose.yml          # db + backend + frontend
├── .env.example                # variables de Compose
├── datos/semilla.json          # datos de ejemplo compartidos
├── backend/
│   ├── Dockerfile · entrypoint.sh · requirements.txt · .env.example
│   ├── alembic.ini · alembic/versions/0001_esquema_inicial_de_sabia.py
│   ├── tests/
│   └── app/
│       ├── main.py             # aplicación FastAPI, CORS y manejo de errores
│       ├── core/               # config, database, security (JWT + bcrypt), deps
│       ├── models/             # SQLAlchemy
│       ├── schemas/            # Pydantic (validación y respuestas)
│       ├── services/           # reglas de negocio y sincronización
│       ├── routers/            # endpoints REST
│       └── seed.py
└── frontend/
    ├── Dockerfile · nginx.conf · vite.config.ts · .env.example
    └── src/
        ├── styles/             # hoja original separada por secciones (01-variables … 11-kora)
        ├── components/icons/   # íconos SVG como componentes (<Icono nombre="salud" />)
        ├── components/         # encabezado, Kora, piezas comunes
        ├── views/              # puertas, acceso, inicio, salud, memoria, ayuda, finca, participa…
        ├── state/store.ts      # navegación, sesión, red, datos y cola (zustand)
        ├── lib/                # api, IndexedDB, cola offline, voz, Kora, utilidades
        └── data/               # contenido de referencia, tipos y respaldo offline
```

---

## Despliegue a producción

- Define `SECRET_KEY`, `POSTGRES_PASSWORD` y `CORS_ORIGINS` reales en `.env`.
- Sirve la aplicación por **HTTPS** (requisito para el Service Worker, el micrófono y la PWA instalable fuera de `localhost`).
- Pon `SEED_ON_START=false` si no quieres los datos de ejemplo.
- Si la API vive en otro dominio, compila el frontend con `VITE_API_URL=https://api.tu-dominio` (argumento de construcción en `frontend/Dockerfile`).

---

## Créditos y cuidado cultural

- Los símbolos de síntomas son **provisionales** y se definirán con la comunidad; las etiquetas en lengua propia se mostrarán cuando esté lista la base lingüística.
- El conocimiento de plantas es tradicional, está **pendiente de validación** con mayores y sabedoras y **no reemplaza la consulta médica**.
- El tejido geométrico de la portada es genérico: no reproduce diseños propios de ninguna comunidad.
