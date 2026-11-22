"""ALUNA IA · SABIA & CEIBA — API REST (FastAPI).

- /api/v1/...        Plataforma ALUNA: saberes, comunidades, custodia, permisos y Ceiba IA.
- /api/v1/salud/...  Módulo de Salud SABIA (offline-first): datos aislados del repositorio
                     cultural y de Ceiba (minimización de datos sensibles, Ley 1581 de 2012).
"""
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
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

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
