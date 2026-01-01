# PowerShell script to start the Scope-Creep server with sensible defaults on Windows
# Usage: Right-click -> Run with PowerShell, or from project root:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\app\Scope-Creep\start-server.ps1

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$Port = $env:PORT
)

if (-not $DatabaseUrl) {
    Write-Host "No DATABASE_URL provided. Starting a temporary local Postgres via Docker is recommended." -ForegroundColor Yellow
    Write-Host "You can start postgres with Docker (example):" -ForegroundColor Gray
    Write-Host "  docker run -e POSTGRES_PASSWORD=pass -e POSTGRES_USER=user -e POSTGRES_DB=db -p 5432:5432 -d postgres:15" -ForegroundColor Cyan
    Write-Host "If you already have a Postgres instance, set DATABASE_URL like:`n`$env:DATABASE_URL = \"postgresql://user:pass@127.0.0.1:5432/db\"`n" -ForegroundColor Gray
    $DatabaseUrl = Read-Host "Enter DATABASE_URL (or leave empty to continue with SKIP_DB_INIT)"
}

if ($DatabaseUrl) {
    $env:DATABASE_URL = $DatabaseUrl
} else {
    Write-Host "No DATABASE_URL set. Setting SKIP_DB_INIT=true (server will run without DB initialization)." -ForegroundColor Yellow
    $env:SKIP_DB_INIT = "true"
}

if (-not $Port) { $env:PORT = "3001" } else { $env:PORT = $Port }

Write-Host "Starting Scope-Creep server on http://127.0.0.1:$($env:PORT)" -ForegroundColor Green
Write-Host "DATABASE_URL: $($env:DATABASE_URL)" -ForegroundColor DarkGray

# Start the server (node must be in PATH)
node .\app\Scope-Creep\server.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Server exited with code $LASTEXITCODE" -ForegroundColor Red
}
