# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Medication Reminder Frontend

Aplicación web frontend en React con TypeScript para el sistema de recordatorio de medicamentos.

## 🚀 Características

- **Autenticación JWT** - Login/registro con tokens seguros
- **Gestión de Medicamentos** - CRUD completo con colores y categorías  
- **Horarios Diarios** - Vista de medicamentos de hoy con seguimiento
- **Notificaciones** - Sistema de alertas y recordatorios
- **Analytics** - Estadísticas de adherencia y progreso
- **Monitoring** - Dashboard de estado del sistema
- **Responsive Design** - Adaptado para móvil y desktop

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos
- **Axios** para peticiones HTTP
- **React Router** para navegación
- **React Hook Form** para formularios
- **Recharts** para gráficos
- **JWT Decode** para autenticación

## 📦 Instalación

```bash
npm install
```

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

## 🔧 Build

```bash
npm run build
```

## 🌐 Configuración API

El frontend se conecta al backend Django en `http://localhost:8000/api` por defecto.

Para cambiar la URL, edita el archivo `.env`:

```env
VITE_API_BASE_URL=http://tu-backend-url/api
```

## 📱 Características Implementadas

### ✅ Autenticación
- [x] Login con email/password
- [x] Registro de usuarios
- [x] JWT tokens automáticos
- [x] Renovación automática de tokens
- [x] Rutas protegidas

### ✅ Medicamentos  
- [x] Lista de medicamentos
- [x] Crear/editar medicamentos
- [x] Gestión de stock
- [x] Colores personalizados
- [x] Filtros y búsqueda

### ✅ Horarios
- [x] Vista de horarios de hoy
- [x] Marcar como tomado/omitido
- [x] Progreso diario
- [x] Próximas dosis

### ✅ Notificaciones
- [x] Lista de notificaciones
- [x] Marcar como leída
- [x] Contador no leídas
- [x] Tipos de notificaciones

### ✅ Analytics
- [x] Estadísticas de adherencia
- [x] Gráficos de progreso
- [x] Comparaciones mensuales
- [x] Insights personalizados

### ✅ Monitoreo
- [x] Estado del sistema
- [x] Sincronización frontend-backend
- [x] Health checks
- [x] Dashboard completo

## 🔗 Integración Backend

Se conecta perfectamente con el backend Django:

- **Autenticación**: `/api/auth/login/`, `/api/auth/register/`
- **Medicamentos**: `/api/medications/`
- **Horarios**: `/api/schedules/today/`
- **Notificaciones**: `/api/notifications/`  
- **Analytics**: `/api/analytics/stats/`
- **Monitoreo**: `/api/monitoring/dashboard/`

## 🎨 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas de la aplicación  
├── context/       # Context API (Auth, etc)
├── hooks/         # Hooks personalizados
├── services/      # Servicios de API
├── types/         # Definiciones TypeScript
├── utils/         # Utilidades y helpers
└── styles/        # Estilos globales
```

## 📊 Estado del Proyecto

**Frontend React**: 🟢 **100% Funcional**
- ✅ Todas las funcionalidades implementadas
- ✅ Integración completa con backend
- ✅ UI/UX responsiva y moderna
- ✅ TypeScript para type safety
- ✅ Manejo de errores robusto

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
