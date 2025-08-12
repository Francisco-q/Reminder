# 💊 Medication Reminder - Recordatorio de Medicamentos

Una aplicación completa de recordatorio de medicamentos con frontend en **React Native** y backend en **Django**, diseñada para ayudar a los usuarios a mantener un seguimiento preciso de su medicación diaria.

## 🎯 Visión General del Proyecto

**Medication Reminder** es una solución integral que combina una aplicación móvil intuitiva con un backend robusto y un sistema de monitoreo avanzado para garantizar la adherencia al tratamiento médico.

### 📱 **Frontend - React Native**
- **Aplicación móvil nativa** para iOS y Android
- **Interfaz intuitiva** para gestión de medicamentos
- **Notificaciones push** para recordatorios
- **Sincronización offline** para uso sin conexión
- **Estadísticas visuales** del progreso del tratamiento

### 🔧 **Backend - Django API**
- **API REST completa** con Django Rest Framework
- **Base de datos PostgreSQL** para almacenamiento confiable
- **Autenticación JWT** segura
- **Arquitectura de Vertical Slicing** para mantenibilidad
- **Tareas asíncronas** con Celery y Redis

### 🔍 **Sistema de Monitoreo** ⭐ **NUEVO**
- **Sincronización Frontend-Backend** en tiempo real
- **Testing automático** de conectividad API
- **Reportes de versión** y estado del sistema
- **Dashboard de salud** del sistema
- **Generación de reportes "un solo botón"**

## 🏗️ Arquitectura del Sistema

```
Medication Reminder/
├── 📱 MedicationReminderRN/          # React Native Frontend
│   ├── src/
│   │   ├── components/              # Componentes reutilizables
│   │   ├── screens/                 # Pantallas principales
│   │   ├── navigation/              # Navegación de la app
│   │   ├── services/                # API calls y lógica
│   │   ├── utils/                   # Utilidades y helpers
│   │   └── types/                   # TypeScript definitions
│   ├── android/                     # Código nativo Android
│   ├── ios/                        # Código nativo iOS
│   └── package.json
│
├── 🔧 medication_reminder_backend/   # Django Backend
│   ├── config/                     # Configuración Django
│   ├── apps/                       # Vertical Slices
│   │   ├── core/                   # Utilidades compartidas
│   │   ├── users/                  # 👤 Gestión de usuarios
│   │   ├── authentication/         # 🔐 Autenticación JWT
│   │   ├── medications/            # 💊 CRUD Medicamentos
│   │   ├── schedules/              # 📅 Horarios diarios
│   │   ├── notifications/          # 🔔 Notificaciones push
│   │   ├── analytics/              # 📊 Estadísticas
│   │   └── monitoring/             # 🔍 Monitoreo del sistema
│   ├── requirements.txt
│   └── manage.py
│
└── README.md                        # Este archivo
```

## ✨ Características Principales

### 📱 **Aplicación Móvil (React Native)**

#### 🔐 **Autenticación**
- Registro e inicio de sesión seguro
- Gestión de perfil de usuario
- Recuperación de contraseña
- Autenticación biométrica (opcional)

#### 💊 **Gestión de Medicamentos**
- Añadir medicamentos con información completa
- Configurar horarios y frecuencias
- Editar y eliminar medicamentos
- Código de colores personalizable
- Información del prescriptor

#### 📅 **Horarios y Recordatorios**
- Vista de horarios diarios
- Marcar medicamentos como tomados
- Notificaciones push personalizables
- Historial de adherencia
- Recordatorios inteligentes

#### 📊 **Análisis y Progreso**
- Estadísticas de adherencia
- Gráficos de progreso
- Reportes semanales/mensuales
- Tendencias de cumplimiento
- Exportación de datos

#### 🔄 **Sincronización**
- Funcionamiento offline
- Sincronización automática
- Respaldo en la nube
- Multi-dispositivo

### 🔧 **Backend API (Django)**

#### 🏛️ **Arquitectura Vertical Slicing**
- **apps/users/**: Gestión completa de usuarios y perfiles
- **apps/authentication/**: Sistema de autenticación JWT
- **apps/medications/**: CRUD y gestión de medicamentos
- **apps/schedules/**: Horarios diarios y seguimiento de dosis
- **apps/notifications/**: Sistema de notificaciones push
- **apps/analytics/**: Estadísticas y análisis de datos
- **apps/core/**: Utilidades y funcionalidades compartidas

#### 🔒 **Seguridad**
- Autenticación JWT con refresh tokens
- Validación de datos robusta
- Protección CORS configurada
- Sanitización de entradas
- Logs de auditoría

#### 🚀 **Rendimiento**
- Cache con Redis
- Optimización de consultas ORM
- Paginación automática
- Compresión de respuestas
- Tareas asíncronas con Celery

### 🔍 **Sistema de Monitoreo** ⭐

#### 📊 **Dashboard Central**
- Vista general del estado del sistema
- Métricas de salud en tiempo real
- Estado de sincronización frontend-backend
- Alertas y notificaciones críticas

#### 🔄 **Sincronización Frontend-Backend**
- **Mapeo completo** de características:
  - ✅ Autenticación: Login/Register ↔ JWT API
  - ✅ Medicamentos: CRUD Forms ↔ Medications API
  - ✅ Horarios: Schedule Views ↔ Schedules API
  - ✅ Notificaciones: Push System ↔ Notifications API
  - ✅ Analytics: Charts ↔ Analytics API
  - ✅ Usuarios: Profile Management ↔ Users API
- **Detección automática** de desincronización
- **Alertas proactivas** para problemas de conectividad

#### 🧪 **Testing Automático**
- **Tests de API** completos con autenticación
- **Verificación de endpoints** en tiempo real
- **Métricas de rendimiento** y tiempo de respuesta
- **Validación de datos** de respuesta
- **Reportes detallados** de fallos

#### 📈 **Gestión de Versiones**
- **Seguimiento automático** de versiones frontend y backend
- **Build numbers** incrementales
- **Notas de release** estructuradas
- **Historial completo** de versiones
- **Compatibilidad** entre versiones

#### 📋 **Reportes "Un Solo Botón"**
```bash
# Comando único para reporte completo
python manage.py monitor export-report --output reporte.json --format json
```
- **Reporte integral** del estado del sistema
- **Exportación** en múltiples formatos (JSON, CSV, texto)
- **Programación automática** con Celery
- **Distribución** por email automática

## 🚀 Instalación Rápida

### 📱 **Frontend React Native**

```bash
# Navegar al directorio del frontend
cd MedicationReminderRN

# Instalar dependencias
npm install

# iOS (macOS únicamente)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### 🔧 **Backend Django**

```bash
# Navegar al directorio del backend
cd medication_reminder_backend

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
python manage.py migrate

# Setup del sistema de monitoreo
python setup_monitoring.bat  # Windows
# o
./setup_monitoring.sh        # Linux/Mac

# Ejecutar servidor
python manage.py runserver
```

### 🔍 **Monitoreo del Sistema**

```bash
# Dashboard general
python manage.py monitor dashboard

# Sincronizar características
python manage.py monitor sync-features

# Ejecutar tests de API
python manage.py monitor run-tests

# Generar reporte completo
python manage.py monitor export-report --output reporte.json
```

## 🌐 Endpoints de API

```
BASE_URL: http://localhost:8000/api/

Autenticación:
├── POST /auth/register/              # Registro
├── POST /auth/login/                 # Login
└── POST /auth/token/refresh/         # Renovar token

Medicamentos:
├── GET    /medications/              # Listar
├── POST   /medications/              # Crear
├── GET    /medications/{id}/         # Obtener
├── PUT    /medications/{id}/         # Actualizar
└── DELETE /medications/{id}/         # Eliminar

Horarios:
├── GET  /schedules/today/            # Horario de hoy
├── POST /schedules/mark_taken/       # Marcar como tomado
└── GET  /schedules/progress/         # Progreso del día

Monitoreo:
├── GET  /monitoring/dashboard/       # Dashboard
├── POST /monitoring/sync-features/   # Sincronizar
├── POST /monitoring/run-tests/       # Ejecutar tests
└── GET  /monitoring/export/          # Exportar reportes
```

## 🛠️ Tecnologías Utilizadas

### 📱 **Frontend**
- **React Native** 0.72+ - Framework móvil multiplataforma
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación nativa
- **Async Storage** - Almacenamiento local
- **React Native Push Notifications** - Notificaciones
- **React Native Charts** - Visualización de datos

### 🔧 **Backend**
- **Django 4.2** - Framework web de Python
- **Django Rest Framework** - API REST
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y broker de Celery
- **Celery** - Tareas asíncronas
- **JWT** - Autenticación de tokens

### 🔍 **Monitoreo**
- **Custom Monitoring System** - Sistema propio de monitoreo
- **Automated Testing Framework** - Testing automático de APIs
- **Health Check System** - Monitoreo de salud del sistema
- **Report Generation Engine** - Generador de reportes
- **Feature Synchronization Tracker** - Seguimiento de sincronización

### 🚀 **DevOps**
- **Docker** - Containerización
- **Docker Compose** - Orquestación local
- **GitHub Actions** - CI/CD (configurar)
- **WhiteNoise** - Archivos estáticos
- **Gunicorn** - Servidor WSGI de producción

## 🔄 Flujo de Trabajo

1. **Usuario abre la app** → Autenticación JWT
2. **Sincronización** → Descarga datos desde API
3. **Gestión local** → Funciona offline
4. **Recordatorios** → Notificaciones automáticas
5. **Sincronización periódica** → Envía cambios al backend
6. **Monitoreo continuo** → Sistema verifica conectividad
7. **Reportes automáticos** → Generación programada de reportes

## 🧪 Testing

### 📱 **Frontend Testing**
```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e
```

### 🔧 **Backend Testing**
```bash
# Tests completos
python manage.py test

# Tests por módulo
python manage.py test apps.medications

# Tests de monitoreo
python manage.py monitor run-tests
```

## 📊 Monitoreo y Métricas

El sistema incluye un **dashboard de monitoreo completo** que proporciona:

- **🔄 Estado de Sincronización**: Frontend ↔ Backend
- **🧪 Resultados de Tests**: APIs y conectividad
- **💊 Métricas de Uso**: Usuarios, medicamentos, adherencia
- **🏥 Salud del Sistema**: Base de datos, cache, servicios
- **📈 Reportes Automatizados**: Generación programada
- **🚨 Alertas**: Notificaciones proactivas de problemas

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🎯 Roadmap

### 🔄 En Desarrollo
- [ ] Integración completa frontend-backend
- [ ] Tests automatizados completos
- [ ] Documentación de API interactiva
- [ ] Sistema de alertas avanzado

### 🚀 Próximas Versiones
- [ ] Integración con wearables (Apple Watch, Android Wear)
- [ ] Reconocimiento de voz para registrar medicamentos
- [ ] Integración con farmacias para reposición automática
- [ ] Sistema de compartir con familiares/cuidadores
- [ ] Integración con sistemas de salud (HL7 FHIR)

---

## 🏥 Estado del Sistema

**✅ Backend Django**: Completamente funcional con 7 módulos verticales
**🔄 Frontend React Native**: En desarrollo e integración
**✅ Sistema de Monitoreo**: Completamente implementado y operativo
**🔧 DevOps**: Docker y scripts de deployment configurados

¡El sistema está listo para ayudar a miles de usuarios a mantener su adherencia al tratamiento médico! 🎉
