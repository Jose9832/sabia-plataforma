"""Lo que envían las personas: inscripciones, investigación, finca y reportes.

Todos estos registros pueden crearse sin señal en el teléfono y llegar después
por la cola de sincronización (POST /api/sync).
"""
from datetime import datetime
from uuid import UUID

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, declared_attr, mapped_column

from app.core.database import Base
from app.models.enums import Comunidad, OrigenSync, enum_col


class Sincronizable:
    """Campos comunes de los registros que se pueden crear sin conexión.

    client_id          UUID generado en el teléfono: hace idempotente la sincronización.
    origen             en_linea | cola_offline (estado de sincronización con que llegó).
    creado_en_cliente  cuándo lo guardó la persona, aunque no hubiera señal.
    sincronizado_en    cuándo llegó al servidor.
    """

    client_id: Mapped[UUID | None] = mapped_column(unique=True)
    creado_en_cliente: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sincronizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    @declared_attr
    def origen(cls) -> Mapped[OrigenSync]:
        return mapped_column(enum_col(OrigenSync, f"ck_{cls.__tablename__}_origen"), default=OrigenSync.en_linea)


class Inscripcion(Sincronizable, Base):
    __tablename__ = "inscripciones"
    __table_args__ = (UniqueConstraint("usuario_id", "encuentro_id", name="uq_inscripcion_usuario_encuentro"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    encuentro_id: Mapped[int] = mapped_column(ForeignKey("encuentros.id", ondelete="CASCADE"))


class SolicitudInvestigacion(Sincronizable, Base):
    __tablename__ = "solicitudes_investigacion"
    __table_args__ = (
        UniqueConstraint("usuario_id", "investigacion_id", name="uq_solicitud_usuario_investigacion"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    investigacion_id: Mapped[int] = mapped_column(ForeignKey("investigaciones.id", ondelete="CASCADE"))
    acepta_derechos: Mapped[bool] = mapped_column(Boolean, default=True)


class SemillaTrueque(Sincronizable, Base):
    """Oferta del banco de semillas (trueque entre veredas)."""
    __tablename__ = "semillas_trueque"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tipo: Mapped[str] = mapped_column(String(30))
    variedad: Mapped[str] = mapped_column(String(200))
    cantidad: Mapped[str] = mapped_column(String(100))
    busca: Mapped[str] = mapped_column(String(200))
    familia: Mapped[str] = mapped_column(String(120))
    vereda: Mapped[str] = mapped_column(String(120))
    es_ejemplo: Mapped[bool] = mapped_column(Boolean, default=False)


class SolicitudTrueque(Sincronizable, Base):
    __tablename__ = "solicitudes_trueque"
    __table_args__ = (UniqueConstraint("usuario_id", "semilla_id", name="uq_trueque_usuario_semilla"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    semilla_id: Mapped[int] = mapped_column(ForeignKey("semillas_trueque.id", ondelete="CASCADE"))


class AlertaVeredal(Sincronizable, Base):
    __tablename__ = "alertas_veredales"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    tipo: Mapped[str] = mapped_column(String(20))  # derrumbe | creciente | plaga | otra
    lugar: Mapped[str] = mapped_column(String(200))
    nota: Mapped[str] = mapped_column(String(500), default="")
    foto: Mapped[str | None] = mapped_column(Text)  # data URL de la foto de evidencia
    hora: Mapped[str] = mapped_column(String(60))  # texto mostrado: "Hoy, 6:10 a. m."
    autor: Mapped[str] = mapped_column(String(120))


class ReporteDerechos(Sincronizable, Base):
    """Reporte de vulneración de derechos: solo lo recibe la autoridad de la comunidad."""
    __tablename__ = "reportes_derechos"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    comunidad: Mapped[Comunidad] = mapped_column(enum_col(Comunidad, "ck_reporte_comunidad"))
    tipo: Mapped[str] = mapped_column(String(30))
    tiene_audio: Mapped[bool] = mapped_column(Boolean, default=False)
    foto: Mapped[str | None] = mapped_column(Text)
    estado: Mapped[str] = mapped_column(String(20), default="recibido")


class GastoCosecha(Sincronizable, Base):
    __tablename__ = "gastos_cosecha"

    id: Mapped[int] = mapped_column(primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    cultivo: Mapped[str] = mapped_column(String(30))
    tipo: Mapped[str] = mapped_column(String(40))
    monto: Mapped[int] = mapped_column(BigInteger)


class CuadernoCosecha(Base):
    """Lo vendido en la cosecha actual: cultivo, cargas y precio por carga."""
    __tablename__ = "cuadernos_cosecha"

    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    cultivo: Mapped[str] = mapped_column(String(30), default="Café")
    cargas: Mapped[int | None] = mapped_column(Integer)
    precio: Mapped[int | None] = mapped_column(BigInteger)
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
