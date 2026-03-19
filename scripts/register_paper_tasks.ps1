$ErrorActionPreference = 'Stop'
$taskName = 'OpenClaw-PaperStack-Watchdog'
$ws = 'C:\Users\Oscar\.openclaw\workspace'
$cmd = "powershell -ExecutionPolicy Bypass -File `"$ws\scripts\start_paper_stack.ps1`""

# Recreate task
schtasks /Delete /TN $taskName /F | Out-Null

# Every 5 minutes forever, only when user is logged on
schtasks /Create /TN $taskName /SC MINUTE /MO 5 /TR $cmd /RL LIMITED /F | Out-Null

Write-Host "TASK_OK:$taskName"
