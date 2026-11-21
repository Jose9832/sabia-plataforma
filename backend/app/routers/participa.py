"""Participa (encuentros, investigación), reportes de derechos y sincronización offline."""
from uuid import UUID

from fastapi import APIRouter, status

from app.core.deps import DbDep, UsuarioDep
from app.schemas.comunidad import (
    InscripcionCrear,
    MisRegistrosOut,
    ParticipacionCrear,
    ReporteCrear,
    ReporteOut,
)
from app.schemas.sync import PeticionSync, RespuestaSync
from app.services import participa_service as svc
from app.services import sync_service

router = APIRouter(tags=["Participa y derechos"])


@router.post("/encuentros/{encuentro_id}/inscripcion", status_code=status.HTTP_201_CREATED)
def inscribirse(encuentro_id: int, db: DbDep, usuario: UsuarioDep, client_id: UUID | None = None):
    svc.inscribirse(db, usuario, InscripcionCrear(encuentro_id=encuentro_id, client_id=client_id))
    db.commit()
    return {"ok": True, "encuentro_id": encuentro_id}


@router.post("/investigaciones/{investigacion_id}/participar", status_code=status.HTTP_201_CREATED)
def participar(investigacion_id: int, db: DbDep, usuario: UsuarioDep, client_id: UUID | None = None):
    svc.participar_investigacion(
        db, usuario, ParticipacionCrear(investigacion_id=investigacion_id, acepta_derechos=True, client_id=client_id)
    )
    db.commit()
    return {"ok": True, "investigacion_id": investigacion_id}


@router.get("/mis-registros", response_model=MisRegistrosOut)
def mis_registros(db: DbDep, usuario: UsuarioDep):
    """Encuentros, investigaciones y trueques en los que la persona ya está inscrita."""
    return svc.mis_registros(db, usuario)


@router.post("/reportes", response_model=ReporteOut, status_code=status.HTTP_201_CREATED)
def reportar(datos: ReporteCrear, db: DbDep, usuario: UsuarioDep):
    """El reporte solo lo recibe la autoridad de la comunidad (cabildo, consejo comunitario o JAC)."""
    reporte, _ = svc.crear_reporte(db, usuario, datos)
    db.commit()
    return reporte


@router.get("/reportes/mios", response_model=list[ReporteOut])
def mis_reportes(db: DbDep, usuario: UsuarioDep):
    return svc.mis_reportes(db, usuario)


@router.post("/sync", response_model=RespuestaSync, tags=["Sincronización offline"])
def sincronizar(peticion: PeticionSync, db: DbDep, usuario: UsuarioDep):
    """Recibe la cola de acciones guardadas sin señal (alertas, reportes, trueques, gastos…).

    Es idempotente: cada operación trae su UUID y no se duplica si llega dos veces.
    """
    return sync_service.sincronizar(db, usuario, peticion)
