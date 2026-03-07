@echo off
openclaw gateway status >nul 2>&1
if errorlevel 1 (
  openclaw gateway start >nul 2>&1
)
