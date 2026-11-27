@echo off
set "BOT_PYTHON=C:\Users\VanAnh\Documents\ChatGPT\Bot_Onmyoji\.venv\Scripts\python.exe"
if not exist "%BOT_PYTHON%" (
  echo Python environment not found: %BOT_PYTHON%
  exit /b 1
)
"%BOT_PYTHON%" "%~dp0collect.py" %*
exit /b %errorlevel%
