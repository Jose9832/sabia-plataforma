-- Limpieza de los datos de PRUEBA que dejaron las auditorías (cuentas de registro de prueba y alertas «PRUEBA»).
-- NO se ejecuta sola. Úsala a mano contra la base de datos que quieras limpiar:
--   · Render: panel → aluna-db → «Connect» → psql, o pega este archivo en la consola SQL.
--   · Local:  docker compose exec -T db psql -U sabia -d sabia < database/mantenimiento/limpiar_datos_de_prueba.sql
-- Primero muestra lo que va a borrar; si algo no es de prueba, cambia los filtros ANTES de seguir.

BEGIN;

-- 1) Vista previa (revisa esta lista)
SELECT id, email, nombre FROM users
 WHERE is_demo = false
   AND (email ~ '^p[0-9]{10,}@correo\.com$' OR email LIKE 'prueba.%@correo.com');
SELECT id, tipo, lugar, nota FROM alertas_veredales WHERE nota ILIKE '%PRUEBA%' OR lugar ILIKE '%PRUEBA%';

-- 2) Borrado. Las membresías y solicitudes de esas cuentas se van con ellas (ON DELETE CASCADE);
--    lo que hayan aportado queda sin autor (ON DELETE SET NULL).
DELETE FROM alertas_veredales WHERE nota ILIKE '%PRUEBA%' OR lugar ILIKE '%PRUEBA%';
DELETE FROM users
 WHERE is_demo = false
   AND (email ~ '^p[0-9]{10,}@correo\.com$' OR email LIKE 'prueba.%@correo.com');

-- 3) Si todo se ve bien, confirma con COMMIT; si algo no te convence, escribe ROLLBACK.
COMMIT;
