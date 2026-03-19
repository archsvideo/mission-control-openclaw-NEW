$ErrorActionPreference = 'SilentlyContinue'
$log = 'C:\Users\Oscar\.openclaw\workspace\reports\gateway-watchdog.log'
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

function LogLine([string]$msg){
  "$ts $msg" | Out-File -FilePath $log -Append -Encoding utf8
}

# Fast port probe
$portOpen = $false
try {
  $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port 18789 -WarningAction SilentlyContinue
  $portOpen = [bool]$conn.TcpTestSucceeded
} catch {}

if (-not $portOpen) {
  LogLine '[WARN] Gateway port 18789 closed. Restarting gateway...'
  & openclaw gateway restart | Out-Null
  Start-Sleep -Seconds 4

  # Re-check
  try {
    $conn2 = Test-NetConnection -ComputerName 127.0.0.1 -Port 18789 -WarningAction SilentlyContinue
    if ($conn2.TcpTestSucceeded) {
      LogLine '[OK] Gateway recovered after restart.'
    } else {
      LogLine '[ERR] Gateway still down after restart.'
    }
  } catch {
    LogLine '[ERR] Gateway re-check failed.'
  }
} else {
  LogLine '[OK] Gateway healthy.'
}
