"""ALUNA IA · SABIA & CEIBA: comunidades, saberes, custodia, permisos e IA.

Sigue el contrato acordado con el equipo (database/schema/contrato_original_aluna.sql).
Los identificadores son textos estables (comm_sierra, know_01_terrazas…) para que el
frontend y la cola offline puedan crearlos y reenviarlos sin duplicar.
"""
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Comunidad, enum_col
from app.models.usuario import Usuario


class Community(Base):
    __tablename__ = "communities"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    cultural_category: Mapped[str | None] = mapped_column(String(120))
    region: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    cultural_context: Mapped[str] = mapped_column(Text)
    photo_url: Mapped[str] = mapped_column(String(300))
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    custodians: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)  # {id, name, title} para mostrar
    members_count: Mapped[int] = mapped_column(Integer, default=0)
    participation_guidelines: Mapped[str] = mapped_column(Text, default="")
    policies: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    # Qué versión del módulo de Salud SABIA ve su gente (indígena, afro o campesina).
    modulo_salud: Mapped[Comunidad | None] = mapped_column(enum_col(Comunidad, "ck_community_modulo_salud"), nullable=True)


class Membership(Base):
    """Pertenencia territorial: separada de la identidad de participación y de la autoridad de custodia."""
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("user_id", "community_id", name="uq_membership_user_community"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    community_id: Mapped[str] = mapped_column(ForeignKey("communities.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(30), default="member")  # member | author | verified_reviewer | custodian
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | verified | rejected | revoked
    joined_date: Mapped[str | None] = mapped_column(String(40))
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[Usuario] = relationship(back_populates="memberships")
    community: Mapped[Community] = relationship(lazy="joined")


class Knowledge(Base):
    __tablename__ = "knowledges"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    title: Mapped[str] = mapped_column(String(300))
    type: Mapped[str] = mapped_column(String(20))
    author: Mapped[str] = mapped_column(String(200))
    author_role: Mapped[str] = mapped_column(String(200))
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    # Código público de quien aportó (puede ser alguien sin cuenta en la plataforma, p. ej. un sabedor).
    author_codigo: Mapped[str] = mapped_column(String(60), default="")
    is_collective: Mapped[bool] = mapped_column(Boolean, default=False)
    date: Mapped[str] = mapped_column(String(40))
    description: Mapped[str] = mapped_column(Text)
    excerpt_for_public: Mapped[str | None] = mapped_column(Text)
    full_content: Mapped[str] = mapped_column(Text, default="")
    media_url: Mapped[str | None] = mapped_column(String(300))
    audio_url: Mapped[str | None] = mapped_column(String(300))
    video_url: Mapped[str | None] = mapped_column(String(300))
    audio_duration: Mapped[str | None] = mapped_column(String(20))
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    # Matriz granular: consultation, downloadAllowed, aiQueryAllowed, operations{…}, revokedAt, expiresAt…
    permissions: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    educational_data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    authorized_user_ids: Mapped[list[str]] = mapped_column(JSON, default=list)  # adaptador heredado (códigos)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owners: Mapped[list["KnowledgeOwner"]] = relationship(
        cascade="all, delete-orphan", order_by="KnowledgeOwner.position", lazy="selectin")
    approvals: Mapped[list["Approval"]] = relationship(
        cascade="all, delete-orphan", order_by="Approval.id", lazy="selectin")
    grants: Mapped[list["AccessGrant"]] = relationship(cascade="all, delete-orphan", lazy="selectin")
    creator: Mapped[Usuario | None] = relationship(lazy="joined")


class KnowledgeOwner(Base):
    """Comunidades titulares de un saber (un saber mancomunado tiene varias)."""
    __tablename__ = "knowledge_owners"

    knowledge_id: Mapped[str] = mapped_column(ForeignKey("knowledges.id", ondelete="CASCADE"), primary_key=True)
    community_id: Mapped[str] = mapped_column(ForeignKey("communities.id"), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    community: Mapped[Community] = relationship(lazy="joined")


class Approval(Base):
    """Decisión de cada custodia titular. Un saber se publica solo con aprobación unánime."""
    __tablename__ = "approvals"
    __table_args__ = (UniqueConstraint("knowledge_id", "community_id", name="uq_approval_knowledge_community"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    knowledge_id: Mapped[str] = mapped_column(ForeignKey("knowledges.id", ondelete="CASCADE"), index=True)
    community_id: Mapped[str] = mapped_column(ForeignKey("communities.id"))
    community_name: Mapped[str] = mapped_column(String(200))
    custodian_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    custodian_codigo: Mapped[str | None] = mapped_column(String(60))
    custodian_name: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30), default="pending")
    note: Mapped[str | None] = mapped_column(Text)
    decision_date: Mapped[str | None] = mapped_column(String(40))


class AccessGrant(Base):
    """Permiso explícito y vigente que otorga una custodia para un saber restringido o comunitario."""
    __tablename__ = "access_grants"
    __table_args__ = (UniqueConstraint("knowledge_id", "user_id", name="uq_grant_knowledge_user"),)

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    knowledge_id: Mapped[str] = mapped_column(ForeignKey("knowledges.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    request_id: Mapped[str | None] = mapped_column(ForeignKey("access_requests.id", ondelete="SET NULL"))
    granted_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[Usuario] = relationship(foreign_keys=[user_id], lazy="joined")
    granter: Mapped[Usuario | None] = relationship(foreign_keys=[granted_by], lazy="joined")


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    knowledge_id: Mapped[str] = mapped_column(ForeignKey("knowledges.id", ondelete="CASCADE"), index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    community_id: Mapped[str] = mapped_column(ForeignKey("communities.id"))
    purpose: Mapped[str] = mapped_column(Text)
    requested_permissions: Mapped[dict[str, bool]] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    request_date: Mapped[str] = mapped_column(String(40))
    response_date: Mapped[str | None] = mapped_column(String(40))
    response_note: Mapped[str | None] = mapped_column(Text)
    custodian_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    requester: Mapped[Usuario] = relationship(foreign_keys=[requester_id], lazy="joined")
    custodian: Mapped[Usuario | None] = relationship(foreign_keys=[custodian_user_id], lazy="joined")
    knowledge: Mapped[Knowledge] = relationship(lazy="joined")
    community: Mapped[Community] = relationship(lazy="joined")


class AffiliationRequest(Base):
    """Solicitud de vinculación a una comunidad: solo la valida su propia custodia."""
    __tablename__ = "affiliation_requests"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    community_id: Mapped[str] = mapped_column(ForeignKey("communities.id"))
    rationale: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    request_date: Mapped[str] = mapped_column(String(40))
    response_note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[Usuario] = relationship(lazy="joined")
    community: Mapped[Community] = relationship(lazy="joined")


class AiGeneration(Base):
    """Material derivado con IA (Ceiba): nace como borrador y solo lo publica la custodia titular."""
    __tablename__ = "ai_generations"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    knowledge_id: Mapped[str] = mapped_column(ForeignKey("knowledges.id", ondelete="CASCADE"), index=True)
    community_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    community_name: Mapped[str] = mapped_column(String(300))
    type: Mapped[str] = mapped_column(String(30))
    title: Mapped[str] = mapped_column(String(400))
    summary: Mapped[str] = mapped_column(Text, default="")
    generated_at: Mapped[str] = mapped_column(String(60))
    status: Mapped[str] = mapped_column(String(40), default="draft_pending_review", index=True)
    public: Mapped[bool] = mapped_column(Boolean, default=False)
    custodian_feedback: Mapped[str | None] = mapped_column(Text)
    # transformMeta, slides, chatMessages, podcastSegments, conceptNodes, videoStoryboard
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[Usuario] = relationship(lazy="joined")
    knowledge: Mapped[Knowledge] = relationship(lazy="joined")


class AuditEvent(Base):
    """Bitácora de decisiones de custodia, permisos de IA y accesos (trazabilidad para la comunidad)."""
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    event_type: Mapped[str] = mapped_column(String(60))
    resource_type: Mapped[str] = mapped_column(String(40))
    resource_id: Mapped[str | None] = mapped_column(String(60))
    community_id: Mapped[str | None] = mapped_column(String(60))
    detail: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class CanalBienestar(Base):
    """Canales institucionales de orientación del módulo de Bienestar (datos aislados de Ceiba)."""
    __tablename__ = "canales_bienestar"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    category: Mapped[str] = mapped_column(String(30))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    community_target: Mapped[str] = mapped_column(String(200))
    channel_info: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30), default="en_definicion")


class SolicitudOrientacion(Base):
    """Solicitud orientativa (no clínica) hacia un canal de bienestar. Nunca se indexa en Ceiba."""
    __tablename__ = "solicitudes_orientacion"
    __table_args__ = (UniqueConstraint("usuario_id", "client_id", name="uq_orientacion_usuario_client"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    # Id generado en el navegador: si la cola sin conexión reenvía la solicitud, no se duplica.
    client_id: Mapped[str | None] = mapped_column(String(64))
    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    canal_id: Mapped[str | None] = mapped_column(ForeignKey("canales_bienestar.id", ondelete="SET NULL"))
    descripcion: Mapped[str] = mapped_column(Text)
    estado: Mapped[str] = mapped_column(String(20), default="recibida")
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
