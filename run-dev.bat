@echo off
echo Starting Pathfinder Fullstack...

:: Start Backend in a new window
echo Starting Backend...
start cmd /k "cd backend && .venv\Scripts\activate && python manage.py runserver"

:: Start Frontend in a new window
echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both services are starting in separate windows.
pause
