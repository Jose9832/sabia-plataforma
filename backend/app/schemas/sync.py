from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field

TipoOperacion = Literal[
    "podcast",
    "semilla",
    "trueque",
    "alerta",
    "reporte",
    "gasto",
    "gasto_borrar",
    "cuaderno",
    "cuentas_reiniciar",
    "inscripcion",
    "investigacion",
]


class OperacionSync(BaseModel):
    """Una acción guardada en el teléfono mientras no había señal."""
    id: UUID = Field(description="UUID generado en el cliente; se usa como client_id del registro")
    tipo: TipoOperacion
    datos: dict[str, Any] = Field(default_factory=dict)
    creado_en: datetime | None = None


class PeticionSync(BaseModel):
    operaciones: list[OperacionSync] = Field(max_length=200)


class ResultadoSync(BaseModel):
    id: UUID
    ok: bool
    duplicado: bool = False
    error: str | None = None


class RespuestaSync(BaseModel):
    resultados: list[ResultadoSync]
    procesadas: int
    fallidas: int
    sincronizado_en: datetime
