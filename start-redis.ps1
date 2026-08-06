$redisDir = "C:\Users\IT ZONE\AppData\Local\Microsoft\WinGet\Packages\taizod1024.redis-windows-fork_Microsoft.Winget.Source_8wekyb3d8bbwe\Redis-8.8.0-Windows-x64-msys2"
$redisExe = "$redisDir\redis-server.exe"
$redisCli = "$redisDir\redis-cli.exe"

if (-not (Test-Path $redisExe)) {
    Write-Host "[ERROR] redis-server.exe not found at: $redisExe" -ForegroundColor Red
    exit 1
}

# Check if already running
$ping = & $redisCli ping 2>&1
if ($ping -eq "PONG") {
    Write-Host "[OK] Redis is already running on port 6379" -ForegroundColor Green
    exit 0
}

Write-Host "[INFO] Starting Redis on port 6379..." -ForegroundColor Yellow

# WorkingDirectory is required so msys2 DLLs are resolved correctly
Start-Process -FilePath $redisExe -WorkingDirectory $redisDir -WindowStyle Minimized

Start-Sleep -Seconds 4

$check = & $redisCli ping 2>&1
if ($check -eq "PONG") {
    Write-Host "[OK] Redis started successfully on port 6379" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Redis failed to start. Output: $check" -ForegroundColor Red
    exit 1
}
