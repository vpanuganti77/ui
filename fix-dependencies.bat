@echo off
echo Fixing React and Router dependencies...

echo Removing node_modules and package-lock.json...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo Installing correct versions...
npm install

echo Dependencies fixed! You can now run: npm start
pause