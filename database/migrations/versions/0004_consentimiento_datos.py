"""Autorización de tratamiento de datos personales al crear la cuenta

Revision ID: 0004
Revises: 0003
Create Date: 2026-11-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("consentimiento_datos_en", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("consentimiento_version", sa.String(30), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "consentimiento_version")
    op.drop_column("users", "consentimiento_datos_en")
