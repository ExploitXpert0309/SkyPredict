$ports = @(5000, 5173, 5174)
$connections = Get-NetTCPConnection -LocalPort $ports -State Listen -ErrorAction SilentlyContinue

if (-not $connections) {
  Write-Host "Ports 5000, 5173, and 5174 are already free."
  exit 0
}

$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $processIds) {
  $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($process) {
    Write-Host "Stopping $($process.ProcessName) on PID $processId"
    Stop-Process -Id $processId -Force
  }
}

Write-Host "Development ports are free."

