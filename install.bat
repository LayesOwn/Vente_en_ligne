@echo off
echo ========================================
echo     DASHA SHOP - Installation
echo ========================================
echo.

REM Vérifier Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

REM Vérifier Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

echo [1/4] Création de l'environnement virtuel Python...
cd backend
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installation des dépendances Python...
pip install -r requirements.txt

echo [3/4] Initialisation de la base de données et données de test...
python seed.py
call venv\Scripts\deactivate
cd ..

echo [4/4] Installation des dépendances Node.js...
cd frontend
npm install
cd ..

echo.
echo ========================================
echo     Installation terminée avec succès !
echo ========================================
echo.
echo Pour démarrer l'application: double-cliquez sur start.bat
echo.
pause
