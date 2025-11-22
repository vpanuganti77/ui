@echo off
echo Opening Android project in Android Studio...
echo.
echo Please follow these steps in Android Studio:
echo 1. Open the 'android' folder in Android Studio
echo 2. Let Android Studio sync the project
echo 3. Go to Build > Generate Signed Bundle / APK
echo 4. Choose APK and click Next
echo 5. Create a new keystore or use existing one
echo 6. Build the debug APK
echo.
echo The APK will be generated in: android\app\build\outputs\apk\debug\
echo.
pause

start "" "android"