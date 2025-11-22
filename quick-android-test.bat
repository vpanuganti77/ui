@echo off
echo 🚀 Quick Android Build & Test Script
echo.

echo 📦 Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🔄 Syncing to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ❌ Sync failed!
    pause
    exit /b 1
)

echo 📱 Opening Android Studio...
call npx cap open android

echo ✅ Done! Now just click Run in Android Studio
echo.
echo 💡 Tip: Keep Android Studio open and just click Run button for faster testing
pause