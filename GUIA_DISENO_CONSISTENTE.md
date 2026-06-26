# 🎨 Guía de Diseño Consistente - HomeForge

## 📋 Componentes UI Creados

### 1. PageHeader
**Ubicación:** `src/shared/ui/PageHeader.tsx`

**Uso:**
```tsx
<PageHeader
  title="Título de la Página"
  subtitle="Descripción breve"
  backLink={{ to: '/app/ruta', label: 'Volver' }}
  badge={{ value: 25, label: 'items' }}
  actions={<Button>Acción</Button>}
>
  {/* Contenido adicional como tabs */}
</PageHeader>
```

**Características:**
- ✅ Botón "Volver" estilizado
- ✅ Título responsive (xl en mobile, 2xl en desktop)
- ✅ Subtítulo opcional
- ✅ Badge con contador
- ✅ Sticky header
- ✅ Separador visual entre volver y título

### 2. InfoBanner
**Ubicación:** `src/shared/ui/InfoBanner.tsx`

**Uso:**
```tsx
<InfoBanner
  title="Mensaje principal"
  description="Descripción adicional"
  variant="info | warning | success | danger"
/>
```

**Variantes:**
- `info` (azul) - Información general
- `warning` (amarillo) - Advertencias
- `success` (verde) - Éxitos
- `danger` (rojo) - Errores/peligros

### 3. Tabs
**Ubicación:** `src/shared/ui/Tabs.tsx`

**Uso:**
```tsx
<Tabs
  tabs={[
    { id: '1', label: 'Tab 1', count: 5 },
    { id: '2', label: 'Tab 2', count: 3 }
  ]}
  activeTab={active}
  onChange={setActive}
  variant="cards | pills | underline | default"
  size="sm | md | lg"
/>
```

**Variantes:**
- `default` - Línea inferior simple
- `pills` - Píldoras redondeadas
- `underline` - Subrayado minimalista
- `cards` - **Recomendado** - Tarjetas con bordes

## 🔄 Cómo Migrar Páginas al Nuevo Diseño

### Antes (Diseño Antiguo):
```tsx
export function MiPagina() {
  return (
    <>
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">
            Sección
          </p>
          <h1 className="mt-1 text-3xl font-bold">Mi Página</h1>
          <p className="mt-2 text-sm text-slate-500">Descripción</p>
        </div>
        <ExportButton onExport={handleExport} />
      </header>
      {/* Contenido */}
    </>
  );
}
```

### Después (Diseño Nuevo):
```tsx
import { PageHeader } from '../shared/ui/PageHeader';

export function MiPagina() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Mi Página"
        subtitle="Descripción de la página"
        backLink={{ to: '/app', label: 'Volver' }}
        badge={{ value: items.length, label: 'items' }}
        actions={<ExportButton onExport={handleExport} />}
      />

      <div className="p-4 lg:p-6">
        {/* Contenido */}
      </div>
    </div>
  );
}
```

## 📄 Páginas a Actualizar

### Prioridad ALTA (Con botón volver):
- [x] LeadsPipelinePage.tsx ✅
- [ ] LeadDetailPage.tsx
- [ ] PropertyDetailPage.tsx (si existe)
- [ ] CatalogPage.tsx

### Prioridad MEDIA (Sin botón volver):
- [ ] AgendaPage.tsx
- [ ] DocumentsPage.tsx
- [ ] PropertiesPage.tsx
- [ ] LeadsPage.tsx
- [ ] ReportsPage.tsx

### Prioridad BAJA:
- [ ] DashboardPage.tsx (tiene su propio diseño)
- [ ] SettingsPage.tsx
- [ ] UsersPage.tsx

## 🎯 Checklist por Página

Para cada página, aplicar:

1. **Import PageHeader**
   ```tsx
   import { PageHeader } from '../shared/ui/PageHeader';
   ```

2. **Wrapper principal**
   ```tsx
   <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
   ```

3. **Header con volver** (si aplica)
   ```tsx
   <PageHeader
     title="..."
     subtitle="..."
     backLink={{ to: '...', label: 'Volver' }}
   />
   ```

4. **Padding consistente**
   ```tsx
   <div className="p-4 lg:p-6">
   ```

5. **InfoBanner** para instrucciones
   ```tsx
   <InfoBanner title="..." description="..." variant="info" />
   ```

## 🎨 Paleta de Colores

### Backgrounds:
- **Página**: `bg-gradient-to-br from-slate-50 to-slate-100`
- **Cards**: `bg-white`
- **Headers**: `bg-white shadow-sm`
- **Hover**: `hover:bg-slate-50`

### Texto:
- **Títulos**: `text-slate-900 font-bold`
- **Subtítulos**: `text-slate-500 text-sm`
- **Badges**: `text-indigo-600`

### Bordes:
- **Normal**: `border-slate-200`
- **Activo**: `border-indigo-500`
- **Hover**: `hover:border-slate-300`

## 📱 Responsividad

### Breakpoints:
- Mobile: `base` (default)
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)
- Large: `xl:` (1280px)

### Patrones comunes:
```tsx
// Padding responsive
className="p-4 lg:p-6"

// Texto responsive
className="text-xl lg:text-2xl"

// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## ✨ Mejoras Aplicadas

### ✅ Pipeline de Ventas
- PageHeader con botón volver estilizado
- Tabs tipo "cards"
- InfoBanner para instrucciones
- Padding consistente
- Background degradado

### 🔲 Pendientes
- Aplicar a resto de páginas
- Crear más componentes UI (Button, Input, Select, Table)
- Agregar dark mode
- Storybook para documentar componentes

## 🚀 Próximos Pasos

1. Actualizar una página a la vez
2. Probar en mobile y desktop
3. Documentar componentes nuevos
4. Crear variantes según necesidad
5. Mantener consistencia visual
