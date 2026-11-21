"""Esquemas de lo que envían las personas (finca, participación y reportes)."""
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

TIPOS_SEMILLA = ("Maíz", "Fríjol", "Yuca", "Café", "Frutales", "Otra")
TIPOS_ALERTA = ("derrumbe", "creciente", "plaga", "otra")
TIPOS_REPORTE = (
    "discriminacion", "microrracismo", "salud", "saberes", "otro",  # todas las comunidades
    "via", "servicios", "ambiente",                                 # campo
)
TIPOS_GASTO = ("Abono", "Jornales", "Semillas e insumos", "Transporte", "Otro")
CULTIVOS_CUENTAS = ("Café", "Maíz", "Yuca", "Fríjol", "Otro")
MAX_FOTO = 3_000_000  # ~2,2 MB de imagen en base64


def _validar_foto(v: str | None) -> str | None:
    if v is None or v == "":
        return None
    if not v.startswith("data:image/"):
        raise ValueError("La foto debe ser una imagen.")
    if len(v) > MAX_FOTO:
        raise ValueError("La foto es muy pesada. Toma una de menor tamaño.")
    return v


class _Sync(BaseModel):
    """Campos opcionales que manda la cola offline."""
    client_id: UUID | None = None
    creado_en_cliente: datetime | None = None


# ---------- Banco de semillas ----------
class SemillaCrear(_Sync):
    tipo: Literal[TIPOS_SEMILLA]  # type: ignore[valid-type]
    variedad: str = Field(min_length=1, max_length=200)
    cantidad: str = Field(min_length=1, max_length=100)
    busca: str = Field(default="", max_length=200)

    @field_validator("variedad", "cantidad")
    @classmethod
    def no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Escribe la variedad y la cantidad.")
        return v.strip()


class SemillaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: UUID | None = None
    tipo: str
    variedad: str
    cantidad: str
    busca: str
    familia: str
    vereda: str
    propia: bool = False


class TruequeCrear(_Sync):
    semilla_id: int


# ---------- Alertas veredales ----------
class AlertaCrear(_Sync):
    tipo: Literal[TIPOS_ALERTA]  # type: ignore[valid-type]
    lugar: str = Field(min_length=1, max_length=200)
    nota: str = Field(default="", max_length=500)
    foto: str | None = None
    hora: str | None = Field(default=None, max_length=60)

    @field_validator("foto")
    @classmethod
    def foto_valida(cls, v: str | None) -> str | None:
        return _validar_foto(v)

    @field_validator("lugar")
    @classmethod
    def lugar_no_vacio(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Elige qué está pasando y escribe dónde.")
        return v.strip()


class AlertaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: UUID | None = None
    tipo: str
    lugar: str
    nota: str
    foto: str | None
    hora: str
    autor: str
    origen: str


# ---------- Reportes de derechos ----------
class ReporteCrear(_Sync):
    tipo: Literal[TIPOS_REPORTE]  # type: ignore[valid-type]
    tiene_audio: bool = False
    foto: str | None = None

    @field_validator("foto")
    @classmethod
    def foto_valida(cls, v: str | None) -> str | None:
        return _validar_foto(v)


class ReporteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: UUID | None = None
    tipo: str
    tiene_audio: bool
    estado: str
    origen: str
    sincronizado_en: datetime


# ---------- Cuaderno de cuentas ----------
class GastoCrear(_Sync):
    client_id: UUID  # obligatorio: permite borrar el gasto aunque se haya creado sin señal
    cultivo: str = Field(default="Café", max_length=30)
    tipo: Literal[TIPOS_GASTO]  # type: ignore[valid-type]
    monto: int = Field(gt=0, le=10_000_000_000)


class GastoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    client_id: UUID
    cultivo: str
    tipo: str
    monto: int


class GastoBorrar(BaseModel):
    gasto_client_id: UUID


class CuadernoActualizar(BaseModel):
    cultivo: Literal[CULTIVOS_CUENTAS] | None = None  # type: ignore[valid-type]
    cargas: int | None = Field(default=None, ge=0, le=1_000_000)
    precio: int | None = Field(default=None, ge=0, le=10_000_000_000)


class CuentasReiniciar(BaseModel):
    cultivo: Literal[CULTIVOS_CUENTAS] | None = None  # type: ignore[valid-type]


class CuentasOut(BaseModel):
    cultivo: str
    cargas: int | None
    precio: int | None
    gastos: list[GastoOut]


# ---------- Participa ----------
class InscripcionCrear(_Sync):
    encuentro_id: int


class ParticipacionCrear(_Sync):
    investigacion_id: int
    acepta_derechos: Literal[True]


class MisRegistrosOut(BaseModel):
    """Ids de encuentros, investigaciones y semillas en los que la persona ya participó."""
    inscripciones: list[int]
    investigaciones: list[int]
    trueques: list[int]
