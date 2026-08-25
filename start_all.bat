@echo off
echo =========================================
echo    Starting Pharmacy Microservices...
echo =========================================

echo Starting Auth Service...
start "Auth Service" cmd /k "cd auth-service && .\mvnw spring-boot:run"

echo Starting Operation Service...
start "Operation Service" cmd /k "cd operation-service && .\mvnw spring-boot:run"

echo Starting Reporting Service...
start "Reporting Service" cmd /k "cd reporting-service && .\mvnw spring-boot:run"

echo Starting Gateway Service...
start "Gateway Service" cmd /k "cd gateway-service && .\mvnw spring-boot:run"

echo Starting React Client...
start "React Client" cmd /k "cd client && npm run dev"

echo =========================================
echo    All services are starting up!
echo    Each service has its own window.
echo =========================================
