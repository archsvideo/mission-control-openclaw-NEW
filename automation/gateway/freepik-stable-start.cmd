@echo off
REM Freepik Relay stable start
openclaw gateway start >nul 2>&1
timeout /t 2 /nobreak >nul
start "" "https://www.freepik.es/pikaso/ai-image-generator"
start "" "https://www.linkedin.com/feed/"
echo OpenClaw gateway started and tabs opened.
echo Now click the OpenClaw Browser Relay icon on the Freepik tab (ON).
