-- =============================================================================
-- ALUNA IA — Módulo SABIA & CEIBA (UNIMAGDALENA)
-- Esquema Relacional Mínimo, Políticas RLS (PostgreSQL / Supabase) y Endpoints
-- =============================================================================
-- IMPORTANTE: Ninguna API key privada de proveedores LLM debe ubicarse en VITE_*.
-- Los secretos de IA residen exclusivamente en el servidor / Edge Functions.

create type membership_status as enum ('pending', 'verified', 'rejected', 'revoked');
create type membership_role as enum ('member', 'custodian');
create type consultation_level as enum ('public', 'community', 'restricted', 'private');
create type knowledge_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'revoked');
create type ai_operation as enum ('query', 'transcribe', 'transform', 'generate_audio', 'publish_derivative');
create type decision_status as enum ('pending', 'approved', 'rejected', 'revoked');

create table users (
  id uuid primary key,
  display_name text not null,
  email text unique,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table cultural_categories (
  id uuid primary key,
  name text not null
);

create table communities (
  id uuid primary key,
  cultural_category_id uuid references cultural_categories(id),
  name text not null,
  is_demo boolean not null default true,
  verified_real_world_identity boolean not null default false
);

create table memberships (
  id uuid primary key,
  user_id uuid not null references users(id),
  community_id uuid not null references communities(id),
  role membership_role not null,
  status membership_status not null default 'pending',
  verified_at timestamptz,
  revoked_at timestamptz,
  unique (user_id, community_id)
);

create table knowledges (
  id uuid primary key,
  title text not null,
  description text,
  created_by uuid not null references users(id),
  consultation_level consultation_level not null,
  status knowledge_status not null default 'draft',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table knowledge_owners (
  knowledge_id uuid not null references knowledges(id) on delete cascade,
  community_id uuid not null references communities(id),
  primary key (knowledge_id, community_id)
);

create table assets (
  id uuid primary key,
  knowledge_id uuid not null references knowledges(id) on delete cascade,
  storage_key text not null,
  mime_type text not null,
  original_name text,
  created_at timestamptz not null default now()
);

create table ai_permissions (
  id uuid primary key,
  knowledge_id uuid not null references knowledges(id) on delete cascade,
  operation ai_operation not null,
  allowed boolean not null default false,
  requires_output_review boolean not null default true,
  external_provider_allowed boolean not null default false,
  expires_at timestamptz,
  revoked_at timestamptz,
  unique (knowledge_id, operation)
);

create table access_requests (
  id uuid primary key,
  knowledge_id uuid not null references knowledges(id),
  requester_id uuid not null references users(id),
  purpose text not null,
  status decision_status not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table access_grants (
  id uuid primary key,
  knowledge_id uuid not null references knowledges(id),
  user_id uuid not null references users(id),
  request_id uuid references access_requests(id),
  expires_at timestamptz,
  revoked_at timestamptz,
  unique (knowledge_id, user_id)
);

create table approvals (
  id uuid primary key,
  knowledge_id uuid references knowledges(id),
  ai_generation_id uuid,
  community_id uuid not null references communities(id),
  custodian_user_id uuid not null references users(id),
  status decision_status not null default 'pending',
  decided_at timestamptz
);

create table ai_generations (
  id uuid primary key,
  user_id uuid not null references users(id),
  knowledge_id uuid not null references knowledges(id),
  operation ai_operation not null,
  output_text text,
  review_status decision_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table ai_citations (
  id uuid primary key,
  generation_id uuid not null references ai_generations(id) on delete cascade,
  asset_id uuid not null references assets(id),
  chunk_ref text not null,
  excerpt text
);

create table audit_events (
  id uuid primary key,
  actor_user_id uuid references users(id),
  event_type text not null,
  resource_type text not null,
  resource_id uuid,
  community_id uuid references communities(id),
  created_at timestamptz not null default now()
);

-- Row Level Security (RLS)
alter table knowledges enable row level security;
alter table memberships enable row level security;
alter table ai_generations enable row level security;
alter table access_requests enable row level security;

-- Endpoints REST v1 de Referencia:
-- GET    /api/v1/me
-- POST   /api/v1/auth/login
-- POST   /api/v1/auth/logout
-- GET    /api/v1/communities
-- GET    /api/v1/communities/:id
-- GET    /api/v1/knowledges
-- GET    /api/v1/knowledges/:id
-- POST   /api/v1/knowledges
-- PATCH  /api/v1/knowledges/:id
-- POST   /api/v1/knowledges/:id/access-requests
-- GET    /api/v1/access-requests/me
-- GET    /api/v1/custody/review-queue
-- POST   /api/v1/reviews/:id/decisions
-- POST   /api/v1/ai/query
-- POST   /api/v1/ai/transform
-- GET    /api/v1/ai/outputs/:id
-- POST   /api/v1/ai/outputs/:id/decisions
-- POST   /api/v1/permissions/:knowledgeId/revoke
