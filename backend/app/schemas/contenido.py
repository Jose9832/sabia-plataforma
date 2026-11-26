from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import Comunidad, Visibilidad


class _Base(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class RelatoOut(_Base):
    id: int
    comunidad: Comunidad
    titulo: str
    sabedor: str
    duracion: str
    visibilidad: Visibilidad
    youtube: str
    spotify: str


class PodcastOut(_Base):
    id: int
    client_id: UUID | None = None
    comunidad: Comunidad
    titulo: str
    plataforma: str
    embed: str
    abrir: str
    visibilidad: Visibilidad


class PodcastCrear(BaseModel):
    client_id: UUID | None = None
    titulo: str = Field(default="", max_length=200)
    url: str = Field(max_length=500)
    compartir: bool = False


class LugarOut(_Base):
    id: int
    categoria: str
    nombre: str
    tipo: str
    direccion: str


class PlantaOut(_Base):
    id: int
    slug: str
    comunidad: Comunidad
    nombre: str
    cientifico: str | None
    color: str
    uso: str
    preparacion: str
    precaucion: str
    hospital: str
    nombre_nativo: str | None = None
    parte_utilizada: str | None = None
    visibilidad: Visibilidad = Visibilidad.adentro
    validada: bool = False
    autor_nombre: str | None = None
    client_id: UUID | None = None
    creado_en: datetime | None = None


class PlantaCrear(BaseModel):
    """Aporte de una planta medicinal. La comunidad NO se envía: la fija el servidor según la membresía verificada."""
    client_id: UUID | None = None
    nombre: str = Field(min_length=2, max_length=120)
    nombre_nativo: str | None = Field(default=None, max_length=120)
    uso: str = Field(min_length=3, max_length=1500)
    preparacion: str = Field(min_length=3, max_length=1500)
    parte_utilizada: str | None = Field(default=None, max_length=80)
    precaucion: str = Field(default="", max_length=1000)
    compartir: bool = False


class HistoriaOut(_Base):
    id: int
    nombre: str
    color: str
    autor: str
    comunidad: Comunidad
    material: str
    historia: str
    contacto_autorizado: bool
    whatsapp: str
    visibilidad: Visibilidad


class EncuentroOut(_Base):
    id: int
    comunidad: Comunidad
    tipo: str
    titulo: str
    fecha: str
    hora: str
    lugar: str
    orienta: str
    descripcion: str
    visibilidad: Visibilidad


class InvestigacionOut(_Base):
    id: int
    comunidades: list[Comunidad]
    titulo: str
    grupo: str
    estado: str
    busca: str
    participar: list[str]
    devolucion: str
