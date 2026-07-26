@echo off
REM Sobe o backend e o frontend em duas janelas. Rode depois da instalacao
REM descrita no readme.md (venv + pip install + npm install).

set RAIZ=%~dp0

start "Nossa Timeline - backend" cmd /k "cd /d %RAIZ%backend && call venv\Scripts\activate && python manage.py runserver"
timeout /t 3 /nobreak >nul
start "Nossa Timeline - frontend" cmd /k "cd /d %RAIZ%frontend && npm run dev"
timeout /t 6 /nobreak >nul
start http://localhost:5173

echo.
echo Backend:  http://127.0.0.1:8000/api/
echo Site:     http://localhost:5173
echo.
echo Para parar, feche as duas janelas que abriram.
