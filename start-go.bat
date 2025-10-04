@echo off
echo ========================================
echo LinkedIn Integration App (Go Backend)
echo ========================================
echo.

REM Check if Go is installed
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Go is not installed or not in PATH
    echo.
    echo Please install Go from: https://golang.org/dl/
    echo Make sure to add Go to your PATH environment variable
    echo.
    pause
    exit /b 1
)

echo Go version:
go version
echo.

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo Please create .env file with your Unipile API key
    echo.
)

echo Installing Go dependencies...
go mod tidy
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building application...
go build -o linkedin-integration-app.exe .
if %errorlevel% neq 0 (
    echo ERROR: Failed to build application
    pause
    exit /b 1
)

echo.
echo Starting LinkedIn Integration App...
echo Server will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

linkedin-integration-app.exe

pause