"""ALUNA IA · SABIA & CEIBA — API REST (FastAPI).

- /api/v1/...        Plataforma ALUNA: saberes, comunidades, custodia, permisos y Ceiba IA.
- /api/v1/salud/...  Módulo de Salud SABIA (offline-first): datos aislados del repositorio
                     cultural y de Ceiba (minimización de datos sensibles, Ley 1581 de 2012).
"""
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.database import SessionLocal
from app.routers import aluna, contenido, finca, participa
from app.services.comun import ErrorNegocio

app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description=(
        "Plataforma de diálogo de saberes de la Universidad del Magdalena. **SABIA** guarda y gobierna los "
        "saberes de cada comunidad (lectura pública, comunitaria, restringida o privada, con custodia territorial "
        "y aprobación por consenso); **CEIBA** consulta y transforma solo lo autorizado, con citas. "
        "El módulo de **Salud SABIA** (`/api/v1/salud`) funciona sin internet y mantiene sus datos aislados."
    ),
    # En producción la documentación interactiva queda apagada (ENABLE_DOCS=true la vuelve a mostrar).
    docs_url="/api/docs" if settings.docs_habilitada else None,
    redoc_url="/api/redoc" if settings.docs_habilitada else None,
    openapi_url="/api/openapi.json" if settings.docs_habilitada else None,
)

# Cabeceras de seguridad en todas las respuestas. La CSP solo aplica a las páginas HTML.
CABECERAS_SEGURIDAD = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)",
    "Cross-Origin-Opener-Policy": "same-origin",
}
CSP = (
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob: data:; "
    "connect-src 'self'; worker-src 'self'; "
    "frame-src https://www.youtube-nocookie.com https://open.spotify.com https://maps.google.com https://www.google.com; "
    "manifest-src 'self'; frame-ancestors 'none'; base-uri 'self'; "
    "form-action 'self'; object-src 'none'"
)


@app.middleware("http")
async def cabeceras_de_seguridad(request: Request, call_next):
    respuesta = await call_next(request)
    for nombre, valor in CABECERAS_SEGURIDAD.items():
        respuesta.headers.setdefault(nombre, valor)
    if request.url.scheme == "https":
        respuesta.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    if respuesta.headers.get("content-type", "").startswith("text/html") and not request.url.path.startswith("/api/"):
        respuesta.headers.setdefault("Content-Security-Policy", CSP)
    return respuesta

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ErrorNegocio)
async def error_negocio(_: Request, exc: ErrorNegocio):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.mensaje})


@app.exception_handler(RequestValidationError)
async def error_validacion(_: Request, exc: RequestValidationError):
    """Devuelve el primer error en lenguaje claro (la app lo muestra tal cual)."""
    errores = exc.errors()
    mensaje = str(errores[0].get("msg", "Datos no válidos")).removeprefix("Value error, ") if errores else "Datos no válidos"
    detalle = [{"loc": list(e.get("loc", [])), "msg": str(e.get("msg", ""))} for e in errores]
    return JSONResponse(status_code=422, content={"detail": mensaje, "errores": detalle})


for r in aluna.routers:
    app.include_router(r, prefix="/api/v1")
for r in (contenido.router, finca.router, participa.router):
    app.include_router(r, prefix="/api/v1/salud")


@app.get("/api/v1/health", tags=["Sistema"])
def salud_del_servicio():
    """Chequeo de vida (lo usan Docker y el frontend para saber si hay conexión con el servidor)."""
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"estado": "ok", "servicio": "aluna-api"}


# ---------------------------------------------------------------------------
# Despliegue en un solo servicio (Render): la API también sirve la PWA compilada.
# En Docker Compose esto queda apagado y las páginas las sirve nginx.
# ---------------------------------------------------------------------------
if settings.FRONTEND_DIR and Path(settings.FRONTEND_DIR).is_dir():
    from fastapi import HTTPException
    from fastapi.staticfiles import StaticFiles
    from starlette.exceptions import HTTPException as StarletteHTTPException

    class PaginaUnica(StaticFiles):
        """Sirve los archivos del frontend; cualquier otra ruta devuelve index.html (SPA)."""

        async def get_response(self, path: str, scope):
            if path.startswith("api/"):
                raise HTTPException(status_code=404, detail="Recurso de la API no encontrado.")
            try:
                respuesta = await super().get_response(path, scope)
            except StarletteHTTPException as e:
                if e.status_code != 404:
                    raise
                respuesta = await super().get_response("index.html", scope)
            if path in ("sw.js", "registerSW.js", "manifest.webmanifest", "index.html", ""):
                respuesta.headers["Cache-Control"] = "no-cache"
            elif path.startswith("assets/"):
                respuesta.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return respuesta

    app.mount("/", PaginaUnica(directory=settings.FRONTEND_DIR, html=True), name="frontend")
