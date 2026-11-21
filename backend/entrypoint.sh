#!/bin/sh
set -e
echo "→ Aplicando migraciones (Alembic)…"
alembic upgrade head
if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "→ Cargando datos de ejemplo…"
  python -m app.seed
fi
echo "→ Iniciando API en :8000"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers
