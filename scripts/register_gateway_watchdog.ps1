$ErrorActionPreference = 'Stop'
$taskName = 'OpenClaw-Gateway-Watchdog'
$ws = 'C:\Users\Oscar\.openclaw\workspace'
$cmd = "powershell -ExecutionPolicy Bypass -File `"$ws\scripts\gateway_watchdog.ps1`""

# Recreate task
schtasks /Delete /TN $taskName /F | Out-Null
schtasks /Create /TN $taskName /SC MINUTE /MO 2 /TR $cmd /RL LIMITED /F | Out-Null

Write-Host "TASK_OK:$taskName"
