# HomeForge - Frontend

Aplicación web para HomeForge, un CRM para constructoras, desarrolladores inmobiliarios y equipos comerciales de vivienda.

## 🚀 Tecnologías

- **Framework**: React 18
- **Lenguaje**: TypeScript
- **Build**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios
- **Internacionalización**: i18next
- **Testing**: Vitest
- **Styling**: CSS Modules

## 📋 Requisitos

- Node.js 20 o superior ([Descargar Node.js](https://nodejs.org/))
- npm (incluido con Node.js)
- Backend de HomeForge corriendo en http://localhost:8080

## 🔧 Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio-frontend>
cd HomeForge-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` según tus necesidades:

```bash
# URL del backend API
VITE_API_URL=http://localhost:8080
```

## 🚀 Iniciar el Proyecto

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5174**

### Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en: `dist/`

### Preview del Build

```bash
npm run preview
```

## 📡 Conexión con el Backend

El frontend se conecta al backend mediante Axios.

**URL configurada**: Se lee de la variable de entorno `VITE_API_URL` (default: http://localhost:8080)

### Endpoints utilizados:

- `GET /api/properties` - Listar propiedades
- `POST /api/properties` - Crear propiedad
- `GET /api/leads` - Listar prospectos
- `POST /api/leads` - Crear prospecto
- `GET /api/users` - Usuarios
- Ver más en el código fuente

## 🧪 Tests

```bash
# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Cobertura
npm run test:coverage
```

## 📁 Estructura del Proyecto

```
HomeForge-frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Charts.tsx              # Gráficos y visualizaciones
│   │   ├── ImageLightbox.tsx       # Visor de imágenes
│   │   ├── LocationPicker.tsx      # Selector de ubicación
│   │   ├── PropertyComparator.tsx  # Comparador de propiedades
│   │   ├── PropertyFilters.tsx     # Filtros de propiedades
│   │   └── PropertyMap.tsx         # Mapa de propiedades
│   ├── layout/          # Layouts (PrivateLayout, etc.)
│   ├── modules/         # Módulos de negocio
│   │   ├── leads/       # Gestión de prospectos
│   │   ├── properties/  # Gestión de propiedades
│   │   └── settings/    # Configuración
│   ├── pages/           # Páginas/Vistas
│   │   ├── AgendaPage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── LeadDetailPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MatchesPage.tsx
│   │   ├── NewPropertyPage.tsx
│   │   ├── PaymentFailurePage.tsx
│   │   ├── PaymentPendingPage.tsx
│   │   ├── PaymentSuccessPage.tsx
│   │   ├── PlansPage.tsx
│   │   ├── PropertiesPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── UsersPage.tsx
│   ├── shared/          # Componentes y utilidades compartidas
│   │   ├── ConfirmModal.tsx
│   │   ├── SubscriptionBadge.tsx
│   │   ├── SubscriptionBanner.tsx
│   │   ├── UpgradeModal.tsx
│   │   ├── dashboardApi.ts
│   │   ├── leads.ts
│   │   ├── operationsApi.ts
│   │   ├── paymentApi.ts
│   │   ├── subscriptionApi.ts
│   │   ├── subscriptionRestrictions.ts
│   │   ├── useSubscriptionRestrictions.ts
│   │   └── services/
│   │       └── api.ts   # Cliente HTTP (Axios)
│   ├── contexts/        # React Contexts
│   ├── hooks/           # Custom Hooks
│   ├── types/           # TypeScript Types
│   ├── i18n/            # Traducciones (ES/EN)
│   ├── utils/           # Utilidades
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Punto de entrada
├── .env.example         # Variables de entorno de ejemplo
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🌍 Internacionalización

El proyecto soporta múltiples idiomas:

- **Español** (es)
- **Inglés** (en)

Los archivos de traducción están en: `src/i18n/locales/`

### Cambiar idioma

El idioma se puede cambiar desde la interfaz de usuario o configurando el locale en el navegador.

## 🎨 Estilos

El proyecto usa **CSS Modules** para estilos con scope local.

Cada componente tiene su propio archivo de estilos:
```
Component.tsx
Component.module.css
```

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Tests
npm test

# Linter
npm run lint

# Formatear código
npm run format

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🔧 Configuración Avanzada

### Cambiar puerto

Edita `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 5175  // Cambiar aquí
  }
})
```

### Cambiar URL del backend

Edita `.env`:

```bash
VITE_API_URL=http://api.midominio.com
```

### Proxy API (desarrollo)

Si tienes problemas con CORS, puedes configurar un proxy en `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

## 🔐 Autenticación

El frontend incluye:

- Formulario de registro
- Formulario de login
- Gestión de sesión (localStorage)
- Rutas protegidas
- Redirección automática

## 📦 Dependencias Principales

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "i18next": "^23.x",
  "react-i18next": "^13.x",
  "recharts": "^2.x",
  "leaflet": "^1.x",
  "react-leaflet": "^4.x"
}
```

## 🚀 Despliegue

### Vercel / Netlify

1. Conecta tu repositorio
2. Configura la variable de entorno: `VITE_API_URL`
3. Build command: `npm run build`
4. Output directory: `dist`

### Manual

```bash
# Build
npm run build

# Subir carpeta dist/ a tu servidor
scp -r dist/* usuario@servidor:/ruta/
```

### Nginx

Configuración ejemplo:

```nginx
server {
    listen 80;
    server_name midominio.com;
    root /ruta/a/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📱 Funcionalidades

- ✅ Autenticación (registro/login/recuperar contraseña)
- ✅ Dashboard principal con métricas y gráficos
- ✅ Gestión de propiedades
  - Crear, editar, eliminar
  - Carga de imágenes con lightbox
  - Filtros avanzados y búsqueda
  - Mapa de ubicación interactivo
  - Comparador de propiedades
  - Selector de ubicación con geocodificación
- ✅ CRM de prospectos completo
  - Lista de leads con scoring
  - Pipeline de ventas Kanban (drag & drop)
  - Detalle de prospecto
  - Actividades extendidas en timeline
  - Crear y eliminar actividades
  - Scoring automático de leads (0-100 puntos)
  - Asignación automática con reglas personalizables
- ✅ Automatización de seguimiento
  - Tareas automáticas por cambio de estado
  - Recordatorios y vencimientos
  - Priorización de tareas
- ✅ Documentos y contratos
  - Plantillas reutilizables con variables
  - Generación de contratos personalizados
  - Firma electrónica
  - Gestión de estados (Borrador → Firma → Completado)
  - Versionado de plantillas y documentos
- ✅ Notificaciones y comunicación
  - Notificaciones por Email, WhatsApp, Push, SMS
  - Plantillas de mensajes reutilizables
  - Variables dinámicas en mensajes
  - Filtros por estado y tipo
  - Programación de envíos
  - Seguimiento de entregas (Pendiente → Enviado → Entregado → Leído)
- ✅ Sistema de suscripciones
  - Planes Free, Plus y Professional
  - Integración con pasarela de pagos
  - Gestión de cobros recurrentes
  - Restricciones por plan
  - Páginas de confirmación de pago
- ✅ Calendario y citas
  - Vista mensual interactiva
  - Creación de citas con modal
  - Tipos de cita (tour, reunión, llamada, videollamada, firma)
  - Ubicaciones (presencial, virtual, teléfono, en propiedad)
  - Recordatorios configurables
  - Gestión de disponibilidad de agentes
  - Horarios por día de la semana
  - Filtros por rango de fechas, usuario, lead, estado
- ✅ Gestión de archivos adjuntos
- ✅ Catálogo de propiedades
- ✅ Matching de propiedades con prospectos
- ✅ Reportes y análisis
- ✅ Perfil de empresa
- ✅ Gestión de usuarios
- ✅ Configuración de usuario
- ✅ Multi-idioma (ES/EN)

## 🤝 Backend

Este frontend está diseñado para trabajar con el backend de HomeForge:

- Repositorio Backend: `HomeForge-backend`
- URL esperada: http://localhost:8080
- Debe estar configurado con CORS para permitir: http://localhost:5174

## 🔄 Variables de Entorno

```bash
# .env
VITE_API_URL=http://localhost:8080

# .env.production (para producción)
VITE_API_URL=https://api.midominio.com
```

Las variables **DEBEN** empezar con `VITE_` para ser expuestas al frontend.

## 📊 Performance

- **Vite** proporciona Hot Module Replacement (HMR) ultra-rápido
- **Code splitting** automático por rutas
- **Lazy loading** de componentes pesados
- **Optimización** de assets en build

## 🐛 Debugging

### React DevTools

Instala la extensión de navegador: [React Developer Tools](https://react.dev/learn/react-developer-tools)

### Network Inspector

Revisa las llamadas HTTP en las DevTools del navegador (tab Network).

### Logs

El proyecto usa `console.log` para debugging. En producción, estos se eliminan automáticamente.

## 🆘 Solución de Problemas

### "Cannot connect to backend"

1. Verifica que el backend esté corriendo: http://localhost:8080/actuator/health
2. Revisa la variable `VITE_API_URL` en `.env`
3. Verifica CORS en el backend

### "npm install" falla

```bash
# Limpiar caché
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Puerto ya en uso

Cambia el puerto en `vite.config.ts` o usa:

```bash
npm run dev -- --port 5175
```

### TypeScript errors

```bash
# Verificar tipos
npx tsc --noEmit
```

## 📝 Licencia

Proyecto privado - Todos los derechos reservados

## 🆘 Soporte

Para problemas o preguntas:

1. Revisa la documentación
2. Verifica la consola del navegador
3. Revisa las DevTools (Network tab)

---

**Desarrollado con ⚛️ y React**
