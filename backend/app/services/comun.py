"""Utilidades compartidas por los servicios."""
from datetime import datetime, timedelta, timezone
from typing import TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Comunidad, OrigenSync, Usuario

T = TypeVar("T")

# Colombia no tiene horario de verano: UTC-5 todo el año.
HORA_COLOMBIA = timezone(timedelta(hours=-5), "COT")


class ErrorNegocio(Exception):
    """Error de reglas de negocio que se devuelve a la persona con un mensaje claro."""

    def __init__(self, mensaje: str, status_code: int = 400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status_code = status_code


def buscar_por_client_id(db: Session, modelo: type[T], client_id: UUID | None) -> T | None:
    """Idempotencia: si el teléfono reenvía algo que ya llegó, devolvemos lo existente."""
    if client_id is None:
        return None
    return db.scalar(select(modelo).where(modelo.client_id == client_id))  # type: ignore[attr-defined]


def campos_sync(client_id: UUID | None, creado_en_cliente: datetime | None, offline: bool) -> dict:
    return {
        "client_id": client_id,
        "creado_en_cliente": creado_en_cliente,
        "origen": OrigenSync.cola_offline if offline else OrigenSync.en_linea,
    }


def comunidad_salud(usuario: Usuario) -> Comunidad:
    """Comunidad del módulo de Salud: exige una membresía verificada en ALUNA."""
    if not usuario.comunidad:
        raise ErrorNegocio("Tu perfil aún no tiene una comunidad verificada. Solicita tu vinculación a la custodia de tu comunidad.", 403)
    return usuario.comunidad


def exigir_comunidad(usuario: Usuario, *comunidades: Comunidad) -> None:
    if usuario.comunidad not in comunidades:
        raise ErrorNegocio("Esta sección no está disponible para tu comunidad.", 403)


def hora_legible(momento: datetime | None = None) -> str:
    """Mismo formato del prototipo: «Hoy, 6:10»."""
    d = (momento or datetime.now(timezone.utc)).astimezone(HORA_COLOMBIA)
    return f"Hoy, {d.hour}:{d.minute:02d}"
