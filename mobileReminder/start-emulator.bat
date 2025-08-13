@echo off
echo.
echo ===========================================
echo    INICIAR EMULADOR ANDROID
echo ===========================================
echo.

echo Configurando variables de entorno...
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools

echo.
echo ANDROID_HOME: %ANDROID_HOME%
echo.

echo Verificando emuladores disponibles...
echo.
"%ANDROID_HOME%\emulator\emulator" -list-avds

echo.
echo ===========================================
echo Iniciando emulador Medium_Phone_API_36.0...
echo IMPORTANTE: Esto puede tomar 2-5 minutos
echo No cierres esta ventana hasta que aparezca
echo la pantalla del teléfono Android
echo ===========================================
echo.

"%ANDROID_HOME%\emulator\emulator" -avd Medium_Phone_API_36.0 -no-snapshot-load

echo.
echo Si hay errores, verifica que Android Studio esté instalado correctamente
pause
