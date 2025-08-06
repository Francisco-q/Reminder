# 🚀 Comandos para configurar el proyecto React Native

## 1. Instalar React Native CLI globalmente (si no lo tienes)
```bash
npm install -g react-native-cli
```

## 2. Instalar las dependencias del proyecto
```bash
cd MedicationReminderRN
npm install
```

## 3. Instalar dependencias adicionales con npm
```bash
npm install babel-plugin-module-resolver --save-dev
```

## 4. Configurar Android (si es necesario)
```bash
cd android
./gradlew clean
cd ..
```

## 5. Ejecutar la aplicación

### Iniciar el Metro Bundler
```bash
npm start
```

### En otra terminal, ejecutar en Android
```bash
npm run android
```

## Notas importantes:

### Para Windows:
- Asegúrate de tener Android Studio instalado
- Configura las variables de entorno ANDROID_HOME
- Usa PowerShell o CMD como administrador si es necesario

### Variables de entorno para Windows:
```
ANDROID_HOME = C:\Users\{username}\AppData\Local\Android\Sdk
Path += %ANDROID_HOME%\platform-tools
Path += %ANDROID_HOME%\tools
Path += %ANDROID_HOME%\tools\bin
```

### Si tienes problemas con las dependencias:
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules
npm install

# Limpiar Metro cache
npm start -- --reset-cache
```

### Para generar un APK de producción:
```bash
cd android
.\gradlew assembleRelease
```

El APK se generará en: `android\app\build\outputs\apk\release\app-release.apk`
