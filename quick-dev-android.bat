@echo off
echo Starting React dev server...
start cmd /k "npm start"
timeout /t 5
echo Opening Android Studio...
npx cap open android
echo.
echo INSTRUCTIONS:
echo 1. Wait for React dev server to start (localhost:3000)
echo 2. Build and run the app in Android Studio
echo 3. App will connect to your local dev server
echo 4. Make changes in code - they'll reflect immediately!
pause