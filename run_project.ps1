# PowerShell Startup Script for SETEC Final Project Microservices & Desktop Application

# 1. Setup JAVA_HOME if not defined
if (-not $env:JAVA_HOME) {
    $env:JAVA_HOME = "C:\Users\Thanutheb\.antigravity-ide\extensions\redhat.java-1.55.0-win32-x64\jre\21.0.11-win32-x86_64"
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
}

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   SETEC FINAL PROJECT - AUTOMATED STARTUP SCRIPT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1.5 Clean up ghost processes
Write-Host "[!] Cleaning up previous instances..." -ForegroundColor Yellow
Stop-Process -Name "electron", "java", "node" -Force -ErrorAction SilentlyContinue
Write-Host ""

# 2. Database Check Reminder
Write-Host "[!] Step 1: Please ensure PostgreSQL is running on your machine." -ForegroundColor Yellow
Write-Host "    (Default port: 5432, Database name: postgres)" -ForegroundColor Yellow
Write-Host ""

# 3. Start Backend Services
Write-Host "[*] Step 2: Starting Backend Microservices..." -ForegroundColor Green

Write-Host " -> Launching Auth Service..." -ForegroundColor Gray
Start-Process -FilePath "$PWD\auth-service\mvnw.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory "$PWD\auth-service" -WindowStyle Hidden

Write-Host " -> Launching Operation Service..." -ForegroundColor Gray
Start-Process -FilePath "$PWD\operation-service\mvnw.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory "$PWD\operation-service" -WindowStyle Hidden

Write-Host " -> Launching Reporting Service..." -ForegroundColor Gray
Start-Process -FilePath "$PWD\reporting-service\mvnw.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory "$PWD\reporting-service" -WindowStyle Hidden

# Wait a few seconds before starting the Gateway
Start-Sleep -Seconds 3

Write-Host " -> Launching Gateway Service..." -ForegroundColor Gray
Start-Process -FilePath "$PWD\gateway-service\mvnw.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory "$PWD\gateway-service" -WindowStyle Hidden

Write-Host ""

# 4. Start Client Web Server
Write-Host "[*] Step 3: Starting Frontend Client (Vite Dev Server)..." -ForegroundColor Cyan
Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev" -WorkingDirectory "$PWD\client" -WindowStyle Hidden

# 5. Wait & Launch Desktop UI
Write-Host ""
Write-Host "[*] Step 4: Waiting for servers to initialize..." -ForegroundColor Yellow
for ($i = 5; $i -gt 0; $i--) {
    Write-Host "    Launching Desktop App in $i seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "[*] Step 5: Launching Electron Desktop UI..." -ForegroundColor Cyan
Start-Process -FilePath "npm.cmd" -ArgumentList "run","electron" -WorkingDirectory "$PWD\client" -WindowStyle Hidden

Write-Host ""
Write-Host "All processes launched! Application UI should appear without extra terminals." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
