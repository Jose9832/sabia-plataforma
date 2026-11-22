-- Configuración inicial de la base de datos (se ejecuta una sola vez al crear el volumen).
-- Zona horaria de Colombia para fechas legibles en reportes y bitácoras.
ALTER DATABASE sabia SET timezone TO 'America/Bogota';

-- Rol de solo lectura para tableros, auditoría o investigación (sin permisos de escritura).
-- Cambia la contraseña antes de usarlo fuera de tu computador.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'aluna_lectura') THEN
    CREATE ROLE aluna_lectura LOGIN PASSWORD 'lectura_local';
  END IF;
END $$;
GRANT CONNECT ON DATABASE sabia TO aluna_lectura;
GRANT USAGE ON SCHEMA public TO aluna_lectura;
ALTER DEFAULT PRIVILEGES FOR ROLE sabia IN SCHEMA public GRANT SELECT ON TABLES TO aluna_lectura;
