# 🔑 GOOGLE OAUTH CONFIGURATION GUIDE

## 📋 PASOS PARA CONFIGURAR GOOGLE OAUTH

### 1. **Google Cloud Console Setup**

1. **Ir a Google Cloud Console**
   - Visita: https://console.cloud.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crear o Seleccionar Proyecto**
   ```
   - Haz clic en el selector de proyecto (parte superior)
   - Crea un nuevo proyecto: "Medication Reminder"
   - O selecciona un proyecto existente
   ```

3. **Habilitar APIs Necesarias**
   ```
   - Ve a "APIs & Services" > "Library"
   - Busca "Google+ API" y habilítala
   - Busca "Google Identity" y habilítala (si está disponible)
   ```

4. **Configurar Pantalla de Consentimiento OAuth**
   ```
   - Ve a "APIs & Services" > "OAuth consent screen"
   - Tipo: Externo (para testing) o Interno (para organización)
   - Información de la app:
     * App name: Medication Reminder
     * User support email: tu-email@gmail.com
     * Developer contact: tu-email@gmail.com
   - Scopes: email, profile
   - Test users: agrega tu email para testing
   ```

5. **Crear Credenciales OAuth 2.0**
   ```
   - Ve a "APIs & Services" > "Credentials"
   - Clic en "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Name: Medication Reminder Web Client
   ```

6. **Configurar URIs Autorizados**

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5173
   http://127.0.0.1:3000
   http://127.0.0.1:5173
   https://tu-dominio.com (para producción)
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000
   http://localhost:5173
   https://tu-dominio.com (para producción)
   ```

7. **Obtener Credenciales**
   - Copia el **Client ID** (algo como: xxxxx.apps.googleusercontent.com)
   - Copia el **Client Secret** (opcional para frontend-only OAuth)

### 2. **Configurar Backend Django**

Edita `medication_reminder_backend/.env`:

```bash
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=tu_client_secret_opcional
```

**Instalar dependencia adicional:**

```bash
cd medication_reminder_backend
source venv/bin/activate  # Linux/Mac
# o venv\Scripts\activate  # Windows

pip install google-auth google-auth-oauthlib google-auth-httplib2
pip freeze > requirements.txt  # Actualizar requirements
```

**Crear/Actualizar endpoint en `apps/authentication/views.py`:**

```python
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth_login(request):
    """
    Endpoint para login con Google OAuth
    Recibe el token de Google y autentica al usuario
    """
    token = request.data.get('credential')
    
    if not token:
        return Response(
            {'error': 'Token de Google requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verificar token de Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_OAUTH_CLIENT_ID
        )
        
        # Validar issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return Response(
                {'error': 'Token inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extraer información del usuario
        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        # Crear o obtener usuario
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            }
        )
        
        # Si es nuevo usuario, actualizar información
        if created:
            user.set_unusable_password()  # No password para OAuth users
            user.save()
        
        # Generar JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login exitoso' if not created else 'Usuario creado exitosamente',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_new': created,
            }
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response(
            {'error': f'Token inválido: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Error del servidor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

**Agregar URL en `apps/authentication/urls.py`:**

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... otras URLs
    path('google-oauth/', views.google_oauth_login, name='google_oauth_login'),
]
```

### 3. **Configurar Frontend React**

Edita `ReminderFront/.env`:

```bash
VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
```

**Instalar dependencia:**

```bash
cd ReminderFront
npm install @google-cloud/local-auth google-auth-library
```

**Verificar GoogleAuthButton.tsx está configurado correctamente:**

El componente debe usar tu Client ID y llamar al endpoint correcto.

### 4. **Testing de Google OAuth**

**Backend Test:**

```bash
cd medication_reminder_backend
source venv/bin/activate

# Test manual con curl (después de obtener token de Google)
curl -X POST http://localhost:8000/api/auth/google-oauth/ \
  -H "Content-Type: application/json" \
  -d '{"credential": "TOKEN_DE_GOOGLE_AQUI"}'
```

**Frontend Test:**

```bash
cd ReminderFront
npm run dev

# Visitar: http://localhost:5173
# Hacer clic en "Continuar con Google"
# Verificar que redirige correctamente
```

### 5. **Configuración para Producción**

**Actualizar Google Cloud Console:**

1. Agregar tu dominio de producción:
   ```
   https://tu-dominio.com
   https://www.tu-dominio.com
   ```

2. Actualizar variables de entorno:

   **Backend (.env):**
   ```bash
   GOOGLE_OAUTH_CLIENT_ID=tu_client_id.apps.googleusercontent.com
   CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
   ```

   **Frontend (.env):**
   ```bash
   VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
   VITE_API_BASE_URL=https://api.tu-dominio.com
   ```

### 6. **Troubleshooting Común**

**Error: "Origin mismatch"**
- Verificar que el origen está en "Authorized JavaScript origins"
- Verificar protocolo (http vs https)
- Verificar puerto exacto

**Error: "Token verification failed"**
- Verificar que GOOGLE_OAUTH_CLIENT_ID es correcto
- Verificar que el token no ha expirado
- Verificar conexión a internet

**Error: "Popup blocked"**
- Permitir popups para tu dominio
- Usar redirect flow en lugar de popup

**Error: "Access blocked"**
- Verificar pantalla de consentimiento
- Agregar email a test users si está en modo testing
- Verificar que las APIs están habilitadas

### 7. **Flujo Completo de Testing**

1. **Configurar Google Cloud:**
   - ✅ Proyecto creado
   - ✅ APIs habilitadas
   - ✅ Pantalla de consentimiento configurada
   - ✅ Credenciales OAuth creadas
   - ✅ URIs autorizados configurados

2. **Configurar Backend:**
   - ✅ GOOGLE_OAUTH_CLIENT_ID en .env
   - ✅ Dependencia google-auth instalada
   - ✅ Endpoint google-oauth funcionando

3. **Configurar Frontend:**
   - ✅ VITE_GOOGLE_CLIENT_ID en .env
   - ✅ GoogleAuthButton funcionando
   - ✅ Redirección después de login

4. **Testing End-to-End:**
   - ✅ Clic en "Continuar con Google"
   - ✅ Popup/redirect de Google
   - ✅ Autorización exitosa
   - ✅ Token enviado a backend
   - ✅ Usuario creado/autenticado
   - ✅ JWT tokens recibidos
   - ✅ Redirección a dashboard

---

**¿Necesitas ayuda?** 

Ejecuta el script de testing:
```bash
python medication_reminder_backend/test_functionality.py
```

O revisa los logs:
```bash
# Backend logs
tail -f medication_reminder_backend/logs/application.log

# Frontend dev console
# F12 > Console tab
```
