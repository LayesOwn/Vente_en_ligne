@echo off
echo ========================================
echo     DASHA SHOP - Demarrage local
echo ========================================
echo.

REM Ajouter Node.js au PATH si absent
SET PATH=C:\Program Files\nodejs\;%PATH%

REM Recuperer le dossier du script
SET PROJECT_DIR=%~dp0

REM Demarrer le backend (avec activation du virtualenv)
echo [1/2] Demarrage du backend FastAPI...
start cmd /k "cd /d "%PROJECT_DIR%backend" && call venv\Scripts\activate && python -m uvicorn app.main:app --reload --port 8000"

REM Attendre 3 secondes
timeout /t 3 /nobreak > nul

REM Demarrer le frontend
echo [2/2] Demarrage du frontend React...
start cmd /k "SET PATH=C:\Program Files\nodejs\;%PATH% && cd /d "%PROJECT_DIR%frontend" && npm run dev"

echo.
echo  Backend  : http://localhost:8000
echo  Frontend : http://localhost:5173
echo  API Docs : http://localhost:8000/api/docs
echo  Admin    : http://localhost:5173/admin
echo.
echo Ouvrez votre navigateur sur http://localhost:5173
echo.
pause
