$ErrorActionPreference = 'SilentlyContinue'
$ws = 'C:\Users\Oscar\.openclaw\workspace'

# Start daemon if not running
$daemon = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*python*kraken_paper_daemon.py*' }
if (-not $daemon) {
  Start-Process -FilePath python -ArgumentList 'scripts\kraken_paper_daemon.py' -WorkingDirectory $ws -WindowStyle Hidden
}

# Start dashboard server if not running on 8787
$listening = netstat -ano | Select-String ':8787' | Select-String 'LISTENING'
if (-not $listening) {
  Start-Process -FilePath powershell -ArgumentList '-ExecutionPolicy Bypass -File scripts\serve_paper_dashboard.ps1' -WorkingDirectory $ws -WindowStyle Hidden
}

# Build dashboard once
Start-Process -FilePath python -ArgumentList 'scripts\build_paper_dashboard.py' -WorkingDirectory $ws -WindowStyle Hidden
