"""Usuario único de la plataforma: lo usan ALUNA (SABIA & CEIBA) y el módulo de Salud SABIA."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import Comunidad, enum_col

if TYPE_CHECKING:
    from app.models.aluna import Membership


class Usuario(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Identificador público estable (p. ej. "user_member_sierra"): es el `id` que ve el frontend.
    codigo: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(160), unique=True, index=True)
    numero_identificacion: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120))
    # Identidad de participación: visitor | student | researcher | community_member | org_representative
    identity: Mapped[str] = mapped_column(String(30), default="visitor")
    role_label: Mapped[str] = mapped_column(String(120), default="Visitante")
    avatar: Mapped[str] = mapped_column(String(300), default="")
    organization: Mapped[str | None] = mapped_column(String(200))
    bio: Mapped[str] = mapped_column(Text, default="")
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    is_technical_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    # Comunidad explícita para el módulo de Salud (si no se fija, se deduce de la membresía verificada).
    comunidad_salud: Mapped[Comunidad | None] = mapped_column(enum_col(Comunidad, "ck_usuario_comunidad"), nullable=True)
    clave_hash: Mapped[str] = mapped_column(String(255))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    memberships: Mapped[list["Membership"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    @property
    def comunidad(self) -> Comunidad | None:
        """Comunidad con la que la persona usa el módulo de Salud (indígena, afro o campesina).

        Respeta la gobernanza de ALUNA: solo cuenta una membresía **verificada** en una
        comunidad que tenga configurado su módulo de salud.
        """
        if self.comunidad_salud:
            return self.comunidad_salud
        for m in self.memberships:
            if m.status == "verified" and m.role != "none" and m.community and m.community.modulo_salud:
                return m.community.modulo_salud
        return None
