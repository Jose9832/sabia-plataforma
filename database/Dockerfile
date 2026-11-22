# Base de datos de ALUNA IA · SABIA & CEIBA (PostgreSQL 16).
# Los scripts de init/ corren SOLO la primera vez que se crea el volumen.
# Las tablas las crean las migraciones de database/migrations (Alembic) al arrancar el backend.
FROM postgres:16-alpine
ENV TZ=America/Bogota
COPY init/ /docker-entrypoint-initdb.d/
