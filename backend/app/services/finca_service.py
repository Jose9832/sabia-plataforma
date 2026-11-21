"""Mi finca (comunidad campesina): banco de semillas, alertas veredales y cuaderno de cuentas."""
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models import AlertaVeredal, Comunidad, CuadernoCosecha, GastoCosecha, SemillaTrueque, SolicitudTrueque, Usuario
from app.schemas.comunidad import (
    AlertaCrear,
    CuadernoActualizar,
    CuentasOut,
    CuentasReiniciar,
    GastoBorrar,
    GastoCrear,
    GastoOut,
    SemillaCrear,
    SemillaOut,
    TruequeCrear,
)
from app.services.comun import ErrorNegocio, buscar_por_client_id, campos_sync, exigir_comunidad, hora_legible


# ---------- Banco de semillas ----------
def _semilla_out(s: SemillaTrueque, usuario: Usuario) -> SemillaOut:
    out = SemillaOut.model_validate(s)
    out.propia = s.usuario_id == usuario.id
    return out


def listar_semillas(db: Session, usuario: Usuario) -> list[SemillaOut]:
    exigir_comunidad(usuario, Comunidad.campesina)
    # Primero las propias y las más nuevas; al final las de ejemplo (como en el prototipo).
    q = select(SemillaTrueque).order_by(SemillaTrueque.es_ejemplo, SemillaTrueque.id.desc())
    return [_semilla_out(s, usuario) for s in db.scalars(q)]


def crear_semilla(db: Session, usuario: Usuario, datos: SemillaCrear, offline: bool = False) -> tuple[SemillaOut, bool]:
    exigir_comunidad(usuario, Comunidad.campesina)
    if existente := buscar_por_client_id(db, SemillaTrueque, datos.client_id):
        return _semilla_out(existente, usuario), True
    semilla = SemillaTrueque(
        usuario_id=usuario.id,
        tipo=datos.tipo,
        variedad=datos.variedad,
        cantidad=datos.cantidad,
        busca=datos.busca.strip() or "Lo que me ofrezcan",
        familia=usuario.nombre,
        vereda="Mi vereda",
        **campos_sync(datos.client_id, datos.creado_en_cliente, offline),
    )
    db.add(semilla)
    db.flush()
    return _semilla_out(semilla, usuario), False


def proponer_trueque(db: Session, usuario: Usuario, datos: TruequeCrear, offline: bool = False) -> tuple[SolicitudTrueque, bool]:
    exigir_comunidad(usuario, Comunidad.campesina)
    if existente := buscar_por_client_id(db, SolicitudTrueque, datos.client_id):
        return existente, True
    semilla = db.get(SemillaTrueque, datos.semilla_id)
    if not semilla:
        raise ErrorNegocio("Esa oferta de semillas ya no existe.", 404)
    if semilla.usuario_id == usuario.id:
        raise ErrorNegocio("No puedes proponer un trueque a tus propias semillas.", 400)
    previa = db.scalar(select(SolicitudTrueque).where(
        SolicitudTrueque.usuario_id == usuario.id, SolicitudTrueque.semilla_id == semilla.id))
    if previa:
        return previa, True
    solicitud = SolicitudTrueque(usuario_id=usuario.id, semilla_id=semilla.id,
                                 **campos_sync(datos.client_id, datos.creado_en_cliente, offline))
    db.add(solicitud)
    db.flush()
    return solicitud, False


def mis_trueques(db: Session, usuario: Usuario) -> list[int]:
    return list(db.scalars(select(SolicitudTrueque.semilla_id).where(SolicitudTrueque.usuario_id == usuario.id)))


# ---------- Alertas veredales ----------
def listar_alertas(db: Session, usuario: Usuario) -> list[AlertaVeredal]:
    exigir_comunidad(usuario, Comunidad.campesina)
    q = select(AlertaVeredal).order_by(AlertaVeredal.sincronizado_en.desc(), AlertaVeredal.id.desc()).limit(100)
    return list(db.scalars(q))


def crear_alerta(db: Session, usuario: Usuario, datos: AlertaCrear, offline: bool = False) -> tuple[AlertaVeredal, bool]:
    exigir_comunidad(usuario, Comunidad.campesina)
    if existente := buscar_por_client_id(db, AlertaVeredal, datos.client_id):
        return existente, True
    alerta = AlertaVeredal(
        usuario_id=usuario.id,
        tipo=datos.tipo,
        lugar=datos.lugar,
        nota=datos.nota.strip(),
        foto=datos.foto,
        hora=datos.hora or hora_legible(datos.creado_en_cliente),
        autor=usuario.nombre,
        **campos_sync(datos.client_id, datos.creado_en_cliente, offline),
    )
    db.add(alerta)
    db.flush()
    return alerta, False


# ---------- Cuaderno de cuentas ----------
def _cuaderno(db: Session, usuario: Usuario) -> CuadernoCosecha:
    cuaderno = db.get(CuadernoCosecha, usuario.id)
    if not cuaderno:
        cuaderno = CuadernoCosecha(usuario_id=usuario.id, cultivo="Café")
        db.add(cuaderno)
        db.flush()
    return cuaderno


def obtener_cuentas(db: Session, usuario: Usuario) -> CuentasOut:
    exigir_comunidad(usuario, Comunidad.campesina)
    cuaderno = _cuaderno(db, usuario)
    gastos = db.scalars(select(GastoCosecha).where(GastoCosecha.usuario_id == usuario.id).order_by(GastoCosecha.id))
    return CuentasOut(cultivo=cuaderno.cultivo, cargas=cuaderno.cargas, precio=cuaderno.precio,
                      gastos=[GastoOut.model_validate(g) for g in gastos])


def anotar_gasto(db: Session, usuario: Usuario, datos: GastoCrear, offline: bool = False) -> tuple[GastoCosecha, bool]:
    exigir_comunidad(usuario, Comunidad.campesina)
    if existente := buscar_por_client_id(db, GastoCosecha, datos.client_id):
        return existente, True
    gasto = GastoCosecha(usuario_id=usuario.id, cultivo=datos.cultivo, tipo=datos.tipo, monto=datos.monto,
                         **campos_sync(datos.client_id, datos.creado_en_cliente, offline))
    db.add(gasto)
    db.flush()
    return gasto, False


def borrar_gasto(db: Session, usuario: Usuario, datos: GastoBorrar) -> bool:
    """Idempotente: borrar algo que ya no existe no es un error."""
    exigir_comunidad(usuario, Comunidad.campesina)
    res = db.execute(delete(GastoCosecha).where(
        GastoCosecha.usuario_id == usuario.id, GastoCosecha.client_id == datos.gasto_client_id))
    return res.rowcount > 0


def actualizar_cuaderno(db: Session, usuario: Usuario, datos: CuadernoActualizar) -> CuadernoCosecha:
    exigir_comunidad(usuario, Comunidad.campesina)
    cuaderno = _cuaderno(db, usuario)
    cambios = datos.model_dump(exclude_unset=True)
    for campo, valor in cambios.items():
        if campo == "cultivo" and valor is None:
            continue
        setattr(cuaderno, campo, valor)
    db.flush()
    return cuaderno


def reiniciar_cuentas(db: Session, usuario: Usuario, datos: CuentasReiniciar) -> None:
    """«Empezar una cosecha nueva»: borra gastos, cargas y precio."""
    exigir_comunidad(usuario, Comunidad.campesina)
    db.execute(delete(GastoCosecha).where(GastoCosecha.usuario_id == usuario.id))
    cuaderno = _cuaderno(db, usuario)
    cuaderno.cargas = None
    cuaderno.precio = None
    if datos.cultivo:
        cuaderno.cultivo = datos.cultivo
    db.flush()
