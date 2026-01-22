@echo off
echo ========================================
echo   AI Manufacturing Control Center
echo ========================================
echo.

cd /d D:\n8n\ai-control-center

echo Installing server dependencies...
cd server
call npm install
cd ..

echo Installing client dependencies...
cd client
call npm install
cd ..

echo.
echo Starting servers...
echo.

start "AI Control Center - Server" cmd /k "cd server && node server.js"
timeout /t 3 /nobreak > nul
start "AI Control Center - Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Servers starting...
echo
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul
start http://localhost:3000
