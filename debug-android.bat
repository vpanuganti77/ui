@echo off
echo Opening Chrome DevTools for Android debugging...
echo.
echo 1. Connect your Android device via USB
echo 2. Enable USB Debugging on device
echo 3. Open Chrome and go to: chrome://inspect
echo 4. Find your app and click "inspect"
echo 5. You can now debug notifications in real-time!
echo.
start chrome chrome://inspect
pause