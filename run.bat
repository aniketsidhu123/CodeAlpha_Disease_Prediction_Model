@echo off
setlocal EnableDelayedExpansion

title MedPredict AI - Launcher

:: Ensure execution from the repository root directory
cd /d "%~dp0"

:: Track if run.bat was invoked with a CLI argument
set "CLI_MODE=0"
if not "%~1"=="" set "CLI_MODE=1"

:: Handle direct CLI arguments
if "%CLI_MODE%"=="1" (
    if /i "%~1"=="all" goto start_all
    if /i "%~1"=="full" goto start_all
    if /i "%~1"=="1" goto start_all
    if /i "%~1"=="backend" goto start_backend
    if /i "%~1"=="api" goto start_backend
    if /i "%~1"=="2" goto start_backend
    if /i "%~1"=="frontend" goto start_frontend
    if /i "%~1"=="web" goto start_frontend
    if /i "%~1"=="3" goto start_frontend
    if /i "%~1"=="docker" goto start_docker
    if /i "%~1"=="4" goto start_docker
    if /i "%~1"=="stop" goto stop_servers
    if /i "%~1"=="5" goto stop_servers
    if /i "%~1"=="setup" goto run_setup
    if /i "%~1"=="6" goto run_setup
    if /i "%~1"=="help" goto show_help
    if /i "%~1"=="--help" goto show_help
    if /i "%~1"=="-h" goto show_help
    if /i "%~1"=="/?" goto show_help
)

:: Quick health check: Verify if setup has been executed
if not exist "backend\venv\Scripts\python.exe" goto prompt_setup
if not exist "frontend\node_modules" goto prompt_setup

:menu
cls
echo ================================================================
echo           MedPredict AI - Application Launcher
echo ================================================================
echo.
echo   [1] Start Full Application (Backend + Frontend + Browser) [Default]
echo   [2] Start Backend Only (FastAPI at http://localhost:8000)
echo   [3] Start Frontend Only (React/Vite at http://localhost:5173)
echo   [4] Start with Docker Compose (Full Stack in Containers)
echo   [5] Stop Running Dev Servers (Release Ports 8000 and 5173)
echo   [6] Run Setup / Install Dependencies (setup.bat)
echo   [7] Exit
echo.
echo ================================================================
set "CHOICE="
set /p "CHOICE=Select an option [1-7] (Press Enter for 1): "
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" goto start_all
if "%CHOICE%"=="2" goto start_backend
if "%CHOICE%"=="3" goto start_frontend
if "%CHOICE%"=="4" goto start_docker
if "%CHOICE%"=="5" goto stop_servers
if "%CHOICE%"=="6" goto run_setup
if "%CHOICE%"=="7" exit /b 0

echo.
echo [ERROR] Invalid choice: "%CHOICE%". Please select 1 through 7.
ping -n 3 127.0.0.1 >nul
goto menu

:prompt_setup
echo ================================================================
echo                Setup Required Before Running
echo ================================================================
echo It looks like the project environment is not fully configured yet:
if not exist "backend\venv\Scripts\python.exe" echo   - Missing Python virtual environment: backend\venv
if not exist "frontend\node_modules" echo   - Missing Node modules: frontend\node_modules
echo.
set "RUN_SETUP_NOW="
set /p "RUN_SETUP_NOW=Would you like to run setup.bat now? (Y/n): "
if "%RUN_SETUP_NOW%"=="" set RUN_SETUP_NOW=Y
if /i "%RUN_SETUP_NOW%"=="Y" (
    call "%~dp0setup.bat"
    goto menu
)
echo.
echo Notice: Services may fail to launch without completing setup.
echo.
pause
goto menu

:start_all
echo.
echo ================================================================
echo Starting MedPredict AI Full Stack Application...
echo ================================================================
echo.

:: 1. Launch Backend in new window
echo [1/3] Launching FastAPI Backend on http://localhost:8000...
start "MedPredict AI - Backend (Port 8000)" cmd /k "title MedPredict AI - Backend (Port 8000) && cd /d ""%~dp0backend"" && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: 2. Launch Frontend in new window
echo [2/3] Launching React / Vite Frontend on http://localhost:5173...
start "MedPredict AI - Frontend (Port 5173)" cmd /k "title MedPredict AI - Frontend (Port 5173) && cd /d ""%~dp0frontend"" && call npm run dev"

:: 3. Delay to allow initial server startup
echo [3/3] Waiting for servers to initialize...
ping -n 4 127.0.0.1 >nul

:: 4. Open default web browser
echo Opening MedPredict AI in your default web browser...
start http://localhost:5173

cls
echo ================================================================
echo               MedPredict AI is Now Running!
echo ================================================================
echo.
echo   Frontend Application:   http://localhost:5173
echo   Backend API Server:     http://localhost:8000
echo   Interactive API Docs:   http://localhost:8000/docs
echo.
echo ----------------------------------------------------------------
echo   Backend and Frontend are running in separate console windows.
echo   - Keep those windows open while using the application.
echo   - To stop the servers:
echo       1. Close their individual console windows, or
echo       2. Run: run.bat stop
echo ================================================================
echo.
if "%CLI_MODE%"=="1" exit /b 0
echo Press any key to return to the main launcher menu, or close this window.
pause >nul
goto menu

:start_backend
echo.
echo ================================================================
echo Starting MedPredict AI Backend (FastAPI)...
echo ================================================================
echo Running at: http://localhost:8000
echo API Docs:   http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server.
echo ================================================================
echo.
cd /d "%~dp0backend"
if exist "venv\Scripts\activate.bat" call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
cd /d "%~dp0"
if "%CLI_MODE%"=="1" exit /b 0
pause
goto menu

:start_frontend
echo.
echo ================================================================
echo Starting MedPredict AI Frontend (Vite)...
echo ================================================================
echo Running at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the dev server.
echo ================================================================
echo.
cd /d "%~dp0frontend"
call npm run dev
cd /d "%~dp0"
if "%CLI_MODE%"=="1" exit /b 0
pause
goto menu

:start_docker
echo.
echo ================================================================
echo Starting MedPredict AI with Docker Compose...
echo ================================================================
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker command was not found.
    echo Please make sure Docker Desktop is installed and running.
    echo.
    if "%CLI_MODE%"=="1" exit /b 1
    pause
    goto menu
)
echo Building and running containers...
echo Press Ctrl+C anytime to stop containers.
echo.
docker compose up --build
if "%CLI_MODE%"=="1" exit /b 0
pause
goto menu

:stop_servers
echo.
echo ================================================================
echo Stopping MedPredict AI Servers (Ports 8000 and 5173)...
echo ================================================================
set "STOPPED=0"
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":8000\> :5173\>"') do (
    if not "%%a"=="0" (
        echo Terminating process PID %%a...
        taskkill /f /pid %%a >nul 2>&1
        set "STOPPED=1"
    )
)
if "!STOPPED!"=="1" (
    echo [OK] Successfully stopped server processes on ports 8000 and 5173.
) else (
    echo [INFO] No processes found running on port 8000 or 5173.
)
echo.
if "%CLI_MODE%"=="1" exit /b 0
pause
goto menu

:run_setup
call "%~dp0setup.bat"
if "%CLI_MODE%"=="1" exit /b 0
goto menu

:show_help
echo ================================================================
echo                MedPredict AI Launcher Help
echo ================================================================
echo Usage: run.bat [command]
echo.
echo Commands:
echo   run.bat          - Interactive menu (Default: starts full stack)
echo   run.bat all      - Start both backend and frontend, open browser
echo   run.bat backend  - Start backend API server only (port 8000)
echo   run.bat frontend - Start frontend Vite dev server only (port 5173)
echo   run.bat docker   - Start full stack using Docker Compose
echo   run.bat stop     - Stop running dev servers on ports 8000/5173
echo   run.bat setup    - Run setup script to install dependencies
echo   run.bat help     - Display this help message
echo ================================================================
echo.
exit /b 0
