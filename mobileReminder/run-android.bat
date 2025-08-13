@echo off
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
echo.
echo ===========================================
echo    EJECUTAR APLICACION REACT NATIVE
echo ===========================================
echo.
echo Setting up Android environment...
echo ANDROID_HOME: %ANDROID_HOME%
echo.

echo Navegando al directorio del proyecto...
cd /d "e:\DocumentosE\git\Reminder\Reminder\MedicationReminderRN"

echo.
echo Directorio actual:
cd

echo.
echo Starting Metro bundler in background...
start "Metro" cmd /k "npx react-native start"
timeout /t 5

echo.
echo Building and installing app on Android device/emulator...
npx react-native run-android --verbose
pause
echo.
npm run android

echo.
echo ===========================================
echo Si hay errores, intenta:
echo   1. Verificar que Android Studio este instalado
echo   2. Tener un emulador corriendo o dispositivo conectado
echo   3. Verificar variables de entorno ANDROID_HOME
echo ===========================================

pause
