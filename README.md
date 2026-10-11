# HomeForge - Frontend

Aplicación web de HomeForge, el CRM para inmobiliarias: panel privado para el equipo (prospectos, propiedades, citas,
contratos, reportes, configuración) y sitio público con el catálogo de propiedades.

**Tecnologías:** React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4, Vitest y Bun. Mapas con Leaflet y gráficas con
Recharts. Las llamadas a la API usan `fetch` (sin axios). La interfaz está en español.

## Desarrollo local

Requisitos: [Bun](https://bun.sh/docs/installation) 1.3.13+ y el backend corriendo en http://localhost:8080
(ver el README de `home-forge-backend`).

```bash
bun install --frozen-lockfile
bun run dev            # http://localhost:5174
```

No hace falta `.env`: si `VITE_API_BASE` no está definida, la app usa el mismo host en el puerto 8080
(así también funciona al abrirla desde otra computadora de la red). Para otro backend, copia `.env.example` a `.env`
y define `VITE_API_BASE`.

```bash
bun run test --run     # pruebas (Vitest)
bun run build          # tipos (tsc) + build de producción en dist/
bun run preview        # sirve el build localmente
```

## Estructura

```
src/
├── app/            # Providers, rutas (router/AppRouter.tsx) y protección de rutas
├── layout/         # Layout privado (menú lateral, encabezado)
├── modules/        # Un módulo por área de negocio
│   ├── auth/           # Registro, login, recuperar contraseña, sesión
│   ├── properties/     # Propiedades (panel) y sitio público: catálogo, detalle, "Me interesa", compartir, me gusta
│   ├── leads/          # Prospectos, pipeline, seguimientos, coincidencias, asignación automática
│   ├── appointments/   # Calendario, citas y disponibilidad de asesores
│   ├── documents/      # Documentos, plantillas de contrato y contratos con firmas
│   ├── notifications/  # Mensajes y plantillas para prospectos
│   ├── companies/      # Perfil público de la inmobiliaria
│   ├── users/          # Usuarios y equipos
│   ├── reports/, dashboard/, payments/
│   └── settings/       # Empresa, horario de atención, Mi cuenta, planes (Stripe), catálogos
├── shared/         # Componentes de UI, cliente de la API, validaciones y utilidades comunes
└── test/           # Pruebas de Vitest
```

Cada módulo se organiza en `pages/`, `components/` y `api/` (funciones que llaman al backend), según lo que necesite,
y exporta lo que usan otros módulos desde su `index.ts`.

## Conexión con el backend

- Todas las llamadas pasan por `src/shared/services/api.ts` (`getJson`, `postJson`, etc.), que agrega el token de la
  sesión (`Authorization: Bearer`). Si el backend responde 401 con un token, cierra la sesión y lleva a `/login?expired=1`.
- La sesión (usuario, empresa, plan y token JWT de 8 horas) se guarda en `localStorage` (`homeforge_session`).
- Los errores del backend llegan como `{"error": "..."}` y las funciones de `api.ts` los lanzan como `Error` con ese mensaje.
- **Lista completa de endpoints:** con el backend en local, abre http://localhost:8080/swagger-ui.html.

## Producción con Docker

El `Dockerfile` compila la app y la sirve con nginx (`nginx/default.conf.template`):

- La app llama a la API en el **mismo dominio** (`/api`), así que no hace falta CORS. nginx reenvía `/api/` y `/uploads/`
  al backend indicado en `BACKEND_URL` (por defecto `http://backend:8080`).
- Cualquier ruta de la app (`/propiedades/...`, `/app/...`) devuelve `index.html`, sin caché. `/assets/` lleva caché de un año
  porque los nombres incluyen un hash.
- Añade cabeceras de seguridad básicas.
- **Vista previa al compartir:** cuando WhatsApp, Facebook, Telegram, etc. piden `/propiedades/{id}`, nginx les responde
  con el HTML Open Graph del backend (`/api/share/propiedades/{id}`: título, precio y foto). Las personas reciben la app normal.
  Por eso conviene publicar el frontend con esta imagen: en un hosting estático (Vercel, Netlify) habría que replicar esa regla.

```bash
docker build -t homeforge-frontend .
docker run -p 8081:80 -e BACKEND_URL=http://<host-del-backend>:8080 homeforge-frontend
```

Para servir la API en otro dominio, compila con `--build-arg VITE_API_BASE=https://api.tudominio.com/api`.
La pila completa (Postgres, backend y frontend) se levanta con `compose.yml` del repositorio del backend.

En GitHub, cada PR y cada push a `main` corren las pruebas, el build y la imagen Docker (`.github/workflows/ci.yml`).

## 🎨 Estilos

El proyecto usa **Tailwind CSS 4** y tokens CSS semánticos para los temas light, dark y obsidian.

### Reglas del sistema de diseño

- **Colores solo por token**, nunca por paleta: `bg-app`, `bg-surface`, `bg-surface-muted`,
  `text-fg`, `text-fg-muted`, `text-fg-subtle`, `border-border`, y los roles
  `primary | accent | success | warning | danger | info` con sus variantes
  (`bg-primary`, `bg-primary-soft`, `text-primary-fg`, `border-primary-line`...).
  Los tokens se definen en `src/index.css`; cada tema solo cambia variables, así que no
  hacen falta clases `dark:` ni overrides por tema.
- **Componentes de `src/shared/ui`** para todo control estándar: `Button` (o `buttonClasses()`
  para `<Link>`), `Input`, `Select`, `Textarea`, `SearchInput`, `Checkbox`, `Switch`,
  `SegmentedControl`, `Modal` (con `footer`), `Card`/`CardWithHeader`, `PageHeader`, `Tabs`,
  `Badge`, `Alert`, `StatCard`, `EmptyState`, `LoadingState`/`Skeleton`, `Table`, `Menu`, `Avatar`.
- **Confirmaciones** con `ConfirmModal` y avisos con `toast`; no usar `alert()`/`confirm()`.
- Cada página empieza con `PageHeader`; el layout privado ya aporta el fondo y el padding.
- Excepción intencional: el sidebar y los paneles de marca (login, hero público) son siempre
  oscuros y usan colores fijos de Tailwind.


## Solución de problemas

- **La app no carga datos:** revisa que el backend responda en http://localhost:8080/actuator/health.
- **"Tu sesión expiró":** el token dura 8 horas, o cambiaste la contraseña en otro dispositivo; vuelve a iniciar sesión.
- **Puerto 5174 ocupado:** ya hay otro `bun run dev` corriendo (úsalo), o arranca con `bun run dev -- --port 5175`.
- **`bun install` falla:** `bun pm cache rm`, borra `node_modules` y vuelve a instalar.

## Licencia

Proyecto privado. Todos los derechos reservados.
