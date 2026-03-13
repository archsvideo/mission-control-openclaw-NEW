param(
  [string]$HostName = '127.0.0.1',
  [int]$Port = 8765,
  [Parameter(Mandatory=$true)][string]$Token
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Workspace = Split-Path -Parent $Root
$Inbox = Join-Path $Workspace 'revit-autonomy\jobs\inbox'
$AllowlistPath = Join-Path $Root 'allowlist.json'

New-Item -ItemType Directory -Force -Path $Inbox | Out-Null

function Read-Allowlist {
  if(!(Test-Path $AllowlistPath)){ throw "allowlist.json missing: $AllowlistPath" }
  $obj = Get-Content $AllowlistPath -Raw | ConvertFrom-Json
  return @($obj.commands)
}

function New-JobFromRequest($reqObj){
  $command = [string]$reqObj.command
  $modelPath = [string]$reqObj.modelPath
  $useActiveDocument = [bool]$reqObj.useActiveDocument
  if([string]::IsNullOrWhiteSpace($command)){ throw 'command is required' }

  switch($command){
    'create_electrical_views' {
      $tasks = @(@{ name = 'create_electrical_views' })
    }
    'place_outlets_internal_2m' {
      $tasks = @(@{ name = 'place_outlets_internal_2m' })
    }
    'electrical_setup_now' {
      if([string]::IsNullOrWhiteSpace($modelPath) -and -not $useActiveDocument){ throw 'modelPath is required unless useActiveDocument=true' }
      $tasks = @(
        @{ name = 'create_electrical_views' },
        @{ name = 'place_outlets_internal_2m' }
      )
    }
    'electrical_setup_active' {
      $useActiveDocument = $true
      $tasks = @(
        @{ name = 'create_electrical_views' },
        @{ name = 'place_outlets_internal_2m' }
      )
    }
    default { throw "unsupported command: $command" }
  }

  $job = [ordered]@{
    jobName = "bridge-$command"
    revit = 2026
    tasks = $tasks
  }
  if(-not $useActiveDocument){
    if([string]::IsNullOrWhiteSpace($modelPath)){ throw 'modelPath is required unless useActiveDocument=true' }
    $job.modelPath = $modelPath
  }
  return $job
}

function Write-JsonResponse($ctx, $statusCode, $obj){
  $ctx.Response.StatusCode = $statusCode
  $ctx.Response.ContentType = 'application/json'
  $bytes = [System.Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 10))
  $ctx.Response.OutputStream.Write($bytes,0,$bytes.Length)
  $ctx.Response.OutputStream.Close()
}

$listener = [System.Net.HttpListener]::new()
$prefix = "http://$HostName`:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Revit Bridge listening on $prefix"

$allow = Read-Allowlist

while($listener.IsListening){
  $ctx = $listener.GetContext()
  try {
    $path = $ctx.Request.Url.AbsolutePath.TrimEnd('/')
    $method = $ctx.Request.HttpMethod

    if($path -eq '/health' -and $method -eq 'GET'){
      Write-JsonResponse $ctx 200 @{ ok = $true; service = 'revit-bridge'; inbox = $Inbox }
      continue
    }

    $incomingToken = $ctx.Request.Headers['X-Bridge-Token']
    if($incomingToken -ne $Token){
      Write-JsonResponse $ctx 401 @{ ok = $false; error = 'unauthorized' }
      continue
    }

    if($path -eq '/enqueue' -and $method -eq 'POST'){
      $reader = New-Object IO.StreamReader($ctx.Request.InputStream, $ctx.Request.ContentEncoding)
      $raw = $reader.ReadToEnd()
      $reader.Close()
      $reqObj = $raw | ConvertFrom-Json

      if(@($allow) -notcontains [string]$reqObj.command){
        Write-JsonResponse $ctx 400 @{ ok = $false; error = 'command_not_allowed'; allowed = $allow }
        continue
      }

      $job = New-JobFromRequest $reqObj
      $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
      $file = Join-Path $Inbox ("bridge-$stamp-" + [Guid]::NewGuid().ToString('N').Substring(0,8) + '.json')
      ($job | ConvertTo-Json -Depth 10) | Set-Content -Encoding UTF8 $file

      Write-JsonResponse $ctx 200 @{ ok = $true; queued = $file; command = $reqObj.command }
      continue
    }

    Write-JsonResponse $ctx 404 @{ ok = $false; error = 'not_found' }
  }
  catch {
    Write-JsonResponse $ctx 500 @{ ok = $false; error = $_.Exception.Message }
  }
}
