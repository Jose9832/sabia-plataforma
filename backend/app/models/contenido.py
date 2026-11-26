"""Contenido de las comunidades: memoria, lugares, plantas, historias, encuentros e investigaciones."""
from datetime import datetime
from uuid import UUID

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import Comunidad, OrigenSync, Visibilidad, enum_col


class Relato(Base):
    __tablename__ = "relatos"

    id: Mapped[int] = mapped_column(primary_key=True)
    comunidad: Mapped[Comunidad] = mapped_column(enum_col(Comunidad, "ck_relato_comunidad"), index=True)
    titulo: Mapped[str] = mapped_column(String(200))
    sabedor: Mapped[str] = mapped_column(String(120))
    duracion: Mapped[str] = mapped_column(String(10))  # "m:ss"
    visibilidad: Mapped[Visibilidad] = mapped_column(
        enum_col(Visibilidad, "ck_relato_visibilidad"), default=Visibilidad.adentro, index=True
    )
    youtube: Mapped[str] = mapped_column(String(300), default="")
    spotify: Mapped[str] = mapped_column(String(300), default="")
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Podcast(Base):
    __tablename__ = "podcasts"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[UUID | None] = mapped_column(unique=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    comunidad: Mapped[Comunidad] = mapped_column(enum_col(Comunidad, "ck_podcast_comunidad"), index=True)
    titulo: Mapped[str] = mapped_column(String(200))
    plataforma: Mapped[str] = mapped_column(String(20))  # youtube | spotify
    embed: Mapped[str] = mapped_column(String(400))
    abrir: Mapped[str] = mapped_column(String(400))
    visibilidad: Mapped[Visibilidad] = mapped_column(
        enum_col(Visibilidad, "ck_podcast_visibilidad"), default=Visibilidad.adentro
    )
    origen: Mapped[OrigenSync] = mapped_column(enum_col(OrigenSync, "ck_podcast_origen"), default=OrigenSync.en_linea)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Lugar(Base):
    """Hospitales de Santa Marta y puestos de salud rurales."""
    __tablename__ = "lugares"

    id: Mapped[int] = mapped_column(primary_key=True)
    categoria: Mapped[str] = mapped_column(String(20), index=True)  # hospital | rural
    nombre: Mapped[str] = mapped_column(String(200))
    tipo: Mapped[str] = mapped_column(String(200))
    direccion: Mapped[str] = mapped_column(String(300))


class Planta(Base):
    __tablename__ = "plantas"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(40), unique=True)
    comunidad: Mapped[Comunidad] = mapped_column(enum_col(Comunidad, "ck_planta_comunidad"), index=True)
    nombre: Mapped[str] = mapped_column(String(120))
    cientifico: Mapped[str | None] = mapped_column(String(120))
    color: Mapped[str] = mapped_column(String(9))
    uso: Mapped[str] = mapped_column(Text)
    preparacion: Mapped[str] = mapped_column(Text)
    precaucion: Mapped[str] = mapped_column(Text)
    hospital: Mapped[str] = mapped_column(Text)
    # Registro comunitario de plantas medicinales (aportes de las personas de cada comunidad).
    # Equivalencias con el nombre de la especificación: nombre=nombre_común, uso=usos_medicinales,
    # preparacion=forma_preparación, precaucion=precauciones.
    nombre_nativo: Mapped[str | None] = mapped_column(String(120))
    parte_utilizada: Mapped[str | None] = mapped_column(String(80))
    visibilidad: Mapped[Visibilidad] = mapped_column(
        enum_col(Visibilidad, "ck_planta_visibilidad"), default=Visibilidad.adentro, index=True
    )
    # Las fichas aportadas quedan «sin validar» hasta que los mayores o sabedores las revisen
    validada: Mapped[bool] = mapped_column(Boolean, default=False)
    autor_nombre: Mapped[str | None] = mapped_column(String(120))
    client_id: Mapped[UUID | None] = mapped_column(unique=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    origen: Mapped[OrigenSync] = mapped_column(enum_col(OrigenSync, "ck_planta_origen"), default=OrigenSync.en_linea)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class HistoriaProducto(Base):
    """Historias de quién hace cada producto (puerta «Conocer»)."""
    __tablename__ = "historias_producto"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200))
    color: Mapped[str] = mapped_column(String(9))
    autor: Mapped[str] = mapped_column(String(200))
    comunidad: Mapped[Comunidad] = mapped_column(enum_col(Comunidad, "ck_historia_comunidad"))
    material: Mapped[str] = mapped_column(String(200))
    historia: Mapped[str] = mapped_column(Text)
    contacto_autorizado: Mapped[bool] = mapped_column(Boolean, default=False)
    whatsapp: Mapped[str] = mapped_column(String(30), default="")
    visibilidad: Mapped[Visibilidad] = mapped_column(
        enum_col(Visibilidad, "ck_historia_visibilidad"), default=Visibilidad.afuera
    )


class Encuentro(Base):
    __tablename__ = "encuentros"

    id: Mapped[int] = mapped_column(primary_key=True)
    comunidad: Mapped[Comunidad] = mapped_column(enum_col(Comunidad, "ck_encuentro_comunidad"), index=True)
    tipo: Mapped[str] = mapped_column(String(40))
    titulo: Mapped[str] = mapped_column(String(200))
    fecha: Mapped[str] = mapped_column(String(80))
    hora: Mapped[str] = mapped_column(String(40))
    lugar: Mapped[str] = mapped_column(String(200))
    orienta: Mapped[str] = mapped_column(String(300))
    descripcion: Mapped[str] = mapped_column(Text)
    visibilidad: Mapped[Visibilidad] = mapped_column(
        enum_col(Visibilidad, "ck_encuentro_visibilidad"), default=Visibilidad.adentro
    )


class Investigacion(Base):
    __tablename__ = "investigaciones"

    id: Mapped[int] = mapped_column(primary_key=True)
    comunidades: Mapped[list[str]] = mapped_column(JSON)
    titulo: Mapped[str] = mapped_column(String(200))
    grupo: Mapped[str] = mapped_column(String(200))
    estado: Mapped[str] = mapped_column(String(80))
    busca: Mapped[str] = mapped_column(Text)
    participar: Mapped[list[str]] = mapped_column(JSON)
    devolucion: Mapped[str] = mapped_column(Text)
