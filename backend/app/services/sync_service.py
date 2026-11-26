"""Sincronización offline-first.

El teléfono guarda en una cola (IndexedDB) lo que la persona hace sin señal y,
al recuperar la conexión, la envía completa a POST /api/sync.

- Cada operación trae un UUID generado en el teléfono que se guarda como
  `client_id`: si la misma operación llega dos veces (p. ej. se cortó la señal
  antes de recibir la respuesta), no se duplica.
- Cada operación se procesa en su propio SAVEPOINT: si una falla, las demás
  se guardan igual y el teléfono recibe el error de esa operación.
"""
from collections.abc import Callable
from datetime import datetime, timezone

from pydantic import BaseModel, ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Usuario
from app.schemas.comunidad import (
    AlertaCrear,
    CuadernoActualizar,
    CuentasReiniciar,
    GastoBorrar,
    GastoCrear,
    InscripcionCrear,
    ParticipacionCrear,
    ReporteCrear,
    SemillaCrear,
    TruequeCrear,
)
from app.schemas.contenido import PlantaCrear, PodcastCrear
from app.schemas.sync import OperacionSync, PeticionSync, RespuestaSync, ResultadoSync
from app.services import contenido_service, finca_service, participa_service
from app.services.comun import ErrorNegocio


def _sin_duplicado(fn: Callable) -> Callable:
    """Adapta servicios que no devuelven (registro, duplicado)."""
    def envoltura(db: Session, usuario: Usuario, datos: BaseModel, offline: bool = True):
        fn(db, usuario, datos)
        return None, False
    return envoltura


# tipo de operación → (esquema de validación, servicio, ¿lleva client_id?)
OPERACIONES: dict[str, tuple[type[BaseModel], Callable, bool]] = {
    "podcast": (PodcastCrear, contenido_service.crear_podcast, True),
    "planta": (PlantaCrear, contenido_service.crear_planta, True),
    "semilla": (SemillaCrear, finca_service.crear_semilla, True),
    "trueque": (TruequeCrear, finca_service.proponer_trueque, True),
    "alerta": (AlertaCrear, finca_service.crear_alerta, True),
    "reporte": (ReporteCrear, participa_service.crear_reporte, True),
    "gasto": (GastoCrear, finca_service.anotar_gasto, False),  # el gasto trae su propio client_id
    "gasto_borrar": (GastoBorrar, _sin_duplicado(finca_service.borrar_gasto), False),
    "cuaderno": (CuadernoActualizar, _sin_duplicado(finca_service.actualizar_cuaderno), False),
    "cuentas_reiniciar": (CuentasReiniciar, _sin_duplicado(finca_service.reiniciar_cuentas), False),
    "inscripcion": (InscripcionCrear, participa_service.inscribirse, True),
    "investigacion": (ParticipacionCrear, participa_service.participar_investigacion, True),
}


def _mensaje_validacion(e: ValidationError) -> str:
    primero = e.errors()[0]
    msg = str(primero.get("msg", "Datos no válidos"))
    return msg.removeprefix("Value error, ")


def _procesar(db: Session, usuario: Usuario, op: OperacionSync) -> ResultadoSync:
    esquema, servicio, lleva_client_id = OPERACIONES[op.tipo]
    datos = dict(op.datos)
    if lleva_client_id:
        datos["client_id"] = str(op.id)
    if "creado_en_cliente" in esquema.model_fields and op.creado_en:
        datos.setdefault("creado_en_cliente", op.creado_en.isoformat())
    try:
        modelo = esquema.model_validate(datos)
    except ValidationError as e:
        return ResultadoSync(id=op.id, ok=False, error=_mensaje_validacion(e))

    try:
        with db.begin_nested():
            _, duplicado = servicio(db, usuario, modelo, True)
        return ResultadoSync(id=op.id, ok=True, duplicado=bool(duplicado))
    except ErrorNegocio as e:
        return ResultadoSync(id=op.id, ok=False, error=e.mensaje)
    except IntegrityError:
        # Choque con una restricción única: ya estaba registrado por otra vía.
        return ResultadoSync(id=op.id, ok=True, duplicado=True)


def sincronizar(db: Session, usuario: Usuario, peticion: PeticionSync) -> RespuestaSync:
    ordenadas = sorted(peticion.operaciones, key=lambda o: o.creado_en.timestamp() if o.creado_en else 0)
    resultados = [_procesar(db, usuario, op) for op in ordenadas]
    db.commit()
    return RespuestaSync(
        resultados=resultados,
        procesadas=sum(r.ok for r in resultados),
        fallidas=sum(not r.ok for r in resultados),
        sincronizado_en=datetime.now(timezone.utc),
    )
