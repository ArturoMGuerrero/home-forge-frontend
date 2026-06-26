# 🎨 Sistema de Componentes UI - HomeForge

## 📁 Estructura Propuesta

```
src/
├── shared/
│   ├── ui/                    # Componentes UI genéricos reutilizables
│   │   ├── Button.tsx        # ✅ Creado
│   │   ├── Tabs.tsx          # ✅ Creado  
│   │   ├── Select.tsx        # 🔲 Pendiente
│   │   ├── Input.tsx         # 🔲 Pendiente
│   │   ├── Table.tsx         # 🔲 Pendiente
│   │   ├── Modal.tsx         # 🔲 Pendiente
│   │   ├── Card.tsx          # 🔲 Pendiente
│   │   ├── Badge.tsx         # 🔲 Pendiente
│   │   ├── Dropdown.tsx      # 🔲 Pendiente
│   │   ├── Toast.tsx         # 🔲 Pendiente
│   │   └── Loader.tsx        # 🔲 Pendiente
│   └── ...
```

## 🎯 Componentes a Crear

### 1. Button (Prioridad: ALTA)
```tsx
<Button variant="primary | secondary | danger | ghost" size="sm | md | lg">
  Click me
</Button>
```

### 2. Input (Prioridad: ALTA)
```tsx
<Input
  label="Email"
  type="email"
  placeholder="tu@email.com"
  error="Campo requerido"
  icon={<MailIcon />}
/>
```

### 3. Select (Prioridad: ALTA)
```tsx
<Select
  label="País"
  options={countries}
  value={selected}
  onChange={setSelected}
  searchable
/>
```

### 4. Table (Prioridad: ALTA)
```tsx
<Table
  columns={[
    { header: 'Nombre', accessor: 'name', sortable: true },
    { header: 'Email', accessor: 'email' },
  ]}
  data={users}
  onRowClick={handleClick}
  loading={isLoading}
/>
```

### 5. Modal (Prioridad: MEDIA)
Ya existe ConfirmModal, UploadDocumentModal, etc.
Crear uno genérico base.

### 6. Card (Prioridad: MEDIA)
```tsx
<Card
  title="Título"
  subtitle="Subtítulo"
  actions={<Button>Acción</Button>}
>
  Contenido
</Card>
```

### 7. Badge (Prioridad: BAJA)
```tsx
<Badge variant="success | warning | danger | info">
  Nuevo
</Badge>
```

## 📊 Beneficios

### ✅ Consistencia
- Mismo diseño en toda la app
- Menos CSS duplicado
- Mantenimiento centralizado

### ✅ Productividad
- Menos código repetido
- Desarrollo más rápido
- Menos bugs

### ✅ Accesibilidad
- ARIA labels consistentes
- Navegación por teclado
- Mejores experiencias

### ✅ Temas
- Fácil cambio de colores
- Dark mode preparado
- Personalización por cliente

## 🔄 Refactorización Sugerida

### Fase 1: Core UI (Semana 1)
- [ ] Button
- [ ] Input
- [ ] Select
- [ ] Tabs (✅ Ya creado)

### Fase 2: Layouts (Semana 2)
- [ ] Table
- [ ] Card
- [ ] Modal base
- [ ] Badge

### Fase 3: Avanzados (Semana 3)
- [ ] Dropdown
- [ ] DatePicker
- [ ] FileUpload
- [ ] Pagination

## 📝 Organización de Carpetas

### Antes (Actual):
```
src/
├── components/          # Mix de todo
├── modules/            # Algo organizado
├── pages/              # Páginas
└── shared/             # Utilidades
```

### Después (Propuesto):
```
src/
├── components/
│   ├── appointments/   # Componentes de citas
│   ├── documents/      # Componentes de documentos
│   ├── leads/          # Componentes de leads
│   └── properties/     # Componentes de propiedades
├── shared/
│   ├── ui/            # Componentes UI genéricos
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utilidades
│   ├── services/      # APIs
│   └── types/         # TypeScript types
├── pages/             # Páginas
└── layout/            # Layouts
```

## 🎨 Sistema de Diseño

### Colores Principales
```ts
const colors = {
  primary: 'indigo',    // Acciones principales
  secondary: 'slate',   // Acciones secundarias
  success: 'green',     // Éxito
  warning: 'yellow',    // Advertencia
  danger: 'red',        // Peligro
  info: 'blue',         // Información
}
```

### Espaciado
```ts
const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
}
```

### Tamaños
```ts
const sizes = {
  sm: { px: '3', py: '1.5', text: 'xs' },
  md: { px: '4', py: '2', text: 'sm' },
  lg: { px: '6', py: '3', text: 'base' },
}
```

## 🚀 Siguiente Paso

1. Revisar este documento
2. Crear componentes básicos (Button, Input, Select)
3. Refactorizar páginas existentes para usar los nuevos componentes
4. Documentar cada componente con ejemplos
5. Crear Storybook (opcional)
