$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Oscar\.openclaw\workspace\reports'
$port = 8787
Write-Host "Serving $root on http://localhost:$port"
python -m http.server $port --directory $root
