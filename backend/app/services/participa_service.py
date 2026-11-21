"""Participa: inscripción a encuentros, investigación con la comunidad y reportes de derechos."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Encuentro,
    Inscripcion,
    Investigacion,
    ReporteDerechos,
    SolicitudInvestigacion,
    Usuario,
    Visibilidad,
)
from app.schemas.comunidad import InscripcionCrear, MisRegistrosOut, ParticipacionCrear, ReporteCrear
from app.services.comun import ErrorNegocio, buscar_por_client_id, campos_sync
from app.services.finca_service import mis_trueques


def inscribirse(db: Session, usuario: Usuario, datos: InscripcionCrear, offline: bool = False) -> tuple[Inscripcion, bool]:
    if existente := buscar_por_client_id(db, Inscripcion, datos.client_id):
        return existente, True
    encuentro = db.get(Encuentro, datos.encuentro_id)
    if not encuentro:
        raise ErrorNegocio("Ese encuentro ya no existe.", 404)
    if encuentro.comunidad != usuario.comunidad and encuentro.visibilidad != Visibilidad.afuera:
        raise ErrorNegocio("Este encuentro es solo para su comunidad.", 403)
    previa = db.scalar(select(Inscripcion).where(
        Inscripcion.usuario_id == usuario.id, Inscripcion.encuentro_id == encuentro.id))
    if previa:
        return previa, True
    insc = Inscripcion(usuario_id=usuario.id, encuentro_id=encuentro.id,
                       **campos_sync(datos.client_id, datos.creado_en_cliente, offline))
    db.add(insc)
    db.flush()
    return insc, False


def participar_investigacion(
    db: Session, usuario: Usuario, datos: ParticipacionCrear, offline: bool = False
) -> tuple[SolicitudInvestigacion, bool]:
    if existente := buscar_por_client_id(db, SolicitudInvestigacion, datos.client_id):
        return existente, True
    inv = db.get(Investigacion, datos.investigacion_id)
    if not inv:
        raise ErrorNegocio("Esa investigación ya no existe.", 404)
    if usuario.comunidad.value not in inv.comunidades:
        raise ErrorNegocio("Esta investigación no es con tu comunidad.", 403)
    previa = db.scalar(select(SolicitudInvestigacion).where(
        SolicitudInvestigacion.usuario_id == usuario.id, SolicitudInvestigacion.investigacion_id == inv.id))
    if previa:
        return previa, True
    sol = SolicitudInvestigacion(usuario_id=usuario.id, investigacion_id=inv.id, acepta_derechos=True,
                                 **campos_sync(datos.client_id, datos.creado_en_cliente, offline))
    db.add(sol)
    db.flush()
    return sol, False


def crear_reporte(db: Session, usuario: Usuario, datos: ReporteCrear, offline: bool = False) -> tuple[ReporteDerechos, bool]:
    if existente := buscar_por_client_id(db, ReporteDerechos, datos.client_id):
        return existente, True
    if datos.tipo in ("via", "servicios", "ambiente") and usuario.comunidad.value != "campesina":
        raise ErrorNegocio("Ese tipo de reporte es para la comunidad campesina.", 422)
    reporte = ReporteDerechos(
        usuario_id=usuario.id,
        comunidad=usuario.comunidad,
        tipo=datos.tipo,
        tiene_audio=datos.tiene_audio,
        foto=datos.foto,
        **campos_sync(datos.client_id, datos.creado_en_cliente, offline),
    )
    db.add(reporte)
    db.flush()
    return reporte, False


def mis_reportes(db: Session, usuario: Usuario) -> list[ReporteDerechos]:
    q = select(ReporteDerechos).where(ReporteDerechos.usuario_id == usuario.id).order_by(ReporteDerechos.id.desc())
    return list(db.scalars(q))


def mis_registros(db: Session, usuario: Usuario) -> MisRegistrosOut:
    insc = db.scalars(select(Inscripcion.encuentro_id).where(Inscripcion.usuario_id == usuario.id))
    inv = db.scalars(select(SolicitudInvestigacion.investigacion_id).where(SolicitudInvestigacion.usuario_id == usuario.id))
    return MisRegistrosOut(inscripciones=list(insc), investigaciones=list(inv), trueques=mis_trueques(db, usuario))
