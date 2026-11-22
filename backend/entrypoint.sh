#!/bin/sh
set -e
echo "→ Aplicando migraciones (database/migrations)…"
alembic -c /database/alembic.ini upgrade head
if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "→ Cargando datos semilla (database/seeds)…"
  python -m app.seed
fi
echo "→ Iniciando API en :8000"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers
