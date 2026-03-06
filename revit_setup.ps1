$pyrevit = "$env:APPDATA\pyRevit-Master\bin\pyrevit.exe"

if (-not (Test-Path $pyrevit)) {
  Write-Error "pyRevit no encontrado en $pyrevit"
  exit 1
}

Write-Host "== pyRevit version =="
& $pyrevit --version

Write-Host "\n== Revit installations detectadas =="
& $pyrevit revits

Write-Host "\n== Adjuntando pyRevit a todas las versiones detectadas =="
& $pyrevit attach master default --installed

Write-Host "\n== Estado final =="
& $pyrevit attached

Write-Host "\nListo. Abre Revit y verifica la pestaña pyRevit."
