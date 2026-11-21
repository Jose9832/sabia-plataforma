"""SABIA · API REST (FastAPI)."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.database import SessionLocal
from app.routers import auth, contenido, finca, participa
from app.services.comun import ErrorNegocio

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description=(
        "API de SABIA · Saberes, Ancestralidad, Bioculturalidad e Inteligencia Articulada. "
        "Plataforma intercultural offline-first para comunidades indígenas, afrodescendientes "
        "y campesinas de la Sierra Nevada y el Magdalena."
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
    return JSONResponse(status_code=422, content={"detail": mensaje, "errores": jsonable(errores)})


def jsonable(errores: list) -> list:
    return [{"loc": list(e.get("loc", [])), "msg": str(e.get("msg", ""))} for e in errores]


for r in (auth.router, contenido.router, finca.router, participa.router):
    app.include_router(r, prefix="/api")


@app.get("/api/salud", tags=["Sistema"])
def salud():
    """Chequeo de vida: también lo usa el frontend para saber si hay conexión con el servidor."""
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"estado": "ok", "servicio": "sabia-api"}
