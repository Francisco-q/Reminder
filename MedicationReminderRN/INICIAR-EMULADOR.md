# 🚀 INSTRUCCIONES: Iniciar Emulador y App

## 📱 PASO 1: Iniciar el Emulador

### Ejecutar el Script:
1. **Ve al directorio**: `e:\DocumentosE\git\Reminder\Reminder\MedicationReminderRN`
2. **Haz doble clic** en el archivo `start-emulator.bat`
3. **Se abrirá una ventana negra** (CMD) - ¡NO LA CIERRES!

### Lo que Verás:
```
===========================================
   INICIAR EMULADOR ANDROID
===========================================

Configurando variables de entorno...
ANDROID_HOME: C:\Users\Francisco\AppData\Local\Android\Sdk

Verificando emuladores disponibles...
Medium_Phone_API_36.0

===========================================
Iniciando emulador Medium_Phone_API_36.0...
IMPORTANTE: Esto puede tomar 2-5 minutos
No cierres esta ventana hasta que aparezca
la pantalla del teléfono Android
===========================================
```

### ⏳ Espera:
- **2-5 minutos** para que aparezca la ventana del emulador
- **Aparecerá una ventana** con un teléfono Android virtual
- **El teléfono tomará otro minuto** en cargar completamente

## 📱 PASO 2: Una Vez que el Emulador Esté Listo

### ✅ Señales de que está listo:
- ✅ Ventana del emulador abierta
- ✅ Pantalla de inicio de Android visible
- ✅ Puedes hacer clic y navegar en el teléfono virtual

### 🚀 Entonces Ejecuta tu App:

**Opción A: Script de la App**
1. **Haz doble clic** en `run-android.bat`

**Opción B: Nueva Terminal en VS Code**
1. `Ctrl + Shift + `` (nueva terminal)
2. ```bash
   cd "e:\DocumentosE\git\Reminder\Reminder\MedicationReminderRN"
   npm run android
   ```

## ⚠️ Solución de Problemas:

### Si el emulador no inicia:
- Verifica que Android Studio esté cerrado
- Reinicia VS Code
- Intenta ejecutar el script como administrador

### Si sale error "emulator: ERROR":
- Abre Android Studio
- Ve a AVD Manager
- Verifica que "Medium_Phone_API_36.0" esté disponible

### Si no aparece la ventana del emulador después de 5 minutos:
- Presiona Ctrl+C en la ventana CMD
- Abre Android Studio
- Usa AVD Manager para iniciar el emulador manualmente

## 🎯 ¿Listo?

1. **Ejecuta `start-emulator.bat`** haciendo doble clic
2. **Espera** a que aparezca la ventana del emulador
3. **Avísame** cuando veas el teléfono Android funcionando

¡Vamos a probarlo! 🚀
