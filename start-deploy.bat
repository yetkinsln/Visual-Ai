@echo off
start cmd /k "cd /d .\client && npm run dev"
start cmd /k "cd /d .\server && npm start"
start cmd /k "cd /d .\ml-backend && call .\venv\Scripts\activate && cd pythonServer && daphne pythonServer.asgi:application"

