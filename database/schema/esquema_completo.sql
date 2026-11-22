-- =============================================================================
-- ALUNA IA · SABIA & CEIBA — Esquema completo de PostgreSQL (REFERENCIA)
-- Generado desde las migraciones con:
--   cd backend && alembic -c ../database/alembic.ini upgrade base:head --sql
-- No lo ejecutes a mano: las tablas las crean las migraciones al arrancar el backend.
-- =============================================================================

BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 0001

CREATE TABLE encuentros (
    id SERIAL NOT NULL, 
    comunidad VARCHAR(20) NOT NULL, 
    tipo VARCHAR(40) NOT NULL, 
    titulo VARCHAR(200) NOT NULL, 
    fecha VARCHAR(80) NOT NULL, 
    hora VARCHAR(40) NOT NULL, 
    lugar VARCHAR(200) NOT NULL, 
    orienta VARCHAR(300) NOT NULL, 
    descripcion TEXT NOT NULL, 
    visibilidad VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_encuentro_comunidad CHECK (comunidad IN ('indigena', 'afro', 'campesina')), 
    CONSTRAINT ck_encuentro_visibilidad CHECK (visibilidad IN ('adentro', 'afuera'))
);

CREATE INDEX ix_encuentros_comunidad ON encuentros (comunidad);

CREATE TABLE historias_producto (
    id SERIAL NOT NULL, 
    nombre VARCHAR(200) NOT NULL, 
    color VARCHAR(9) NOT NULL, 
    autor VARCHAR(200) NOT NULL, 
    comunidad VARCHAR(20) NOT NULL, 
    material VARCHAR(200) NOT NULL, 
    historia TEXT NOT NULL, 
    contacto_autorizado BOOLEAN NOT NULL, 
    whatsapp VARCHAR(30) NOT NULL, 
    visibilidad VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_historia_comunidad CHECK (comunidad IN ('indigena', 'afro', 'campesina')), 
    CONSTRAINT ck_historia_visibilidad CHECK (visibilidad IN ('adentro', 'afuera'))
);

CREATE TABLE investigaciones (
    id SERIAL NOT NULL, 
    comunidades JSON NOT NULL, 
    titulo VARCHAR(200) NOT NULL, 
    grupo VARCHAR(200) NOT NULL, 
    estado VARCHAR(80) NOT NULL, 
    busca TEXT NOT NULL, 
    participar JSON NOT NULL, 
    devolucion TEXT NOT NULL, 
    PRIMARY KEY (id)
);

CREATE TABLE lugares (
    id SERIAL NOT NULL, 
    categoria VARCHAR(20) NOT NULL, 
    nombre VARCHAR(200) NOT NULL, 
    tipo VARCHAR(200) NOT NULL, 
    direccion VARCHAR(300) NOT NULL, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_lugares_categoria ON lugares (categoria);

CREATE TABLE plantas (
    id SERIAL NOT NULL, 
    slug VARCHAR(40) NOT NULL, 
    comunidad VARCHAR(20) NOT NULL, 
    nombre VARCHAR(120) NOT NULL, 
    cientifico VARCHAR(120), 
    color VARCHAR(9) NOT NULL, 
    uso TEXT NOT NULL, 
    preparacion TEXT NOT NULL, 
    precaucion TEXT NOT NULL, 
    hospital TEXT NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (slug), 
    CONSTRAINT ck_planta_comunidad CHECK (comunidad IN ('indigena', 'afro', 'campesina'))
);

CREATE INDEX ix_plantas_comunidad ON plantas (comunidad);

CREATE TABLE relatos (
    id SERIAL NOT NULL, 
    comunidad VARCHAR(20) NOT NULL, 
    titulo VARCHAR(200) NOT NULL, 
    sabedor VARCHAR(120) NOT NULL, 
    duracion VARCHAR(10) NOT NULL, 
    visibilidad VARCHAR(20) NOT NULL, 
    youtube VARCHAR(300) NOT NULL, 
    spotify VARCHAR(300) NOT NULL, 
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_relato_comunidad CHECK (comunidad IN ('indigena', 'afro', 'campesina')), 
    CONSTRAINT ck_relato_visibilidad CHECK (visibilidad IN ('adentro', 'afuera'))
);

CREATE INDEX ix_relatos_comunidad ON relatos (comunidad);

CREATE INDEX ix_relatos_visibilidad ON relatos (visibilidad);

CREATE TABLE usuarios (
    id SERIAL NOT NULL, 
    numero_identificacion VARCHAR(20) NOT NULL, 
    nombre VARCHAR(120) NOT NULL, 
    comunidad VARCHAR(20) NOT NULL, 
    clave_hash VARCHAR(255) NOT NULL, 
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT ck_usuario_comunidad CHECK (comunidad IN ('indigena', 'afro', 'campesina'))
);

CREATE UNIQUE INDEX ix_usuarios_numero_identificacion ON usuarios (numero_identificacion);

CREATE TABLE alertas_veredales (
    id SERIAL NOT NULL, 
    usuario_id INTEGER, 
    tipo VARCHAR(20) NOT NULL, 
    lugar VARCHAR(200) NOT NULL, 
    nota VARCHAR(500) NOT NULL, 
    foto TEXT, 
    hora VARCHAR(60) NOT NULL, 
    autor VARCHAR(120) NOT NULL, 
    client_id UUID, 
    creado_en_cliente TIMESTAMP WITH TIME ZONE, 
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL, 
    UNIQUE (client_id), 
    CONSTRAINT ck_alertas_veredales_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE TABLE cuadernos_cosecha (
    usuario_id INTEGER NOT NULL, 
    cultivo VARCHAR(30) NOT NULL, 
    cargas INTEGER, 
    precio BIGINT, 
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (usuario_id), 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE gastos_cosecha (
    id SERIAL NOT NULL, 
    usuario_id INTEGER NOT NULL, 
    cultivo VARCHAR(30) NOT NULL, 
    tipo VARCHAR(40) NOT NULL, 
    monto BIGINT NOT NULL, 
    client_id UUID, 
    creado_en_cliente TIMESTAMP WITH TIME ZONE, 
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
    UNIQUE (client_id), 
    CONSTRAINT ck_gastos_cosecha_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE INDEX ix_gastos_cosecha_usuario_id ON gastos_cosecha (usuario_id);

CREATE TABLE inscripciones (
    id SERIAL NOT NULL, 
    usuario_id INTEGER NOT NULL, 
    encuentro_id INTEGER NOT NULL, 
    client_id UUID, 
    creado_en_cliente TIMESTAMP WITH TIME ZONE, 
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(encuentro_id) REFERENCES encuentros (id) ON DELETE CASCADE, 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
    UNIQUE (client_id), 
    CONSTRAINT uq_inscripcion_usuario_encuentro UNIQUE (usuario_id, encuentro_id), 
    CONSTRAINT ck_inscripciones_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE INDEX ix_inscripciones_usuario_id ON inscripciones (usuario_id);

CREATE TABLE podcasts (
    id SERIAL NOT NULL, 
    client_id UUID, 
    usuario_id INTEGER, 
    comunidad VARCHAR(20) NOT NULL, 
    titulo VARCHAR(200) NOT NULL, 
    plataforma VARCHAR(20) NOT NULL, 
    embed VARCHAR(400) NOT NULL, 
    abrir VARCHAR(400) NOT NULL, 
    visibilidad VARCHAR(20) NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL, 
    UNIQUE (client_id), 
    CONSTRAINT ck_podcast_comunidad CHECK (comunidad IN ('indigena', 'afro', 'campesina')), 
    CONSTRAINT ck_podcast_visibilidad CHECK (visibilidad IN ('adentro', 'afuera')), 
    CONSTRAINT ck_podcast_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE INDEX ix_podcasts_comunidad ON podcasts (comunidad);

CREATE TABLE reportes_derechos (
    id SERIAL NOT NULL, 
    usuario_id INTEGER NOT NULL, 
    comunidad VARCHAR(20) NOT NULL, 
    tipo VARCHAR(30) NOT NULL, 
    tiene_audio BOOLEAN NOT NULL, 
    foto TEXT, 
    estado VARCHAR(20) NOT NULL, 
    client_id UUID, 
    creado_en_cliente TIMESTAMP WITH TIME ZONE, 
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
    UNIQUE (client_id), 
    CONSTRAINT ck_reporte_comunidad CHECK (comunidad IN ('indigena', 'afro', 'campesina')), 
    CONSTRAINT ck_reportes_derechos_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE INDEX ix_reportes_derechos_usuario_id ON reportes_derechos (usuario_id);

CREATE TABLE semillas_trueque (
    id SERIAL NOT NULL, 
    usuario_id INTEGER, 
    tipo VARCHAR(30) NOT NULL, 
    variedad VARCHAR(200) NOT NULL, 
    cantidad VARCHAR(100) NOT NULL, 
    busca VARCHAR(200) NOT NULL, 
    familia VARCHAR(120) NOT NULL, 
    vereda VARCHAR(120) NOT NULL, 
    es_ejemplo BOOLEAN NOT NULL, 
    client_id UUID, 
    creado_en_cliente TIMESTAMP WITH TIME ZONE, 
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
    UNIQUE (client_id), 
    CONSTRAINT ck_semillas_trueque_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE INDEX ix_semillas_trueque_usuario_id ON semillas_trueque (usuario_id);

CREATE TABLE solicitudes_investigacion (
    id SERIAL NOT NULL, 
    usuario_id INTEGER NOT NULL, 
    investigacion_id INTEGER NOT NULL, 
    acepta_derechos BOOLEAN NOT NULL, 
    client_id UUID, 
    creado_en_cliente TIMESTAMP WITH TIME ZONE, 
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(investigacion_id) REFERENCES investigaciones (id) ON DELETE CASCADE, 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
    UNIQUE (client_id), 
    CONSTRAINT uq_solicitud_usuario_investigacion UNIQUE (usuario_id, investigacion_id), 
    CONSTRAINT ck_solicitudes_investigacion_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE INDEX ix_solicitudes_investigacion_usuario_id ON solicitudes_investigacion (usuario_id);

CREATE TABLE solicitudes_trueque (
    id SERIAL NOT NULL, 
    usuario_id INTEGER NOT NULL, 
    semilla_id INTEGER NOT NULL, 
    client_id UUID, 
    creado_en_cliente TIMESTAMP WITH TIME ZONE, 
    sincronizado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    origen VARCHAR(20) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(semilla_id) REFERENCES semillas_trueque (id) ON DELETE CASCADE, 
    FOREIGN KEY(usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE, 
    UNIQUE (client_id), 
    CONSTRAINT uq_trueque_usuario_semilla UNIQUE (usuario_id, semilla_id), 
    CONSTRAINT ck_solicitudes_trueque_origen CHECK (origen IN ('en_linea', 'cola_offline'))
);

CREATE INDEX ix_solicitudes_trueque_usuario_id ON solicitudes_trueque (usuario_id);

INSERT INTO alembic_version (version_num) VALUES ('0001') RETURNING alembic_version.version_num;

-- Running upgrade 0001 -> 0002

ALTER TABLE usuarios RENAME TO users;

ALTER INDEX ix_usuarios_numero_identificacion RENAME TO ix_users_numero_identificacion;

ALTER TABLE users ALTER COLUMN comunidad DROP NOT NULL;

ALTER TABLE users RENAME comunidad TO comunidad_salud;

ALTER TABLE users ALTER COLUMN numero_identificacion DROP NOT NULL;

ALTER TABLE users ADD COLUMN codigo VARCHAR(60);

UPDATE users SET codigo = 'user_sabia_' || id WHERE codigo IS NULL;

ALTER TABLE users ALTER COLUMN codigo SET NOT NULL;

CREATE UNIQUE INDEX ix_users_codigo ON users (codigo);

ALTER TABLE users ADD COLUMN email VARCHAR(160);

CREATE UNIQUE INDEX ix_users_email ON users (email);

ALTER TABLE users ADD COLUMN identity VARCHAR(30) DEFAULT 'community_member' NOT NULL;

ALTER TABLE users ADD COLUMN role_label VARCHAR(120) DEFAULT 'Integrante comunitario' NOT NULL;

ALTER TABLE users ADD COLUMN avatar VARCHAR(300) DEFAULT '' NOT NULL;

ALTER TABLE users ADD COLUMN organization VARCHAR(200);

ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '' NOT NULL;

ALTER TABLE users ADD COLUMN is_demo BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE users ADD COLUMN is_technical_admin BOOLEAN DEFAULT false NOT NULL;

CREATE TABLE canales_bienestar (
    id VARCHAR(60) NOT NULL, 
    category VARCHAR(30) NOT NULL, 
    title VARCHAR(200) NOT NULL, 
    description TEXT NOT NULL, 
    community_target VARCHAR(200) NOT NULL, 
    channel_info VARCHAR(200) NOT NULL, 
    status VARCHAR(30) NOT NULL, 
    PRIMARY KEY (id)
);

CREATE TABLE communities (
    id VARCHAR(60) NOT NULL, 
    name VARCHAR(200) NOT NULL, 
    cultural_category VARCHAR(120), 
    region VARCHAR(200) NOT NULL, 
    description TEXT NOT NULL, 
    cultural_context TEXT NOT NULL, 
    photo_url VARCHAR(300) NOT NULL, 
    tags JSON NOT NULL, 
    custodians JSON NOT NULL, 
    members_count INTEGER NOT NULL, 
    participation_guidelines TEXT NOT NULL, 
    policies JSON NOT NULL, 
    is_demo BOOLEAN NOT NULL, 
    modulo_salud VARCHAR(20), 
    PRIMARY KEY (id), 
    CONSTRAINT ck_community_modulo_salud CHECK (modulo_salud IN ('indigena', 'afro', 'campesina'))
);

CREATE TABLE affiliation_requests (
    id VARCHAR(60) NOT NULL, 
    user_id INTEGER NOT NULL, 
    community_id VARCHAR(60) NOT NULL, 
    rationale TEXT NOT NULL, 
    status VARCHAR(20) NOT NULL, 
    request_date VARCHAR(40) NOT NULL, 
    response_note TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(community_id) REFERENCES communities (id), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_affiliation_requests_status ON affiliation_requests (status);

CREATE INDEX ix_affiliation_requests_user_id ON affiliation_requests (user_id);

CREATE TABLE audit_events (
    id SERIAL NOT NULL, 
    actor_user_id INTEGER, 
    event_type VARCHAR(60) NOT NULL, 
    resource_type VARCHAR(40) NOT NULL, 
    resource_id VARCHAR(60), 
    community_id VARCHAR(60), 
    detail JSON NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(actor_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_audit_events_actor_user_id ON audit_events (actor_user_id);

CREATE INDEX ix_audit_events_created_at ON audit_events (created_at);

CREATE TABLE knowledges (
    id VARCHAR(60) NOT NULL, 
    title VARCHAR(300) NOT NULL, 
    type VARCHAR(20) NOT NULL, 
    author VARCHAR(200) NOT NULL, 
    author_role VARCHAR(200) NOT NULL, 
    created_by INTEGER, 
    author_codigo VARCHAR(60) NOT NULL, 
    is_collective BOOLEAN NOT NULL, 
    date VARCHAR(40) NOT NULL, 
    description TEXT NOT NULL, 
    excerpt_for_public TEXT, 
    full_content TEXT NOT NULL, 
    media_url VARCHAR(300), 
    audio_url VARCHAR(300), 
    video_url VARCHAR(300), 
    audio_duration VARCHAR(20), 
    tags JSON NOT NULL, 
    status VARCHAR(30) NOT NULL, 
    permissions JSON NOT NULL, 
    educational_data JSON NOT NULL, 
    authorized_user_ids JSON NOT NULL, 
    is_demo BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_knowledges_created_by ON knowledges (created_by);

CREATE INDEX ix_knowledges_status ON knowledges (status);

CREATE TABLE memberships (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    community_id VARCHAR(60) NOT NULL, 
    role VARCHAR(30) NOT NULL, 
    status VARCHAR(20) NOT NULL, 
    joined_date VARCHAR(40), 
    verified_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(community_id) REFERENCES communities (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT uq_membership_user_community UNIQUE (user_id, community_id)
);

CREATE INDEX ix_memberships_community_id ON memberships (community_id);

CREATE INDEX ix_memberships_user_id ON memberships (user_id);

CREATE TABLE solicitudes_orientacion (
    id SERIAL NOT NULL, 
    usuario_id INTEGER NOT NULL, 
    canal_id VARCHAR(60), 
    descripcion TEXT NOT NULL, 
    estado VARCHAR(20) NOT NULL, 
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    client_id VARCHAR(64), 
    PRIMARY KEY (id), 
    CONSTRAINT uq_orientacion_usuario_client UNIQUE (usuario_id, client_id), 
    FOREIGN KEY(canal_id) REFERENCES canales_bienestar (id) ON DELETE SET NULL, 
    FOREIGN KEY(usuario_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_solicitudes_orientacion_usuario_id ON solicitudes_orientacion (usuario_id);

CREATE TABLE access_requests (
    id VARCHAR(60) NOT NULL, 
    knowledge_id VARCHAR(60) NOT NULL, 
    requester_id INTEGER NOT NULL, 
    community_id VARCHAR(60) NOT NULL, 
    purpose TEXT NOT NULL, 
    requested_permissions JSON NOT NULL, 
    status VARCHAR(30) NOT NULL, 
    request_date VARCHAR(40) NOT NULL, 
    response_date VARCHAR(40), 
    response_note TEXT, 
    custodian_user_id INTEGER, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(community_id) REFERENCES communities (id), 
    FOREIGN KEY(custodian_user_id) REFERENCES users (id) ON DELETE SET NULL, 
    FOREIGN KEY(knowledge_id) REFERENCES knowledges (id) ON DELETE CASCADE, 
    FOREIGN KEY(requester_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_access_requests_knowledge_id ON access_requests (knowledge_id);

CREATE INDEX ix_access_requests_requester_id ON access_requests (requester_id);

CREATE INDEX ix_access_requests_status ON access_requests (status);

CREATE TABLE ai_generations (
    id VARCHAR(60) NOT NULL, 
    user_id INTEGER NOT NULL, 
    knowledge_id VARCHAR(60) NOT NULL, 
    community_ids JSON NOT NULL, 
    community_name VARCHAR(300) NOT NULL, 
    type VARCHAR(30) NOT NULL, 
    title VARCHAR(400) NOT NULL, 
    summary TEXT NOT NULL, 
    generated_at VARCHAR(60) NOT NULL, 
    status VARCHAR(40) NOT NULL, 
    public BOOLEAN NOT NULL, 
    custodian_feedback TEXT, 
    payload JSON NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(knowledge_id) REFERENCES knowledges (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_ai_generations_knowledge_id ON ai_generations (knowledge_id);

CREATE INDEX ix_ai_generations_status ON ai_generations (status);

CREATE INDEX ix_ai_generations_user_id ON ai_generations (user_id);

CREATE TABLE approvals (
    id SERIAL NOT NULL, 
    knowledge_id VARCHAR(60) NOT NULL, 
    community_id VARCHAR(60) NOT NULL, 
    community_name VARCHAR(200) NOT NULL, 
    custodian_user_id INTEGER, 
    custodian_codigo VARCHAR(60), 
    custodian_name VARCHAR(200), 
    status VARCHAR(30) NOT NULL, 
    note TEXT, 
    decision_date VARCHAR(40), 
    PRIMARY KEY (id), 
    FOREIGN KEY(community_id) REFERENCES communities (id), 
    FOREIGN KEY(custodian_user_id) REFERENCES users (id) ON DELETE SET NULL, 
    FOREIGN KEY(knowledge_id) REFERENCES knowledges (id) ON DELETE CASCADE, 
    CONSTRAINT uq_approval_knowledge_community UNIQUE (knowledge_id, community_id)
);

CREATE INDEX ix_approvals_knowledge_id ON approvals (knowledge_id);

CREATE TABLE knowledge_owners (
    knowledge_id VARCHAR(60) NOT NULL, 
    community_id VARCHAR(60) NOT NULL, 
    position INTEGER NOT NULL, 
    PRIMARY KEY (knowledge_id, community_id), 
    FOREIGN KEY(community_id) REFERENCES communities (id), 
    FOREIGN KEY(knowledge_id) REFERENCES knowledges (id) ON DELETE CASCADE
);

CREATE TABLE access_grants (
    id VARCHAR(60) NOT NULL, 
    knowledge_id VARCHAR(60) NOT NULL, 
    user_id INTEGER NOT NULL, 
    request_id VARCHAR(60), 
    granted_by INTEGER, 
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    expires_at TIMESTAMP WITH TIME ZONE, 
    revoked_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id), 
    FOREIGN KEY(granted_by) REFERENCES users (id) ON DELETE SET NULL, 
    FOREIGN KEY(knowledge_id) REFERENCES knowledges (id) ON DELETE CASCADE, 
    FOREIGN KEY(request_id) REFERENCES access_requests (id) ON DELETE SET NULL, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    CONSTRAINT uq_grant_knowledge_user UNIQUE (knowledge_id, user_id)
);

CREATE INDEX ix_access_grants_knowledge_id ON access_grants (knowledge_id);

CREATE INDEX ix_access_grants_user_id ON access_grants (user_id);

UPDATE alembic_version SET version_num='0002' WHERE alembic_version.version_num = '0001';

COMMIT;

