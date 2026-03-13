# Revit Bridge (ARCH-S)

Bridge local para ejecutar comandos de Revit de forma autónoma desde OpenClaw.

## Qué hace
- Expone API local `http://127.0.0.1:8765`
- Recibe comandos permitidos (`allowlist`)
- Los transforma a jobs JSON en `revit-autonomy/jobs/inbox`
- El hook de `ARCHS.extension` los ejecuta dentro de sesión Revit

## Endpoints
- `GET /health` -> estado del bridge
- `POST /enqueue` -> encola job permitido

## Seguridad
- Solo localhost
- Token obligatorio por header `X-Bridge-Token`
- Allowlist por comando

## Comandos permitidos (v1)
- `create_electrical_views`
- `place_outlets_internal_2m`
- `electrical_setup_now` (macro: ambas tareas)

## Arranque
```powershell
powershell -ExecutionPolicy Bypass -File .\revit-bridge\server.ps1 -Token "CAMBIAR_TOKEN"
```

## Ejemplo rápido
```powershell
$body = @{
  modelPath = "C:/Users/Oscar/Downloads/YOGA FINAL.rvt"
  command = "electrical_setup_now"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8765/enqueue" -Headers @{"X-Bridge-Token"="CAMBIAR_TOKEN"} -Body $body -ContentType "application/json"
```

## Nota operativa
Para ejecución totalmente sin clics, Revit debe estar abierto con modelo cargado (el hook procesa `inbox`).
En siguiente fase se conecta ExternalEvent C# para disparo en caliente sin depender de hook.
