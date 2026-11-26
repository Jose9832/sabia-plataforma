"""Validación de entradas de ALUNA (los nombres siguen el camelCase del frontend)."""
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

TIPOS_SABER = ("relato", "historia", "documento", "audio", "video", "fotografia", "practica", "memoria")
IDENTIDADES = ("visitor", "student", "researcher", "community_member", "org_representative")


class _Base(BaseModel):
    model_config = ConfigDict(extra="ignore")


class LoginIn(_Base):
    email: str = Field(min_length=3, max_length=160)
    password: str = Field(min_length=1, max_length=128)


class RegistroIn(_Base):
    name: str = Field(max_length=120)
    email: str = Field(max_length=160)
    password: str = Field(max_length=128)
    identity: Literal[IDENTIDADES] = "visitor"  # type: ignore[valid-type]
    organization: str | None = Field(default=None, max_length=200)
    communityId: str | None = None
    rationale: str | None = Field(default=None, max_length=2000)
    # Autorización de tratamiento de datos: sin ella no se crea la cuenta
    acceptDataPolicy: bool = False


class Decision(_Base):
    decision: Literal["approve", "reject"]
    note: str | None = Field(default=None, max_length=2000)
    communityId: str | None = None  # obligatorio al decidir sobre un saber (cada comunidad decide por sí misma)


class PermisosSolicitados(_Base):
    consultation: bool = True
    aiProcessing: bool = True
    derivatives: bool = True


class SolicitudAccesoIn(_Base):
    id: str | None = None
    purpose: str = Field(default="", max_length=3000)
    requestedPermissions: PermisosSolicitados | None = None


class VinculacionIn(_Base):
    id: str | None = None
    communityId: str
    rationale: str = Field(default="", max_length=3000)


class PermisosGranulares(_Base):
    model_config = ConfigDict(extra="allow")

    consultation: Literal["public", "community", "restricted", "private"]
    downloadAllowed: bool = False
    aiQueryAllowed: Literal["none", "educational_query", "derived_approval_required"] = "none"
    derivativeGenerationAllowed: bool = False
    derivativePublicationApprovalRequired: bool = True
    reusableForEducation: bool = False


class SaberIn(_Base):
    id: str | None = None
    title: str = Field(min_length=3, max_length=300)
    type: Literal[TIPOS_SABER]  # type: ignore[valid-type]
    communityIds: list[str] = Field(min_length=1, max_length=10)
    isCollective: bool = False
    provenance: str = Field(default="", max_length=3000)
    description: str = Field(min_length=10, max_length=5000)
    fullContent: str = Field(default="", max_length=100_000)
    permissions: PermisosGranulares
    tags: list[str] = Field(default_factory=list, max_length=20)
    mediaUrl: str | None = Field(default=None, max_length=300)

    @field_validator("mediaUrl")
    @classmethod
    def solo_rutas_locales(cls, v: str | None) -> str | None:
        """Las imágenes del saber se sirven desde los recursos de la plataforma."""
        if v and not v.startswith("/assets/"):
            return None
        return v


class ConsultaCeibaIn(_Base):
    knowledgeIds: list[str] = Field(min_length=1, max_length=5)
    question: str = Field(min_length=1, max_length=1000)


class TransformarIn(_Base):
    id: str | None = None
    knowledgeIds: list[str] = Field(min_length=1, max_length=5)
    audience: Literal["Niños", "Jóvenes", "Adultos", "Público general"]
    level: Literal["Inicial", "Intermedio", "Avanzado"]
    objective: str = Field(max_length=1000)
    format: Literal["Explicación", "Guía de aprendizaje", "Presentación pedagógica"]
    language: str = Field(default="Español", max_length=60)
    context: str | None = Field(default=None, max_length=2000)


class DerivadoIn(_Base):
    model_config = ConfigDict(extra="ignore")

    id: str | None = None
    knowledgeId: str
    type: Literal["chat", "transform", "explanation", "presentation", "learning_guide", "podcast", "concept_map", "video_storyboard"]
    title: str = Field(max_length=400)
    summary: str = Field(default="", max_length=20_000)
    custodianFeedback: str | None = Field(default=None, max_length=2000)
    transformMeta: dict[str, Any] | None = None
    slides: list[dict[str, Any]] | None = None
    chatMessages: list[dict[str, Any]] | None = None
    podcastSegments: list[dict[str, Any]] | None = None
    conceptNodes: list[dict[str, Any]] | None = None
    videoStoryboard: list[dict[str, Any]] | None = None


class OrientacionIn(_Base):
    id: str | None = Field(default=None, max_length=64)
    description: str = Field(min_length=5, max_length=3000)
    channelId: str | None = None
