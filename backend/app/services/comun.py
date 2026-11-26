"""Utilidades compartidas por los servicios."""
from datetime import datetime, timedelta, timezone
from typing import TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Comunidad, OrigenSync, Usuario

T = TypeVar("T")

# Nombres de campos como se los decimos a la persona
_CAMPOS = {
    "name": "nombre", "email": "correo", "password": "contraseña", "identity": "identidad", "tipo": "tipo",
    "lugar": "lugar", "nota": "nota", "nombre": "nombre de la planta", "nombre_nativo": "nombre en lengua propia",
    "uso": "uso", "preparacion": "preparación", "precaucion": "precauciones", "parte_utilizada": "parte utilizada",
    "variedad": "variedad", "cantidad": "cantidad", "monto": "monto", "cultivo": "cultivo", "foto": "foto",
    "titulo": "título", "url": "enlace", "semilla_id": "semilla", "encuentro_id": "encuentro",
    "investigacion_id": "investigación", "acepta_derechos": "aceptación de derechos", "acceptDataPolicy": "autorización de datos",
}


def mensaje_validacion(error: dict) -> str:
    """Un error de validación de Pydantic en español claro (la app lo muestra tal cual)."""
    tipo = str(error.get("type", ""))
    ctx = error.get("ctx") or {}
    loc = [str(x) for x in error.get("loc", []) if x not in ("body", "query", "datos")]
    campo = _CAMPOS.get(loc[-1], loc[-1]) if loc else "dato"
    msg = str(error.get("msg", "Datos no válidos"))
    if tipo == "value_error":
        return msg.removeprefix("Value error, ")
    if tipo == "missing":
        return f"Falta completar «{campo}»."
    if tipo == "literal_error":
        return f"«{campo}» no es una opción válida. Elige una de la lista."
    if tipo == "string_too_short":
        return f"«{campo}» es muy corto."
    if tipo == "string_too_long":
        return f"«{campo}» es muy largo (máximo {ctx.get('max_length', '?')} caracteres)."
    if tipo in ("greater_than", "greater_than_equal"):
        return f"«{campo}» debe ser mayor que {ctx.get('gt', ctx.get('ge', 0))}" + ("." if tipo == "greater_than" else " o igual.")
    if tipo in ("less_than", "less_than_equal"):
        return f"«{campo}» no puede ser mayor que {ctx.get('le', ctx.get('lt', '?'))}."
    if tipo.endswith("_parsing") or tipo.endswith("_type") or tipo == "bool_parsing":
        return f"«{campo}» no tiene un formato válido."
    return f"Datos no válidos en «{campo}»."

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
