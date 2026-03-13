@echo off
setlocal
set TOKEN_FILE=%~dp0TOKEN.txt
if not exist "%TOKEN_FILE%" (
  echo TOKEN.txt no encontrado en %~dp0
  exit /b 1
)
set /p BRIDGE_TOKEN=<"%TOKEN_FILE%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Token "%BRIDGE_TOKEN%"
