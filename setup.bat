@echo off
setlocal EnableDelayedExpansion

title MedPredict AI - Setup

:: Ensure execution from the repository root directory
cd /d "%~dp0"

echo ================================================================
echo           MedPredict AI - Environment Setup Script
echo ================================================================
echo Working Directory: %~dp0
echo.

:: ------------------------------------------------------------------
:: 1. Check Python
:: ------------------------------------------------------------------
echo [Step 1/4] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 goto err_python

for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo [OK] Found %%v
echo.

:: ------------------------------------------------------------------
:: 2. Check Node.js and npm
:: ------------------------------------------------------------------
echo [Step 2/4] Checking Node.js and npm installation...
call npm --version >nul 2>&1
if errorlevel 1 goto err_npm

for /f "tokens=*" %%v in ('node --version 2^>^&1') do set "NODE_VERSION=%%v"
for /f "tokens=*" %%v in ('call npm --version 2^>^&1') do set "NPM_VERSION=%%v"
echo [OK] Found Node.js !NODE_VERSION! and npm !NPM_VERSION!
echo.

:: ------------------------------------------------------------------
:: 3. Setup Backend (Virtual Environment + Dependencies + ML Models)
:: ------------------------------------------------------------------
echo [Step 3/4] Setting up Backend environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo Creating Python virtual environment in backend\venv...
    python -m venv backend\venv
    if errorlevel 1 goto err_venv
    echo [OK] Virtual environment created.
) else (
    echo [OK] Virtual environment already exists in backend\venv.
)

echo Installing and verifying dependencies from backend\requirements.txt...
call backend\venv\Scripts\python.exe -m pip install --upgrade pip >nul 2>&1
call backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 goto err_pip
echo [OK] Python dependencies installed successfully.

:: Check for trained ML models
set "RETRAIN=0"
if /i "%~1"=="--retrain" set "RETRAIN=1"
if /i "%~1"=="--train" set "RETRAIN=1"
if /i "%~1"=="-r" set "RETRAIN=1"

if not exist "backend\models\heart_disease_rf.pkl" set "RETRAIN=1"
if not exist "backend\models\diabetes_lr.pkl" set "RETRAIN=1"
if not exist "backend\models\breast_cancer_nn.keras" set "RETRAIN=1"

if "!RETRAIN!"=="1" (
    echo.
    echo Training machine learning models: Heart Disease, Diabetes, Breast Cancer...
    echo Fetching datasets and training models. This may take 1-2 minutes...
    cd /d "%~dp0backend"
    call venv\Scripts\python.exe train_models.py
    if errorlevel 1 (
        cd /d "%~dp0"
        goto err_train
    )
    cd /d "%~dp0"
    echo [OK] All ML models trained and saved to backend\models
) else (
    echo [OK] ML model artifacts found in backend\models
    echo      Tip: Run "setup.bat --retrain" anytime to retrain models with fresh data.
)
echo.

:: ------------------------------------------------------------------
:: 4. Setup Frontend (Node Packages)
:: ------------------------------------------------------------------
echo [Step 4/4] Setting up Frontend dependencies...
cd /d "%~dp0frontend"
echo Installing frontend packages via npm install...
call npm install
if errorlevel 1 (
    cd /d "%~dp0"
    goto err_npm_install
)
cd /d "%~dp0"
echo [OK] Frontend dependencies installed successfully.
echo.

:: ------------------------------------------------------------------
:: Finished
:: ------------------------------------------------------------------
:setup_success
echo ================================================================
echo                Setup Completed Successfully!
echo ================================================================
echo You are ready to run MedPredict AI.
echo.
echo To launch the application:
echo   - Run the launcher: run.bat
echo   - Or with Docker:   docker compose up --build
echo ================================================================
echo.
pause
exit /b 0

:: ------------------------------------------------------------------
:: Error Handlers
:: ------------------------------------------------------------------
:err_python
echo [ERROR] Python was not found in your system PATH.
echo Please install Python 3.10 to 3.13 from:
echo   https://www.python.org/downloads/
echo.
echo IMPORTANT: Make sure to check the box:
echo   "Add python.exe to PATH" during installation.
echo.
pause
exit /b 1

:err_npm
echo [ERROR] Node.js or npm was not found in your system PATH.
echo Please install Node.js LTS from:
echo   https://nodejs.org/
echo.
pause
exit /b 1

:err_venv
echo [ERROR] Failed to create virtual environment in backend\venv.
echo Please verify your Python installation.
echo.
pause
exit /b 1

:err_pip
echo [ERROR] Failed to install backend dependencies from requirements.txt.
echo Check the error messages above for details.
echo.
pause
exit /b 1

:err_train
echo [ERROR] Model training encountered an error!
echo Check your network connection (for dataset downloads) and error details above.
echo.
pause
exit /b 1

:err_npm_install
echo [ERROR] Failed to install frontend dependencies!
echo Check the npm error log above for details.
echo.
pause
exit /b 1
