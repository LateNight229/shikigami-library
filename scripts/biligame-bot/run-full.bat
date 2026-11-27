@echo off
call "%~dp0run.bat" --all %*
set "BOT_EXIT=%errorlevel%"
echo.
if not "%BOT_EXIT%"=="0" echo Collection incomplete or stopped. See output and README.
pause
exit /b %BOT_EXIT%
