$ErrorActionPreference = 'SilentlyContinue'
$log = 'C:\Users\Oscar\.openclaw\workspace\reports\gateway-watchdog.log'
$statePath = 'C:\Users\Oscar\.openclaw\workspace\reports\gateway-watchdog-state.json'
$ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$maxConsecutiveFailures = 3

function LogLine([string]$msg){
  "$ts $msg" | Out-File -FilePath $log -Append -Encoding utf8
}

function Test-TcpPort([string]$host, [int]$port, [int]$timeoutMs = 1500) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($host, $port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne($timeoutMs, $false)
    if (-not $ok) { $client.Close(); return $false }
    $client.EndConnect($iar)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

# Load state
$state = @{ consecutiveFailures = 0 }
if (Test-Path $statePath) {
  try {
    $raw = Get-Content $statePath -Raw
    if ($raw) {
      $obj = $raw | ConvertFrom-Json
      if ($obj.consecutiveFailures -ne $null) { $state.consecutiveFailures = [int]$obj.consecutiveFailures }
    }
  } catch {}
}

$portOpen = Test-TcpPort -host '127.0.0.1' -port 18789 -timeoutMs 1500

if ($portOpen) {
  if ($state.consecutiveFailures -gt 0) {
    LogLine "[OK] Gateway healthy again. Resetting failure counter from $($state.consecutiveFailures)."
  } else {
    LogLine '[OK] Gateway healthy.'
  }
  $state.consecutiveFailures = 0
} else {
  $state.consecutiveFailures += 1
  LogLine "[WARN] Gateway probe failed ($($state.consecutiveFailures)/$maxConsecutiveFailures)."

  if ($state.consecutiveFailures -ge $maxConsecutiveFailures) {
    LogLine '[WARN] Consecutive failures threshold reached. Restarting gateway...'
    & openclaw gateway restart | Out-Null
    Start-Sleep -Seconds 4

    $recheck = Test-TcpPort -host '127.0.0.1' -port 18789 -timeoutMs 2500
    if ($recheck) {
      LogLine '[OK] Gateway recovered after restart.'
      $state.consecutiveFailures = 0
    } else {
      LogLine '[ERR] Gateway still down after restart.'
    }
  }
}

# Persist state
try {
  $state | ConvertTo-Json | Out-File -FilePath $statePath -Encoding utf8 -Force
} catch {}
