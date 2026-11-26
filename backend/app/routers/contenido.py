"""Contenido de lectura. `ventana=adentro` exige sesión y filtra por la comunidad; `afuera` es público."""
from typing import Literal

from fastapi import APIRouter, Query, status

from app.core.deps import DbDep, UsuarioDep, UsuarioOpcionalDep
from app.models import Comunidad
from app.schemas.contenido import (
    EncuentroOut,
    HistoriaOut,
    InvestigacionOut,
    LugarOut,
    PlantaCrear,
    PlantaOut,
    PodcastCrear,
    PodcastOut,
    RelatoOut,
)
from app.services import contenido_service as svc

router = APIRouter(tags=["Salud SABIA · Contenido"])
VentanaQ = Query("afuera", description="adentro = Mi comunidad (requiere sesión) · afuera = Conocer")


@router.get("/relatos", response_model=list[RelatoOut])
def relatos(db: DbDep, usuario: UsuarioOpcionalDep, ventana: Literal["adentro", "afuera"] = VentanaQ):
    return svc.listar_relatos(db, usuario, ventana)


@router.get("/podcasts", response_model=list[PodcastOut])
def podcasts(db: DbDep, usuario: UsuarioOpcionalDep, ventana: Literal["adentro", "afuera"] = VentanaQ):
    return svc.listar_podcasts(db, usuario, ventana)


@router.post("/podcasts", response_model=PodcastOut, status_code=status.HTTP_201_CREATED)
def conectar_podcast(datos: PodcastCrear, db: DbDep, usuario: UsuarioDep):
    podcast, _ = svc.crear_podcast(db, usuario, datos)
    db.commit()
    return podcast


@router.get("/lugares", response_model=list[LugarOut])
def lugares(db: DbDep, categoria: Literal["hospital", "rural"] | None = None):
    """Hospitales de Santa Marta (`hospital`) y puestos de salud rurales (`rural`)."""
    return svc.listar_lugares(db, categoria)


@router.get("/plantas", response_model=list[PlantaOut])
def plantas(
    db: DbDep,
    usuario: UsuarioOpcionalDep,
    comunidad: Comunidad | None = None,
    q: str | None = Query(None, max_length=80, description="Busca por nombre, nombre nativo o dolencia (p. ej. «tos»)"),
):
    """Botiquín de plantas. Sin sesión solo lo compartido «afuera»; el integrante verificado ve además lo de su comunidad."""
    return svc.listar_plantas(db, usuario, comunidad, q)


@router.post("/plantas", response_model=PlantaOut, status_code=status.HTTP_201_CREATED)
def aportar_planta(datos: PlantaCrear, db: DbDep, usuario: UsuarioDep):
    """Aporta una planta a la comunidad verificada de la persona. Queda «sin validar» hasta que los mayores la revisen."""
    planta, _ = svc.crear_planta(db, usuario, datos)
    db.commit()
    return planta


@router.get("/historias", response_model=list[HistoriaOut])
def historias(db: DbDep):
    return svc.listar_historias(db)


@router.get("/encuentros", response_model=list[EncuentroOut])
def encuentros(db: DbDep, usuario: UsuarioOpcionalDep, ventana: Literal["adentro", "afuera"] = VentanaQ):
    return svc.listar_encuentros(db, usuario, ventana)


@router.get("/investigaciones", response_model=list[InvestigacionOut])
def investigaciones(db: DbDep, usuario: UsuarioOpcionalDep):
    return svc.listar_investigaciones(db, usuario)
