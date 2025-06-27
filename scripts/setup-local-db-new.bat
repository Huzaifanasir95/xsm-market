@echo off
setlocal enabledelayedexpansion

echo Setting up local MariaDB/MySQL database for XSM Market...
echo.

echo Please enter the path to your MariaDB bin directory (e.g., C:\Program Files\MariaDB 10.5\bin):
set /p CUSTOM_PATH=Path: 

if exist "!CUSTOM_PATH!\mysql.exe" (
    set PATH=!CUSTOM_PATH!;!PATH!
    echo Added !CUSTOM_PATH! to PATH for this session.
) else (
    echo Could not find mysql.exe in the provided path.
    pause
    exit /b 1
)

mysql --version
if errorlevel 1 (
    echo Still can't execute mysql command. Please check your installation.
    pause
    exit /b 1
)

REM Get the script directory and project root
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set BACKEND_DIR=%PROJECT_ROOT%\backend

REM Database configuration
set DB_NAME=xsm_market_local
set DB_USER=root
set DB_HOST=localhost

echo Database Configuration:
echo   Host: %DB_HOST%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.

echo Please enter your MySQL/MariaDB root password (press Enter if no password):
set /p DB_PASSWORD=Password: 

REM Test connection
echo Testing database connection...
if "!DB_PASSWORD!"=="" (
    mysql -h %DB_HOST% -u %DB_USER% -e "SELECT 1;" >nul 2>&1
) else (
    mysql -h %DB_HOST% -u %DB_USER% -p!DB_PASSWORD! -e "SELECT 1;" >nul 2>&1
)

if errorlevel 1 (
    echo Failed to connect to database. Please check your credentials.
    pause
    exit /b 1
) else (
    echo Successfully connected to database!
)

REM Create database
echo Creating database '%DB_NAME%'...
if "!DB_PASSWORD!"=="" (
    mysql -h %DB_HOST% -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
) else (
    mysql -h %DB_HOST% -u %DB_USER% -p!DB_PASSWORD! -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
)

if errorlevel 1 (
    echo Failed to create database
    pause
    exit /b 1
)

echo Database '%DB_NAME%' created successfully!

REM Update backend .env file
echo Updating backend .env file...
set ENV_FILE=%BACKEND_DIR%\.env

REM Create/update .env file with proper database credentials
(
echo # Local MariaDB Configuration
echo DB_HOST=%DB_HOST%
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=!DB_PASSWORD!
echo DB_PORT=3306
echo.
echo # Application Settings
echo PORT=5000
echo NODE_ENV=development
echo.
echo # JWT Configuration
echo JWT_SECRET=xsm-market-secret-key-2025
echo JWT_REFRESH_SECRET=xsm-market-refresh-secret-key-2025
echo.
echo # Google OAuth Configuration
echo GOOGLE_CLIENT_ID=706026691678-kbn3pqlj9f5t7o8sri6lf5ucgi03btjb.apps.googleusercontent.com
echo.
echo # Email Configuration
echo GMAIL_USER=Tiktokwaalii2@gmail.com
echo GMAIL_PASSWORD=your_gmail_app_password_here
) > "%ENV_FILE%"

echo Backend .env file updated!

REM Setup tables
echo Setting up database tables...
cd /d "%BACKEND_DIR%"
if not exist "%BACKEND_DIR%\package.json" (
    echo Backend directory not found at: %BACKEND_DIR%
    pause
    exit /b 1
)

echo Running npm run setup-db in %CD%...
call npm run setup-db

if errorlevel 1 (
    echo Failed to setup database tables
    echo.
    echo Troubleshooting:
    echo 1. Make sure you're in the project root directory
    echo 2. Ensure backend dependencies are installed: cd backend ^&^& npm install
    echo 3. Check database credentials are correct
    pause
    exit /b 1
)

echo.
echo Local database setup complete!
echo.
echo Database Details:
echo   Host: %DB_HOST%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Password: !DB_PASSWORD!
echo.
echo Backend .env file updated with database credentials
echo You can now run: npm run dev
pause
