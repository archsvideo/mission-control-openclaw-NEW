param(
  [string]$Token,
  [string]$ModelPath = 'C:/Users/Oscar/Downloads/YOGA FINAL.rvt',
  [string]$Command = 'electrical_setup_now'
)

$body = @{
  modelPath = $ModelPath
  command = $Command
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8765/enqueue' -Headers @{ 'X-Bridge-Token' = $Token } -Body $body -ContentType 'application/json'
