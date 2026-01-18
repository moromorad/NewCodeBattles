@echo off
cd /d "%~dp0"
echo Starting Backend Server...
python -m uvicorn src.main:socket_app --host 0.0.0.0 --port 3000 --reload
if %ERRORLEVEL% NEQ 0 (
    echo Server failed with error code %ERRORLEVEL%
)
pause
