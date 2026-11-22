-- =============================================================================
-- ALUNA IA · Row-Level Security (RLS) — defensa en profundidad (OPCIONAL)
--
-- La API ya aplica toda la autorización (backend/app/domain/autorizacion.py).
-- Estas políticas son una segunda barrera para quien se conecte directo a la base
-- con un rol distinto al dueño (p. ej. tableros, Supabase o análisis): cada consulta
-- debe declarar quién es con   SET app.user_codigo = 'user_member_sierra';
--
-- El rol dueño de las tablas (sabia, el que usa la API) no se ve afectado.
-- Aplicar:   docker compose exec -T db psql -U sabia -d sabia < database/schema/politicas_rls.sql
-- =============================================================================

-- Comunidades donde la persona actual es integrante o custodia VERIFICADA
CREATE OR REPLACE FUNCTION aluna_comunidades_verificadas() RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.community_id
  FROM memberships m JOIN users u ON u.id = m.user_id
  WHERE u.codigo = current_setting('app.user_codigo', true)
    AND m.status = 'verified' AND m.role <> 'none'
$$;

CREATE OR REPLACE FUNCTION aluna_comunidades_custodiadas() RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.community_id
  FROM memberships m JOIN users u ON u.id = m.user_id
  WHERE u.codigo = current_setting('app.user_codigo', true)
    AND m.status = 'verified' AND m.role = 'custodian'
$$;

-- ---------- Saberes: público aprobado, o de mis comunidades, o con permiso explícito ----------
ALTER TABLE knowledges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS saberes_lectura ON knowledges;
CREATE POLICY saberes_lectura ON knowledges FOR SELECT USING (
  (status = 'approved' AND permissions->>'consultation' = 'public')
  OR author_codigo = current_setting('app.user_codigo', true)
  OR EXISTS (SELECT 1 FROM knowledge_owners o WHERE o.knowledge_id = knowledges.id
             AND o.community_id IN (SELECT aluna_comunidades_custodiadas()))
  OR (status = 'approved' AND permissions->>'consultation' = 'community' AND EXISTS (
        SELECT 1 FROM knowledge_owners o WHERE o.knowledge_id = knowledges.id
        AND o.community_id IN (SELECT aluna_comunidades_verificadas())))
  OR (status = 'approved' AND EXISTS (
        SELECT 1 FROM access_grants g JOIN users u ON u.id = g.user_id
        WHERE g.knowledge_id = knowledges.id AND u.codigo = current_setting('app.user_codigo', true)
          AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at > now())))
);

-- ---------- Membresías: las propias y las de las comunidades que custodio ----------
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS membresias_lectura ON memberships;
CREATE POLICY membresias_lectura ON memberships FOR SELECT USING (
  user_id = (SELECT id FROM users WHERE codigo = current_setting('app.user_codigo', true))
  OR community_id IN (SELECT aluna_comunidades_custodiadas())
);

-- ---------- Solicitudes de acceso: las mías y las de mis comunidades custodiadas ----------
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS solicitudes_lectura ON access_requests;
CREATE POLICY solicitudes_lectura ON access_requests FOR SELECT USING (
  requester_id = (SELECT id FROM users WHERE codigo = current_setting('app.user_codigo', true))
  OR community_id IN (SELECT aluna_comunidades_custodiadas())
);

-- ---------- Derivados de IA: los míos, los de mis comunidades custodiadas y los publicados ----------
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS derivados_lectura ON ai_generations;
CREATE POLICY derivados_lectura ON ai_generations FOR SELECT USING (
  user_id = (SELECT id FROM users WHERE codigo = current_setting('app.user_codigo', true))
  OR EXISTS (SELECT 1 FROM json_array_elements_text(community_ids) c
             WHERE c IN (SELECT aluna_comunidades_custodiadas()))
  OR (status = 'approved_by_custodian' AND public)
);

-- ---------- Datos de Salud: cada persona solo ve sus propios reportes y orientaciones ----------
ALTER TABLE reportes_derechos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reportes_propios ON reportes_derechos;
CREATE POLICY reportes_propios ON reportes_derechos FOR SELECT USING (
  usuario_id = (SELECT id FROM users WHERE codigo = current_setting('app.user_codigo', true))
);

ALTER TABLE solicitudes_orientacion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS orientaciones_propias ON solicitudes_orientacion;
CREATE POLICY orientaciones_propias ON solicitudes_orientacion FOR SELECT USING (
  usuario_id = (SELECT id FROM users WHERE codigo = current_setting('app.user_codigo', true))
);
