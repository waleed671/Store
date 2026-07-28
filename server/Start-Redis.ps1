# Start-Redis.ps1
# Starts the Redis server in the background for the CHRONEX project
# Run this before starting the backend: .\Start-Redis.ps1 or npm run redis:start

$redisExe  = "C:\Users\IT ZONE\.gemini\antigravity-ide\scratch\redis\redis-server.exe"
$redisConf = "C:\Users\IT ZONE\.gemini\antigravity-ide\scratch\redis\redis.windows.conf"

# Check if already running
$running = Get-Process redis-server -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "✅ Redis is already running (PID: $($running.Id))"
    exit 0
}

# Start Redis with configuration
Write-Host "🔴 Starting Redis server on port 6379..."
Start-Process -FilePath $redisExe -ArgumentList "`"$redisConf`"" -WindowStyle Hidden

Start-Sleep -Seconds 2

# Verify it started
$cli = "C:\Users\IT ZONE\.gemini\antigravity-ide\scratch\redis\redis-cli.exe"
$pong = & $cli ping 2>&1
if ($pong -eq "PONG") {
    Write-Host "✅ Redis server started successfully on port 6379"
    Write-Host "   CLI client: $cli"
} else {
    Write-Host "❌ Redis failed to start. Output: $pong"
}
