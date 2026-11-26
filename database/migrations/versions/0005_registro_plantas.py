"""Registro comunitario de plantas medicinales: aportes con visibilidad, autoría y sincronización offline

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("plantas", sa.Column("nombre_nativo", sa.String(120), nullable=True))
    op.add_column("plantas", sa.Column("parte_utilizada", sa.String(80), nullable=True))
    # Las plantas del prototipo quedan «solo comunidad» y sin validar (decide cada comunidad si las comparte)
    op.add_column("plantas", sa.Column("visibilidad", sa.String(20), nullable=False, server_default="adentro"))
    op.add_column("plantas", sa.Column("validada", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("plantas", sa.Column("autor_nombre", sa.String(120), nullable=True))
    op.add_column("plantas", sa.Column("client_id", sa.Uuid(), nullable=True))
    op.add_column("plantas", sa.Column("usuario_id", sa.Integer(), nullable=True))
    op.add_column("plantas", sa.Column("origen", sa.String(20), nullable=False, server_default="en_linea"))
    op.add_column("plantas", sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.execute("UPDATE plantas SET autor_nombre = 'Prototipo SABIA' WHERE autor_nombre IS NULL")
    op.create_check_constraint("ck_planta_visibilidad", "plantas", "visibilidad IN ('adentro', 'afuera')")
    op.create_check_constraint("ck_planta_origen", "plantas", "origen IN ('en_linea', 'cola_offline')")
    op.create_unique_constraint("uq_plantas_client_id", "plantas", ["client_id"])
    op.create_index("ix_plantas_visibilidad", "plantas", ["visibilidad"])
    op.create_foreign_key("fk_plantas_usuario", "plantas", "users", ["usuario_id"], ["id"], ondelete="SET NULL")


def downgrade() -> None:
    op.drop_constraint("fk_plantas_usuario", "plantas", type_="foreignkey")
    op.drop_index("ix_plantas_visibilidad", table_name="plantas")
    op.drop_constraint("uq_plantas_client_id", "plantas", type_="unique")
    op.drop_constraint("ck_planta_origen", "plantas", type_="check")
    op.drop_constraint("ck_planta_visibilidad", "plantas", type_="check")
    for col in ("creado_en", "origen", "usuario_id", "client_id", "autor_nombre", "validada", "visibilidad", "parte_utilizada", "nombre_nativo"):
        op.drop_column("plantas", col)
