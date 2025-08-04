# Start PHP Backend Server on localhost:5000
Write-Host "🚀 Starting PHP Backend Server on localhost:5000..." -ForegroundColor Green
Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🔧 PHP version: $(php --version | Select-Object -First 1)" -ForegroundColor Cyan
Write-Host ""

# Kill any existing PHP server on port 5000
Write-Host "🔄 Checking for existing servers on port 5000..." -ForegroundColor Yellow
try {
    Get-Process -Name "php" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "   Stopped existing PHP processes" -ForegroundColor Yellow
} catch {
    Write-Host "   No existing PHP processes found" -ForegroundColor Gray
}

# Start the PHP built-in server with custom php.ini
Write-Host "▶️  Starting PHP server with mysql extensions..." -ForegroundColor Green
Write-Host "   Using configuration: php.ini" -ForegroundColor Gray
Write-Host "   Server endpoint: index.php" -ForegroundColor Gray
Write-Host ""

php -c php.ini -S localhost:5000 index.php
