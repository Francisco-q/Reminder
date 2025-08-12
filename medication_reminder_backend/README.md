# 💊 Medication Reminder API - Django Backend

Backend API para la aplicación de recordatorio de medicamentos, construido con Django, PostgreSQL y arquitectura de **Vertical Slicing** para máxima mantenibilidad del código.

## 🏗️ Arquitectura - Vertical Slicing

Este proyecto utiliza **Vertical Slicing** para organizar el código por **capacidades de negocio** en lugar de capas técnicas:

```
medication_reminder_backend/
├── config/                     # Configuración Django
│   ├── settings/
│   │   ├── base.py            # Settings compartidos
│   │   ├── development.py     # Settings desarrollo
│   │   └── production.py      # Settings producción
│   ├── urls.py               # URLs principales
│   ├── wsgi.py & asgi.py     # Deployment
├── apps/                      # VERTICAL SLICES
│   ├── core/                  # Utilities compartidas
│   ├── users/                 # 👤 User Management
│   │   ├── models.py         # User, UserProfile
│   │   ├── serializers.py    # User serializers
│   │   ├── views.py          # User ViewSets
│   │   ├── urls.py           # User endpoints
│   │   └── apps.py
│   ├── authentication/        # 🔐 Auth & JWT
│   │   ├── serializers.py    # Login, Register, Token
│   │   ├── views.py          # Auth endpoints
│   │   ├── urls.py           # Auth routes
│   │   └── apps.py
│   ├── medications/          # 💊 Medication CRUD
│   │   ├── models.py         # Medication, MedicationHistory
│   │   ├── serializers.py    # Medication serializers
│   │   ├── views.py          # Medication ViewSets
│   │   ├── urls.py           # Medication endpoints
│   │   └── apps.py
│   ├── schedules/            # 📅 Daily Schedules
│   │   ├── models.py         # DailySchedule, MedicationDose
│   │   ├── serializers.py    # Schedule serializers
│   │   ├── views.py          # Schedule ViewSets
│   │   ├── urls.py           # Schedule endpoints
│   │   └── apps.py
│   ├── notifications/        # 🔔 Push Notifications
│   │   ├── models.py         # NotificationTemplate, UserNotification
│   │   ├── serializers.py    # Notification serializers
│   │   ├── views.py          # Notification endpoints
│   │   ├── tasks.py          # Celery tasks
│   │   ├── urls.py           # Notification routes
│   │   └── apps.py
│   └── analytics/            # 📊 Statistics & Progress
│       ├── models.py         # UserStats, MedicationStats
│       ├── serializers.py    # Analytics serializers
│       ├── views.py          # Analytics endpoints
│       ├── urls.py           # Analytics routes
│       └── apps.py
├── manage.py
├── requirements.txt
└── README.md
```

### 🎯 Ventajas del Vertical Slicing

1. **Modularidad**: Cada slice es independiente y cohesivo
2. **Mantenibilidad**: Cambios en una funcionalidad están contenidos
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Testing**: Cada slice se puede probar independientemente
5. **Deployment**: Posible desplegar slices como microservicios

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **Python 3.9+**
2. **PostgreSQL 12+**
3. **Redis** (para Celery y cache)
4. **Git**

### 1. Configuración del Entorno

```bash
# Clonar el repositorio
cd Reminder/medication_reminder_backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\\Scripts\\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configuración de Base de Datos

```sql
-- Crear base de datos PostgreSQL
CREATE DATABASE medication_reminder_db;
CREATE USER medication_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE medication_reminder_db TO medication_user;
```

### 3. Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
# DATABASE_URL=postgresql://medication_user:password@localhost:5432/medication_reminder_db
# SECRET_KEY=your-super-secret-key
# DEBUG=True
```

### 4. Migraciones y Configuración Inicial

```bash
# Ejecutar migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recolectar archivos estáticos
python manage.py collectstatic

# Ejecutar servidor de desarrollo
python manage.py runserver
```

### 5. Configurar Celery (Opcional)

```bash
# Terminal 1 - Celery Worker
celery -A config worker -l info

# Terminal 2 - Celery Beat (para tareas programadas)
celery -A config beat -l info
```

## 🔗 API Endpoints

### Autenticación
```
POST /api/auth/register/          # Registro de usuario
POST /api/auth/login/             # Login
POST /api/auth/logout/            # Logout
POST /api/auth/token/             # Obtener JWT token
POST /api/auth/token/refresh/     # Renovar token
GET  /api/auth/verify/            # Verificar token
```

### Usuarios
```
GET    /api/users/me/             # Obtener usuario actual
PUT    /api/users/update_me/      # Actualizar usuario
POST   /api/users/change_password/ # Cambiar contraseña
GET    /api/users/profile/        # Obtener perfil
PUT    /api/users/update_profile/ # Actualizar perfil
```

### Medicamentos
```
GET    /api/medications/          # Listar medicamentos
POST   /api/medications/          # Crear medicamento
GET    /api/medications/{id}/     # Obtener medicamento
PUT    /api/medications/{id}/     # Actualizar medicamento
DELETE /api/medications/{id}/     # Eliminar medicamento
POST   /api/medications/{id}/update_stock/ # Actualizar stock
```

### Horarios Diarios
```
GET    /api/schedules/today/      # Horario de hoy
POST   /api/schedules/mark_taken/ # Marcar como tomado
GET    /api/schedules/progress/   # Progreso del día
GET    /api/schedules/upcoming/   # Próximas dosis
```

### Notificaciones
```
GET    /api/notifications/        # Listar notificaciones
POST   /api/notifications/mark_read/ # Marcar como leída
GET    /api/notifications/settings/ # Configuración
PUT    /api/notifications/settings/ # Actualizar config
```

### Analytics
```
GET    /api/analytics/stats/      # Estadísticas generales
GET    /api/analytics/adherence/  # Adherencia al tratamiento
GET    /api/analytics/progress/   # Progreso por período
```

## 🔧 Modelos de Datos

### Usuario
```python
User:
- email (único)
- username, first_name, last_name
- phone_number, date_of_birth
- timezone, language
- device_token, device_type
- notification preferences

UserProfile:
- medical information
- emergency contacts
- preferences
```

### Medicamentos
```python
Medication:
- name, dosage, frequency
- times[] (array de horarios)
- notes, color
- medication_type, condition
- stock tracking
- prescriber information

MedicationHistory:
- audit log de cambios
```

### Horarios
```python
DailySchedule:
- medication_id, scheduled_time
- taken, taken_at
- user, date

MedicationDose:
- tracking de dosis individuales
```

### Notificaciones
```python
UserNotification:
- title, message, type
- scheduled_time, sent_at
- read status

NotificationTemplate:
- plantillas reutilizables
```

## 🔐 Autenticación

El API utiliza **JWT (JSON Web Tokens)** para autenticación:

```javascript
// Headers requeridos
{
  "Authorization": "Bearer <access_token>",
  "Content-Type": "application/json"
}

// Estructura del token
{
  "user_id": "uuid",
  "username": "email",
  "exp": timestamp,
  "iat": timestamp
}
```

## 🧪 Testing

```bash
# Ejecutar tests
python manage.py test

# Con coverage
coverage run manage.py test
coverage report
coverage html

# Tests por slice
python manage.py test apps.medications
python manage.py test apps.users
```

## 📦 Deployment

### Docker (Recomendado)

```dockerfile
# Dockerfile incluido en el proyecto
docker build -t medication-reminder-api .
docker run -p 8000:8000 medication-reminder-api
```

### Docker Compose

```yaml
# docker-compose.yml incluido
docker-compose up -d
```

### Manual

```bash
# Configurar para producción
export DJANGO_SETTINGS_MODULE=config.settings.production
export DEBUG=False

# Usar Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

## 🔄 Integración con Frontend

### React Native Integration

```typescript
// Configuración del API client
const API_BASE_URL = 'http://your-backend-url/api';

// Headers de autenticación
const authHeaders = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
};

// Ejemplo de llamada
const getMedications = async () => {
  const response = await fetch(`${API_BASE_URL}/medications/`, {
    headers: authHeaders,
  });
  return response.json();
};
```

### Sincronización de Estados

```typescript
// El backend mantiene el estado central
// El frontend se sincroniza periódicamente
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
  color: string;
}
```

## 🔧 Configuración Avanzada

### Notificaciones Push

```python
# settings/base.py
FCM_SERVER_KEY = env('FCM_SERVER_KEY')

# Envío de notificaciones
from .tasks import send_medication_reminder
send_medication_reminder.delay(user_id, medication_id)
```

### Cache con Redis

```python
# Cache de datos frecuentemente accedidos
@cache_page(60 * 15)  # 15 minutos
def get_today_schedule(request):
    # Lógica del endpoint
    pass
```

### Background Tasks

```python
# tasks.py en cada app
@shared_task
def process_daily_schedules():
    # Generar horarios diarios
    pass

@shared_task
def send_medication_reminders():
    # Enviar recordatorios
    pass
```

## 🐛 Debugging

```bash
# Logs detallados
tail -f logs/django.log

# Shell de Django
python manage.py shell_plus

# Debug con ipdb
import ipdb; ipdb.set_trace()
```

## 🔐 Seguridad

- JWT tokens con expiración
- Validación de entrada en serializers
- CORS configurado para production
- Rate limiting (TODO)
- Sanitización de datos SQL
- Headers de seguridad configurados

## 📚 Documentación API

La documentación interactiva está disponible en:

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **Schema**: `http://localhost:8000/api/schema/`

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

### Estándares de Código

- Seguir PEP 8 para Python
- Documentar funciones y clases
- Tests para nuevas funcionalidades
- Mantener la organización por vertical slices

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 🚀 Próximos Pasos

1. **Completar todas las apps**: schedules, notifications, analytics
2. **Implementar Celery tasks**: Para notificaciones automáticas
3. **Agregar tests completos**: Para cada vertical slice
4. **Docker configuration**: Para deployment fácil
5. **CI/CD pipeline**: Automatización de despliegue
6. **Monitoring**: Logging y métricas de rendimiento

¡El backend está listo para integrarse con tu aplicación React Native! 🎉
