# HomeForge - Frontend

Aplicación web para HomeForge, una plataforma CRM completa para inmobiliarias, constructoras, desarrolladores y equipos comerciales de vivienda.

## 🎯 Características Principales

- **CRM Visual**: Pipeline Kanban drag & drop, scoring de leads, timeline de actividades
- **Gestión de Propiedades**: Catálogo completo con imágenes, mapas, filtros avanzados
- **Automatización**: Tareas automáticas, asignación inteligente, seguimiento
- **Documentos**: Generación de contratos, plantillas personalizables, firma electrónica
- **Notificaciones**: Sistema completo multicanal con plantillas y programación
- **Calendario**: Vista mensual, gestión de citas, disponibilidad de agentes
- **Dashboard**: Métricas en tiempo real, gráficos interactivos
- **Multi-idioma**: Soporte para Español e Inglés
- **Responsive**: Optimizado para desktop y móvil

## 🚀 Tecnologías

- **Framework**: React
- **Lenguaje**: TypeScript
- **Build**: Vite
- **Routing**: React Router
- **HTTP Client**: Fetch API
- **Internacionalización**: i18next
- **Testing**: Vitest
- **Styling**: Tailwind CSS 4
- **Package manager**: Bun

## 📋 Requisitos

- Bun 1.3.13 o superior ([Instalar Bun](https://bun.sh/docs/installation))
- Backend de HomeForge corriendo en http://localhost:8080

## 🔧 Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio-frontend>
cd HomeForge-frontend
```

### 2. Instalar dependencias

```bash
bun install --frozen-lockfile
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` según tus necesidades:

```bash
# URL del backend API
VITE_API_BASE=http://localhost:8080/api
```

## 🚀 Iniciar el Proyecto

### Modo Desarrollo

```bash
bun run dev
```

La aplicación estará disponible en: **http://localhost:5174**

### Build para Producción

```bash
bun run build
```

Los archivos compilados estarán en: `dist/`

### Preview del Build

```bash
bun run preview
```

## 📡 Conexión con el Backend

El frontend se conecta al backend mediante la Fetch API.

**URL configurada**: se lee de `VITE_API_BASE`; si no se define, se detecta el host actual y se usa el puerto 8080.

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
bun run test --run
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
│   ├── app/             # Providers, protección y rutas
│   ├── layout/          # Layout privado
│   ├── modules/         # Dominios funcionales
│   │   ├── auth/
│   │   ├── properties/
│   │   ├── leads/
│   │   ├── appointments/
│   │   ├── documents/
│   │   ├── notifications/
│   │   ├── users/
│   │   ├── reports/
│   │   └── settings/
│   ├── shared/          # UI, servicios y utilidades transversales
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

La configuración de traducciones está en `src/shared/i18n/`.

### Cambiar idioma

El idioma se puede cambiar desde la interfaz de usuario o configurando el locale en el navegador.

## 🎨 Estilos

El proyecto usa **Tailwind CSS 4** y tokens CSS semánticos para los temas light, dark y obsidian.

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
bun install --frozen-lockfile

# Modo desarrollo
bun run dev

# Build
bun run build

# Preview
bun run preview

# Tests
bun run test --run

# Limpiar node_modules y reinstalar
rm -rf node_modules
bun install --frozen-lockfile
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
VITE_API_BASE=http://api.midominio.com/api
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
2. Configura la variable de entorno: `VITE_API_BASE`
3. Build command: `bun run build`
4. Output directory: `dist`

### Manual

```bash
# Build
bun run build

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
VITE_API_BASE=http://localhost:8080/api

# .env.production (para producción)
VITE_API_BASE=https://api.midominio.com/api
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
2. Revisa la variable `VITE_API_BASE` en `.env`
3. Verifica CORS en el backend

### `bun install` falla

```bash
# Limpiar caché y reinstalar
bun pm cache rm
rm -rf node_modules
bun install --frozen-lockfile
```

### Puerto ya en uso

Cambia el puerto en `vite.config.ts` o usa:

```bash
bun run dev -- --port 5175
```

### TypeScript errors

```bash
# Verificar tipos
bunx tsc --noEmit
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
