"""Plataforma ALUNA (SABIA & CEIBA): usuario único, comunidades, saberes, custodia, IA y bienestar

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- 1. Usuario único (contrato ALUNA: tabla `users`) ---------------------------------
    op.rename_table("usuarios", "users")
    op.execute("ALTER INDEX ix_usuarios_numero_identificacion RENAME TO ix_users_numero_identificacion")
    op.alter_column("users", "comunidad", new_column_name="comunidad_salud", nullable=True)
    op.alter_column("users", "numero_identificacion", nullable=True)
    op.add_column("users", sa.Column("codigo", sa.String(length=60), nullable=True))
    op.execute("UPDATE users SET codigo = 'user_sabia_' || id WHERE codigo IS NULL")
    op.alter_column("users", "codigo", nullable=False)
    op.create_index("ix_users_codigo", "users", ["codigo"], unique=True)
    op.add_column("users", sa.Column("email", sa.String(length=160), nullable=True))
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.add_column("users", sa.Column("identity", sa.String(length=30), nullable=False, server_default="community_member"))
    op.add_column("users", sa.Column("role_label", sa.String(length=120), nullable=False, server_default="Integrante comunitario"))
    op.add_column("users", sa.Column("avatar", sa.String(length=300), nullable=False, server_default=""))
    op.add_column("users", sa.Column("organization", sa.String(length=200), nullable=True))
    op.add_column("users", sa.Column("bio", sa.Text(), nullable=False, server_default=""))
    op.add_column("users", sa.Column("is_demo", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("is_technical_admin", sa.Boolean(), nullable=False, server_default=sa.false()))

    # --- 2. Tablas de ALUNA (contrato del equipo) y del módulo de Bienestar ---------------
    op.create_table('canales_bienestar',
    sa.Column('id', sa.String(length=60), nullable=False),
    sa.Column('category', sa.String(length=30), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('community_target', sa.String(length=200), nullable=False),
    sa.Column('channel_info', sa.String(length=200), nullable=False),
    sa.Column('status', sa.String(length=30), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('communities',
    sa.Column('id', sa.String(length=60), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('cultural_category', sa.String(length=120), nullable=True),
    sa.Column('region', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('cultural_context', sa.Text(), nullable=False),
    sa.Column('photo_url', sa.String(length=300), nullable=False),
    sa.Column('tags', sa.JSON(), nullable=False),
    sa.Column('custodians', sa.JSON(), nullable=False),
    sa.Column('members_count', sa.Integer(), nullable=False),
    sa.Column('participation_guidelines', sa.Text(), nullable=False),
    sa.Column('policies', sa.JSON(), nullable=False),
    sa.Column('is_demo', sa.Boolean(), nullable=False),
    sa.Column('modulo_salud', sa.Enum('indigena', 'afro', 'campesina', name='ck_community_modulo_salud', native_enum=False, create_constraint=True, length=20), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('affiliation_requests',
    sa.Column('id', sa.String(length=60), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('community_id', sa.String(length=60), nullable=False),
    sa.Column('rationale', sa.Text(), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('request_date', sa.String(length=40), nullable=False),
    sa.Column('response_note', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_affiliation_requests_status'), 'affiliation_requests', ['status'], unique=False)
    op.create_index(op.f('ix_affiliation_requests_user_id'), 'affiliation_requests', ['user_id'], unique=False)
    op.create_table('audit_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('actor_user_id', sa.Integer(), nullable=True),
    sa.Column('event_type', sa.String(length=60), nullable=False),
    sa.Column('resource_type', sa.String(length=40), nullable=False),
    sa.Column('resource_id', sa.String(length=60), nullable=True),
    sa.Column('community_id', sa.String(length=60), nullable=True),
    sa.Column('detail', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_events_actor_user_id'), 'audit_events', ['actor_user_id'], unique=False)
    op.create_index(op.f('ix_audit_events_created_at'), 'audit_events', ['created_at'], unique=False)
    op.create_table('knowledges',
    sa.Column('id', sa.String(length=60), nullable=False),
    sa.Column('title', sa.String(length=300), nullable=False),
    sa.Column('type', sa.String(length=20), nullable=False),
    sa.Column('author', sa.String(length=200), nullable=False),
    sa.Column('author_role', sa.String(length=200), nullable=False),
    sa.Column('created_by', sa.Integer(), nullable=True),
    sa.Column('author_codigo', sa.String(length=60), nullable=False),
    sa.Column('is_collective', sa.Boolean(), nullable=False),
    sa.Column('date', sa.String(length=40), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('excerpt_for_public', sa.Text(), nullable=True),
    sa.Column('full_content', sa.Text(), nullable=False),
    sa.Column('media_url', sa.String(length=300), nullable=True),
    sa.Column('audio_url', sa.String(length=300), nullable=True),
    sa.Column('video_url', sa.String(length=300), nullable=True),
    sa.Column('audio_duration', sa.String(length=20), nullable=True),
    sa.Column('tags', sa.JSON(), nullable=False),
    sa.Column('status', sa.String(length=30), nullable=False),
    sa.Column('permissions', sa.JSON(), nullable=False),
    sa.Column('educational_data', sa.JSON(), nullable=False),
    sa.Column('authorized_user_ids', sa.JSON(), nullable=False),
    sa.Column('is_demo', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_knowledges_created_by'), 'knowledges', ['created_by'], unique=False)
    op.create_index(op.f('ix_knowledges_status'), 'knowledges', ['status'], unique=False)
    op.create_table('memberships',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('community_id', sa.String(length=60), nullable=False),
    sa.Column('role', sa.String(length=30), nullable=False),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('joined_date', sa.String(length=40), nullable=True),
    sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'community_id', name='uq_membership_user_community')
    )
    op.create_index(op.f('ix_memberships_community_id'), 'memberships', ['community_id'], unique=False)
    op.create_index(op.f('ix_memberships_user_id'), 'memberships', ['user_id'], unique=False)
    op.create_table('solicitudes_orientacion',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('usuario_id', sa.Integer(), nullable=False),
    sa.Column('canal_id', sa.String(length=60), nullable=True),
    sa.Column('descripcion', sa.Text(), nullable=False),
    sa.Column('estado', sa.String(length=20), nullable=False),
    sa.Column('creado_en', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['canal_id'], ['canales_bienestar.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['usuario_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_solicitudes_orientacion_usuario_id'), 'solicitudes_orientacion', ['usuario_id'], unique=False)
    op.create_table('access_requests',
    sa.Column('id', sa.String(length=60), nullable=False),
    sa.Column('knowledge_id', sa.String(length=60), nullable=False),
    sa.Column('requester_id', sa.Integer(), nullable=False),
    sa.Column('community_id', sa.String(length=60), nullable=False),
    sa.Column('purpose', sa.Text(), nullable=False),
    sa.Column('requested_permissions', sa.JSON(), nullable=False),
    sa.Column('status', sa.String(length=30), nullable=False),
    sa.Column('request_date', sa.String(length=40), nullable=False),
    sa.Column('response_date', sa.String(length=40), nullable=True),
    sa.Column('response_note', sa.Text(), nullable=True),
    sa.Column('custodian_user_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ),
    sa.ForeignKeyConstraint(['custodian_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['knowledge_id'], ['knowledges.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_access_requests_knowledge_id'), 'access_requests', ['knowledge_id'], unique=False)
    op.create_index(op.f('ix_access_requests_requester_id'), 'access_requests', ['requester_id'], unique=False)
    op.create_index(op.f('ix_access_requests_status'), 'access_requests', ['status'], unique=False)
    op.create_table('ai_generations',
    sa.Column('id', sa.String(length=60), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('knowledge_id', sa.String(length=60), nullable=False),
    sa.Column('community_ids', sa.JSON(), nullable=False),
    sa.Column('community_name', sa.String(length=300), nullable=False),
    sa.Column('type', sa.String(length=30), nullable=False),
    sa.Column('title', sa.String(length=400), nullable=False),
    sa.Column('summary', sa.Text(), nullable=False),
    sa.Column('generated_at', sa.String(length=60), nullable=False),
    sa.Column('status', sa.String(length=40), nullable=False),
    sa.Column('public', sa.Boolean(), nullable=False),
    sa.Column('custodian_feedback', sa.Text(), nullable=True),
    sa.Column('payload', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['knowledge_id'], ['knowledges.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_generations_knowledge_id'), 'ai_generations', ['knowledge_id'], unique=False)
    op.create_index(op.f('ix_ai_generations_status'), 'ai_generations', ['status'], unique=False)
    op.create_index(op.f('ix_ai_generations_user_id'), 'ai_generations', ['user_id'], unique=False)
    op.create_table('approvals',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('knowledge_id', sa.String(length=60), nullable=False),
    sa.Column('community_id', sa.String(length=60), nullable=False),
    sa.Column('community_name', sa.String(length=200), nullable=False),
    sa.Column('custodian_user_id', sa.Integer(), nullable=True),
    sa.Column('custodian_codigo', sa.String(length=60), nullable=True),
    sa.Column('custodian_name', sa.String(length=200), nullable=True),
    sa.Column('status', sa.String(length=30), nullable=False),
    sa.Column('note', sa.Text(), nullable=True),
    sa.Column('decision_date', sa.String(length=40), nullable=True),
    sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ),
    sa.ForeignKeyConstraint(['custodian_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['knowledge_id'], ['knowledges.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('knowledge_id', 'community_id', name='uq_approval_knowledge_community')
    )
    op.create_index(op.f('ix_approvals_knowledge_id'), 'approvals', ['knowledge_id'], unique=False)
    op.create_table('knowledge_owners',
    sa.Column('knowledge_id', sa.String(length=60), nullable=False),
    sa.Column('community_id', sa.String(length=60), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['community_id'], ['communities.id'], ),
    sa.ForeignKeyConstraint(['knowledge_id'], ['knowledges.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('knowledge_id', 'community_id')
    )
    op.create_table('access_grants',
    sa.Column('id', sa.String(length=60), nullable=False),
    sa.Column('knowledge_id', sa.String(length=60), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('request_id', sa.String(length=60), nullable=True),
    sa.Column('granted_by', sa.Integer(), nullable=True),
    sa.Column('granted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['granted_by'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['knowledge_id'], ['knowledges.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['request_id'], ['access_requests.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('knowledge_id', 'user_id', name='uq_grant_knowledge_user')
    )
    op.create_index(op.f('ix_access_grants_knowledge_id'), 'access_grants', ['knowledge_id'], unique=False)
    op.create_index(op.f('ix_access_grants_user_id'), 'access_grants', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_access_grants_user_id'), table_name='access_grants')
    op.drop_index(op.f('ix_access_grants_knowledge_id'), table_name='access_grants')
    op.drop_table('access_grants')
    op.drop_table('knowledge_owners')
    op.drop_index(op.f('ix_approvals_knowledge_id'), table_name='approvals')
    op.drop_table('approvals')
    op.drop_index(op.f('ix_ai_generations_user_id'), table_name='ai_generations')
    op.drop_index(op.f('ix_ai_generations_status'), table_name='ai_generations')
    op.drop_index(op.f('ix_ai_generations_knowledge_id'), table_name='ai_generations')
    op.drop_table('ai_generations')
    op.drop_index(op.f('ix_access_requests_status'), table_name='access_requests')
    op.drop_index(op.f('ix_access_requests_requester_id'), table_name='access_requests')
    op.drop_index(op.f('ix_access_requests_knowledge_id'), table_name='access_requests')
    op.drop_table('access_requests')
    op.drop_index(op.f('ix_solicitudes_orientacion_usuario_id'), table_name='solicitudes_orientacion')
    op.drop_table('solicitudes_orientacion')
    op.drop_index(op.f('ix_memberships_user_id'), table_name='memberships')
    op.drop_index(op.f('ix_memberships_community_id'), table_name='memberships')
    op.drop_table('memberships')
    op.drop_index(op.f('ix_knowledges_status'), table_name='knowledges')
    op.drop_index(op.f('ix_knowledges_created_by'), table_name='knowledges')
    op.drop_table('knowledges')
    op.drop_index(op.f('ix_audit_events_created_at'), table_name='audit_events')
    op.drop_index(op.f('ix_audit_events_actor_user_id'), table_name='audit_events')
    op.drop_table('audit_events')
    op.drop_index(op.f('ix_affiliation_requests_user_id'), table_name='affiliation_requests')
    op.drop_index(op.f('ix_affiliation_requests_status'), table_name='affiliation_requests')
    op.drop_table('affiliation_requests')
    op.drop_table('communities')
    op.drop_table('canales_bienestar')
    for col in ("is_technical_admin", "is_demo", "bio", "organization", "avatar", "role_label", "identity"):
        op.drop_column("users", col)
    op.drop_index("ix_users_email", table_name="users")
    op.drop_column("users", "email")
    op.drop_index("ix_users_codigo", table_name="users")
    op.drop_column("users", "codigo")
    op.execute("DELETE FROM users WHERE comunidad_salud IS NULL OR numero_identificacion IS NULL")
    op.alter_column("users", "numero_identificacion", nullable=False)
    op.alter_column("users", "comunidad_salud", new_column_name="comunidad", nullable=False)
    op.execute("ALTER INDEX ix_users_numero_identificacion RENAME TO ix_usuarios_numero_identificacion")
    op.rename_table("users", "usuarios")
