# Revit Autonomy — 3 Fases (Implementación)

## Estado actual
- ✅ Fase 1 base creada (job system + runner + scripts pyRevit)
- 🟡 Fase 2 parcial (hooks + ejecución en documento abierto)
- ⏳ Fase 3 pendiente (puente robusto API + ejecución end-to-end sin clicks)

---

## Fase 1 — Job System (COMPLETADA)
Objetivo: procesar trabajos por JSON.

### Hecho
- `jobs/inbox|processing|done|failed`
- `output/report-*.json`
- `runner.ps1`
- jobs de ejemplo

### Resultado
- pipeline funcional por archivos

---

## Fase 2 — Ejecución en sesión activa de Revit (EN CURSO)
Objetivo: ejecutar tareas sobre el documento abierto sin depender de `pyrevit run <model>`.

### Hecho
- `ARCHS.extension/hooks/doc-opened.py`
- `ARCHS.extension/hooks/startup.py`
- botón puente `Run Pending Jobs`

### Siguiente ajuste
- robustecer trigger para que procese `inbox` siempre al abrir y al recargar
- fallback de muro interior -> todos los muros (ya aplicado)

---

## Fase 3 — 100% autónomo (A IMPLEMENTAR)
Objetivo: sin clicks de usuario.

### Arquitectura
1. Add-in C# (Revit API) con ExternalEvent + command queue local
2. Servicio local `revit-bridge` (HTTP localhost o file queue)
3. Ejecutor de comandos permitidos (allowlist)
4. Reporte y rollback por tarea

### Comandos iniciales
- `create_electrical_views`
- `place_outlets_every_2m`
- `export_pdf_sheets`

### Seguridad
- allowlist de comandos
- dry-run opcional
- log completo por elemento afectado

---

## Cómo usar hoy (operativo)
1. Deja job JSON en `revit-autonomy/jobs/inbox`
2. En Revit: botón `Run Pending Jobs`
3. Revisa `jobs/done` y `output/hook-report-*.json`
