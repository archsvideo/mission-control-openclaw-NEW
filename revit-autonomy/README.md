# Revit Autonomy (ARCH-S)

Flujo hands-off en 3 fases:

## Fase 1 — Job System
- Deja un `*.json` en `revit-autonomy/jobs/inbox/`
- Runner lo procesa y mueve a `done/` o `failed/`
- Logs en `revit-autonomy/output/`

## Fase 2 — Auto-open + execute
- El runner usa `pyrevit run <script> <model.rvt> --revit=2026`
- Revit/modelo se abre y ejecuta comando sin clicks manuales (job-based)

## Fase 3 — Pipeline completo
- Soporta cadena de tareas en un job (`tasks: [...]`)
- Reporte final JSON con estado por tarea

## Estructura
- `jobs/inbox` -> entrada
- `jobs/processing` -> en ejecución
- `jobs/done` -> completados
- `jobs/failed` -> fallidos
- `output` -> logs/reportes
- `scripts` -> scripts pyRevit ejecutables

## Iniciar runner continuo
```powershell
powershell -ExecutionPolicy Bypass -File .\revit-autonomy\runner.ps1 -Loop
```

## Job ejemplo
Ver: `revit-autonomy/jobs/examples/electrical_setup_job.json`
