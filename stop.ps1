$record = Join-Path $PSScriptRoot 'work\processes.json'
if (Test-Path -LiteralPath $record) {
    foreach ($entry in @(Get-Content -LiteralPath $record -Raw | ConvertFrom-Json)) {
        $process = Get-Process -Id $entry.id -ErrorAction SilentlyContinue
        if ($process -and $process.StartTime.ToUniversalTime().ToString('o') -eq $entry.start) { Stop-Process -Id $entry.id }
    }
    Remove-Item -LiteralPath $record
    Write-Host 'Stopped processes launched by NSUT Connect.'
} else { Write-Host 'No launcher-owned processes to stop.' }
