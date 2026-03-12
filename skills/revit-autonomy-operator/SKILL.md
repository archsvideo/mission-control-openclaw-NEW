---
name: revit-autonomy-operator
description: Ejecuta flujos Revit autónomos basados en jobs JSON (sin conversación larga), incluyendo creación de vistas eléctricas y colocación de tomacorrientes con reportes en done/failed/output. Usar cuando Oscar diga "hazlo tú", "ejecuta la tarea", "sin botones" o pida procesamiento hands-off de un .rvt en su PC.
---

# Revit Autonomy Operator

## Objetivo
Procesar jobs en `revit-autonomy/jobs/inbox` y dejar reporte en `output/`.

## Ruta base
`C:\Users\Oscar\.openclaw\workspace\revit-autonomy`

## Flujo
1. Validar que exista job en `jobs/inbox`.
2. Verificar `modelPath` y que Revit esté abierto o abrirlo.
3. Ejecutar pipeline (hook/job runner o botón puente según estado).
4. Verificar movimiento del job a `done/` o `failed/`.
5. Responder con resultado concreto (vistas creadas / tomacorrientes colocados / error exacto).

## Comandos mínimos
- Runner one-shot:
  - `powershell -ExecutionPolicy Bypass -File .\revit-autonomy\runner.ps1`
- Runner continuo:
  - `powershell -ExecutionPolicy Bypass -File .\revit-autonomy\runner.ps1 -Loop`

## Diagnóstico rápido
- Si job no se mueve de `inbox`: revisar hooks/extensiones pyRevit cargadas.
- Si falla `pyrevit run` por versión del modelo: ejecutar en sesión activa vía hook/botón puente.
- Si no hay outlet family: cargar `workspace\families\Wall-Receptacle.rfa`.

## Regla de salida
Siempre devolver:
- estado final (`done`/`failed`)
- archivo de reporte usado
- próximo paso concreto si falló
