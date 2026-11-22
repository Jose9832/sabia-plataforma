"""Solicitudes de orientación idempotentes: id generado en el cliente (cola sin conexión)

Revision ID: 0003
Revises: 0002
Create Date: 2026-11-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("solicitudes_orientacion", sa.Column("client_id", sa.String(64), nullable=True))
    op.create_unique_constraint("uq_orientacion_usuario_client", "solicitudes_orientacion", ["usuario_id", "client_id"])


def downgrade() -> None:
    op.drop_constraint("uq_orientacion_usuario_client", "solicitudes_orientacion", type_="unique")
    op.drop_column("solicitudes_orientacion", "client_id")
