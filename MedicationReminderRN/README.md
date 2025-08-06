# 💊 Recordatorio de Medicamentos - React Native

Una aplicación móvil nativa para Android que ayuda a los usuarios a recordar tomar sus medicamentos con notificaciones inteligentes y seguimiento de progreso.

## ✨ Características

- 📱 **Interfaz nativa para Android** con componentes optimizados
- 💊 **Gestión de medicamentos** con nombre, dosis, frecuencia y horarios
- ⏰ **Notificaciones push** programadas para recordar tomar medicamentos
- 📊 **Seguimiento de progreso diario** con estadísticas visuales
- 💾 **Almacenamiento local** persistente con AsyncStorage
- 🎨 **Diseño moderno** con colores distintivos por medicamento
- ✅ **Marcar como tomado** con seguimiento de horarios

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **Node.js** (versión 16 o superior)
2. **React Native CLI**:
   ```bash
   npm install -g react-native-cli
   ```
3. **Android Studio** con SDK de Android
4. **Java Development Kit (JDK)** versión 11 o superior

### Configuración del entorno de desarrollo

1. **Android Studio**:
   - Instalar Android Studio
   - Configurar variables de entorno:
     ```bash
     export ANDROID_HOME=$HOME/Android/Sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/tools
     export PATH=$PATH:$ANDROID_HOME/tools/bin
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```

2. **Clonar y configurar el proyecto**:
   ```bash
   cd MedicationReminderRN
   npm install
   ```

3. **Instalar dependencias adicionales**:
   ```bash
   # Para las dependencias de React Native
   npm install --save react-native-vector-icons
   
   # Linking automático (React Native 0.60+)
   cd android && ./gradlew clean && cd ..
   ```

### 🔧 Configuración de notificaciones

1. **Permisos de notificación**: Ya configurados en `AndroidManifest.xml`

2. **Iconos de notificación**:
   - Agregar `ic_notification.png` en `android/app/src/main/res/drawable/`
   - Opcional: Personalizar iconos en diferentes resoluciones

### 📱 Ejecutar la aplicación

1. **Iniciar Metro Bundler**:
   ```bash
   npm start
   ```

2. **Ejecutar en Android**:
   ```bash
   # Con emulador o dispositivo conectado
   npm run android
   ```

## 🏗️ Estructura del proyecto

```
MedicationReminderRN/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── screens/             # Pantallas de la aplicación
│   │   ├── TodayScreen.tsx
│   │   └── AddMedicationScreen.tsx
│   ├── services/            # Servicios (storage, notificaciones)
│   │   ├── StorageService.ts
│   │   └── NotificationService.ts
│   ├── hooks/               # Hooks personalizados
│   │   └── useMedications.ts
│   ├── types/               # Definiciones de TypeScript
│   │   └── index.ts
│   └── App.tsx              # Componente principal
├── android/                 # Configuración de Android
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Funcionalidades principales

### 1. Gestión de medicamentos
- Agregar medicamentos con nombre, dosis y frecuencia
- Configurar múltiples horarios por medicamento
- Agregar notas opcionales (ej: "Tomar con comida")

### 2. Notificaciones inteligentes
- Notificaciones push programadas para cada horario
- Repetición diaria automática
- Sonido y vibración personalizables

### 3. Seguimiento diario
- Vista del horario del día actual
- Marcar medicamentos como tomados
- Seguimiento del progreso con porcentaje completado

### 4. Almacenamiento persistente
- Datos guardados localmente con AsyncStorage
- Sincronización automática entre sesiones
- Backup de horarios diarios

## 🎨 Personalización

### Colores de medicamentos
Los medicamentos se asignan automáticamente con colores distintivos:
- Azul (`#3B82F6`)
- Verde (`#10B981`)
- Púrpura (`#8B5CF6`)
- Naranja (`#F59E0B`)
- Rosa (`#EC4899`)
- Índigo (`#6366F1`)

### Estilos
Los estilos están centralizados en cada componente usando `StyleSheet` de React Native para mejor rendimiento.

## 📋 Scripts disponibles

```bash
# Ejecutar en Android
npm run android

# Iniciar Metro Bundler
npm start

# Ejecutar tests
npm test

# Linting
npm run lint
```

## 🚀 Construcción para producción

1. **Generar APK de release**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **Generar AAB para Play Store**:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

## 🔒 Permisos de Android

La aplicación requiere los siguientes permisos:
- `INTERNET`: Para funcionalidades futuras
- `WAKE_LOCK`: Para mantener notificaciones activas
- `VIBRATE`: Para notificaciones con vibración
- `RECEIVE_BOOT_COMPLETED`: Para restaurar notificaciones después del reinicio
- `POST_NOTIFICATIONS`: Para mostrar notificaciones (Android 13+)
- `SCHEDULE_EXACT_ALARM`: Para programar alarmas exactas

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Solución de problemas

### Error: "Unable to load script"
```bash
npm start -- --reset-cache
```

### Error de permisos en Android
- Verificar que los permisos estén en `AndroidManifest.xml`
- Para Android 13+, solicitar permisos de notificación manualmente

### Problemas con notificaciones
- Verificar que el canal de notificación esté creado
- Comprobar configuración de "No molestar" en el dispositivo

## 📞 Soporte

Si tienes problemas o preguntas, por favor:
1. Revisa la documentación de React Native
2. Consulta los issues existentes en el repositorio
3. Crea un nuevo issue con detalles del problema
