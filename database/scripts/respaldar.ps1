# Respaldo de la base de datos de ALUNA (PowerShell, desde la raíz del repositorio):
#   .\database\scripts\respaldar.ps1
# Crea database/respaldos/aluna_AAAAMMDD_HHMM.sql (la carpeta respaldos/ no se sube a git).
$destino = Join-Path $PSScriptRoot "..\respaldos"
New-Item -ItemType Directory -Force $destino | Out-Null
$archivo = Join-Path $destino ("aluna_{0}.sql" -f (Get-Date -Format "yyyyMMdd_HHmm"))
docker compose exec -T db pg_dump -U sabia -d sabia --clean --if-exists --no-owner | Out-File -Encoding utf8 $archivo
Write-Host "Respaldo guardado en $archivo"
