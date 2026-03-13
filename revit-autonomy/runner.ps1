param(
  [switch]$Loop,
  [int]$IntervalSeconds = 20
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Jobs = Join-Path $Root 'jobs'
$Inbox = Join-Path $Jobs 'inbox'
$Processing = Join-Path $Jobs 'processing'
$Done = Join-Path $Jobs 'done'
$Failed = Join-Path $Jobs 'failed'
$Output = Join-Path $Root 'output'
$Scripts = Join-Path $Root 'scripts'

@($Inbox,$Processing,$Done,$Failed,$Output,$Scripts) | ForEach-Object { New-Item -ItemType Directory -Force -Path $_ | Out-Null }

function Invoke-Task($model,$task){
  $name = $task.name
  $jobRevit = $task.revit
  if(-not $jobRevit){ $jobRevit = 2026 }

  if($name -eq 'create_electrical_views'){
    $script = Join-Path $Scripts 'create_electrical_views.py'
    $cmd = "pyrevit run `"$script`" `"$model`" --revit=$jobRevit --allowdialogs"
    $out = (Invoke-Expression $cmd 2>&1 | Out-String)
    $ok = ($LASTEXITCODE -eq 0)
    return @{ ok=$ok; cmd=$cmd; out=$out }
  }
  elseif($name -eq 'place_outlets_internal_2m'){
    $script = Join-Path $Scripts 'place_outlets_internal_2m.py'
    $cmd = "pyrevit run `"$script`" `"$model`" --revit=$jobRevit --allowdialogs"
    $out = (Invoke-Expression $cmd 2>&1 | Out-String)
    $ok = ($LASTEXITCODE -eq 0)
    return @{ ok=$ok; cmd=$cmd; out=$out }
  }
  else {
    return @{ ok=$false; cmd=''; out="Unknown task: $name" }
  }
}

function Process-One($jobPath){
  $base = [IO.Path]::GetFileName($jobPath)
  $procPath = Join-Path $Processing $base
  Move-Item $jobPath $procPath -Force

  $report = [ordered]@{ job=$base; started=(Get-Date).ToString('s'); ok=$true; tasks=@() }
  try {
    $job = Get-Content $procPath -Raw | ConvertFrom-Json
    $model = $job.modelPath
    if(!(Test-Path $model)){ throw "Model not found: $model" }

    foreach($t in $job.tasks){
      if(-not $t.revit -and $job.revit){ $t | Add-Member -NotePropertyName revit -NotePropertyValue $job.revit -Force }
      $r = Invoke-Task -model $model -task $t
      $report.tasks += [ordered]@{ name=$t.name; ok=$r.ok; output=$r.out; command=$r.cmd }
      if(-not $r.ok){ $report.ok = $false; break }
    }
  }
  catch {
    $report.ok = $false
    $report.error = $_.Exception.Message
  }
  $report.finished = (Get-Date).ToString('s')

  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $repFile = Join-Path $Output ("report-$stamp-$base.json")
  $report | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 $repFile

  if($report.ok){ Move-Item $procPath (Join-Path $Done $base) -Force }
  else { Move-Item $procPath (Join-Path $Failed $base) -Force }
}

while($true){
  $jobs = Get-ChildItem $Inbox -Filter *.json -File | Sort-Object LastWriteTime
  foreach($j in $jobs){ Process-One $j.FullName }
  if(-not $Loop){ break }
  Start-Sleep -Seconds $IntervalSeconds
}
