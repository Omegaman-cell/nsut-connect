param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$workFolder = Join-Path $projectRoot 'work'
New-Item -ItemType Directory -Path $workFolder -Force | Out-Null
$runtimeRoot = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeExecutable = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $runtimeRoot 'node\bin\node.exe' }
if (!(Test-Path -LiteralPath $nodeExecutable)) { throw 'Install Node.js 22+ and try again.' }
$env:PATH = "$(Split-Path $nodeExecutable);$env:PATH"
$pythonExecutable = Join-Path $projectRoot 'backend\.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $pythonExecutable)) {
    $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
    $bootstrapPython = if ($pythonCommand) { $pythonCommand.Source } else { Join-Path $env:LOCALAPPDATA 'Programs\Python\Python314\python.exe' }
    if (!(Test-Path -LiteralPath $bootstrapPython)) { $bootstrapPython = Join-Path $runtimeRoot 'python\python.exe' }
    if (!(Test-Path -LiteralPath $bootstrapPython)) { throw 'Install Python 3.11+ and try again.' }
    & $bootstrapPython -m venv (Join-Path $projectRoot 'backend\.venv')
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the Python environment.' }
}
& $pythonExecutable -c 'import fastapi, uvicorn' 2>$null
if ($LASTEXITCODE -ne 0) {
    & $pythonExecutable -m pip install -r (Join-Path $projectRoot 'backend\requirements.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Backend dependency installation failed.' }
}
if (!(Test-Path -LiteralPath (Join-Path $projectRoot 'frontend\node_modules\vite\bin\vite.js'))) {
    Push-Location (Join-Path $projectRoot 'frontend')
    try {
        $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
        if ($npmCommand) { & $npmCommand.Source ci }
        else {
            $pnpmScript = Join-Path $runtimeRoot 'node\node_modules\pnpm\bin\pnpm.cjs'
            if (!(Test-Path -LiteralPath $pnpmScript)) { throw 'Install npm or pnpm to install frontend dependencies.' }
            & $nodeExecutable $pnpmScript install
        }
        if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
    } finally { Pop-Location }
}
$processIds = @()
if (Test-Path -LiteralPath (Join-Path $workFolder 'processes.json')) { $processIds = @(Get-Content -LiteralPath (Join-Path $workFolder 'processes.json') -Raw | ConvertFrom-Json) }
function Test-AppService($url, $expected) {
    try { $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2; if ($response.Content -match $expected) { return $true }; throw "Port already in use by another service: $url" }
    catch { if ($_.Exception.Message -match 'Port already') { throw }; return $false }
}
if (!(Test-AppService 'http://127.0.0.1:8000/api/health' 'NSUT Connect')) {
    $backendProcess = Start-Process -FilePath $pythonExecutable -ArgumentList '-m uvicorn main:app --host 127.0.0.1 --port 8000' -WorkingDirectory (Join-Path $projectRoot 'backend') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $workFolder 'backend.log') -RedirectStandardError (Join-Path $workFolder 'backend-error.log')
    $processIds += @{ id = $backendProcess.Id; start = $backendProcess.StartTime.ToUniversalTime().ToString('o') }
}
if (!(Test-AppService 'http://127.0.0.1:5173/' 'NSUT Connect')) {
    $frontendProcess = Start-Process -FilePath $nodeExecutable -ArgumentList 'node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort' -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $workFolder 'frontend.log') -RedirectStandardError (Join-Path $workFolder 'frontend-error.log')
    $processIds += @{ id = $frontendProcess.Id; start = $frontendProcess.StartTime.ToUniversalTime().ToString('o') }
}
ConvertTo-Json -InputObject @($processIds) | Set-Content -LiteralPath (Join-Path $workFolder 'processes.json')
$ready = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    if ((Test-AppService 'http://127.0.0.1:5173/' 'NSUT Connect') -and (Test-AppService 'http://127.0.0.1:8000/api/health' 'NSUT Connect')) { $ready = $true; break }
    Start-Sleep -Milliseconds 500
}
if (!$ready) { throw "The app did not start. Read the logs in $workFolder." }
Write-Host 'NSUT Connect is ready at http://localhost:5173/'
if (!$NoBrowser) { Start-Process 'http://localhost:5173/' }

