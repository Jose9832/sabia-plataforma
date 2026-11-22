# Restaura un respaldo creado con respaldar.ps1 (BORRA los datos actuales):
#   .\database\scripts\restaurar.ps1 -Archivo .\database\respaldos\aluna_20261122_1030.sql
param([Parameter(Mandatory = $true)][string]$Archivo)
if (-not (Test-Path $Archivo)) { throw "No existe $Archivo" }
Get-Content -Raw -Encoding utf8 $Archivo | docker compose exec -T db psql -U sabia -d sabia -q
Write-Host "Base de datos restaurada desde $Archivo"
