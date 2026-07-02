# Sistema de Componentes UI Reutilizables

Esta carpeta contiene todos los componentes de UI base que puedes usar en toda la aplicación. Todos siguen el mismo patrón de diseño con gradientes modernos y bordes redondeados.

## 📦 Importación

Puedes importar los componentes desde el archivo índice:

```tsx
import { Button, Input, Card, Modal, Badge } from '@/shared/ui';
```

## 🎨 Componentes Disponibles

### Button

Botón con variantes y estados de carga.

```tsx
import { Button } from '@/shared/ui';

// Variantes
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="tertiary">Terciario</Button>
<Button variant="danger">Peligro</Button>
<Button variant="success">Éxito</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>

// Con icono y loading
<Button icon={<Icon />}>Con Icono</Button>
<Button loading>Cargando...</Button>
<Button fullWidth>Ancho Completo</Button>
```

### Input

Campo de entrada con label, error y helper text.

```tsx
import { Input } from '@/shared/ui';

<Input
  label="Nombre"
  placeholder="Ingresa tu nombre"
  error="Campo requerido"
  helperText="Texto de ayuda"
  required
  icon={<IconUser />}
/>
```

### Textarea

Área de texto multilinea.

```tsx
import { Textarea } from '@/shared/ui';

<Textarea
  label="Descripción"
  rows={4}
  resize={false}
  error="Campo requerido"
/>
```

### Select

Menú desplegable.

```tsx
import { Select } from '@/shared/ui';

const options = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' },
];

<Select
  label="Selecciona"
  options={options}
  error="Campo requerido"
/>
```

### SearchInput

Input especializado para búsqueda con icono y botón de limpiar.

```tsx
import { SearchInput } from '@/shared/ui';

const [search, setSearch] = useState('');

<SearchInput
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onClear={() => setSearch('')}
  placeholder="Buscar..."
/>
```

### Card

Tarjeta contenedora con variante interactiva.

```tsx
import { Card, CardWithHeader } from '@/shared/ui';

// Card básica
<Card>
  Contenido
</Card>

// Card interactiva (hover effect)
<Card interactive onClick={handleClick}>
  Contenido clickeable
</Card>

// Card con header
<CardWithHeader
  title="Título"
  subtitle="Subtítulo"
  icon={<Icon />}
  actions={<Button>Acción</Button>}
>
  Contenido
</CardWithHeader>
```

### Modal

Modal con overlay, backdrop blur y cierre con ESC.

```tsx
import { Modal } from '@/shared/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título del Modal"
  subtitle="Subtítulo opcional"
  maxWidth="lg"
>
  Contenido del modal
</Modal>
```

### Badge

Etiquetas con diferentes variantes y tamaños.

```tsx
import { Badge, CounterBadge } from '@/shared/ui';

// Badge con variantes
<Badge variant="success">Activo</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Neutral</Badge>

// Badge con icono
<Badge variant="success" icon={<CheckIcon />}>
  Completado
</Badge>

// Badge contador
<CounterBadge count={42} label="notificaciones" max={99} />
```

### Alert

Alertas informativas con diferentes variantes.

```tsx
import { Alert } from '@/shared/ui';

<Alert variant="info" title="Información">
  Mensaje informativo
</Alert>

<Alert variant="success">
  Operación exitosa
</Alert>

<Alert variant="warning" onClose={() => {}}>
  Advertencia con botón de cerrar
</Alert>

<Alert variant="error" icon={<CustomIcon />}>
  Error con icono personalizado
</Alert>
```

### Spinner

Indicadores de carga.

```tsx
import { Spinner, LoadingOverlay, LoadingState } from '@/shared/ui';

// Spinner simple
<Spinner size="md" />

// Overlay de página completa
<LoadingOverlay message="Cargando datos..." />

// Estado de carga para secciones
<LoadingState message="Cargando..." size="lg" />
```

### EmptyState

Estado vacío con icono y acción opcional.

```tsx
import { EmptyState } from '@/shared/ui';

<EmptyState
  title="No hay resultados"
  description="No se encontraron elementos"
  actionLabel="Crear nuevo"
  onAction={handleCreate}
  icon={<CustomIcon />}
/>
```

### Tabs

Pestañas de navegación.

```tsx
import { Tabs, Tab } from '@/shared/ui';

const tabs: Tab[] = [
  { id: 'tab1', label: 'Tab 1', icon: <Icon />, count: 5 },
  { id: 'tab2', label: 'Tab 2' },
];

const [activeTab, setActiveTab] = useState('tab1');

<Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
```

### Tooltip

Tooltips al hacer hover.

```tsx
import { Tooltip } from '@/shared/ui';

<Tooltip content="Texto del tooltip" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

### Avatar

Avatares con iniciales o imagen, con indicador de estado.

```tsx
import { Avatar, AvatarGroup } from '@/shared/ui';

// Avatar simple
<Avatar name="Juan Pérez" size="md" />
<Avatar src="/avatar.jpg" name="Juan Pérez" />

// Con estado
<Avatar name="Juan Pérez" status="online" />

// Grupo de avatares
<AvatarGroup
  avatars={[
    { name: 'Juan Pérez', src: '/juan.jpg' },
    { name: 'María García' },
  ]}
  max={3}
  size="md"
/>
```

## 🎨 Estilos y Utilidades

### Gradientes

```tsx
import { gradients, shadows, animations } from '@/shared/styles/gradients';

// Usar en className
<div className={gradients.primary}>
  Contenido con gradiente
</div>

<div className={`${gradients.bgSoft} ${shadows.indigo}`}>
  Fondo suave con sombra
</div>
```

### Utilidad cn()

Combina clases de Tailwind de forma inteligente:

```tsx
import { cn } from '@/shared/styles/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  'p-4 hover:p-6' // Los conflictos se resuelven automáticamente
)}>
  Contenido
</div>
```

### Otras utilidades

```tsx
import { truncate, transitions, focus, scrollbar } from '@/shared/styles/utils';

<p className={truncate.lines2}>
  Texto truncado a 2 líneas
</p>

<button className={`${transitions.base} ${focus.ring}`}>
  Botón con transición y foco
</button>
```

## 🔄 Migración desde componentes antiguos

### Antes
```tsx
<button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl">
  Click
</button>
```

### Después
```tsx
<Button variant="primary">Click</Button>
```

### Antes
```tsx
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
  {/* contenido */}
</div>
```

### Después
```tsx
<Card>
  {/* contenido */}
</Card>
```

## 📝 Convenciones

1. **Todos los componentes exportan sus props como interfaces**
2. **Usan forwardRef cuando es necesario** (Input, Select, Textarea)
3. **Siguen el patrón de diseño consistente** (rounded-xl, gradientes, sombras)
4. **Son accesibles** (ARIA labels, keyboard navigation)
5. **Incluyen estados de hover, focus y disabled**

## 🚀 Beneficios

- ✅ **Consistencia visual** en toda la app
- ✅ **Menos código repetido**
- ✅ **Fácil mantenimiento**
- ✅ **Tipado completo con TypeScript**
- ✅ **Accesibilidad integrada**
- ✅ **Bundle más pequeño** (código compartido)
