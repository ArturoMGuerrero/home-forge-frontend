# Guía de Migración a Componentes UI Reutilizables

Esta guía te ayudará a migrar componentes existentes para usar el nuevo sistema de componentes UI reutilizables.

## 🎯 Beneficios de la migración

- **Menos código**: Reduce ~70% del código de UI repetitivo
- **Consistencia**: Mismo look & feel en toda la aplicación
- **Mantenibilidad**: Cambios centralizados en lugar de buscar en 50 archivos
- **Tipado fuerte**: TypeScript te ayuda a no cometer errores
- **Accesibilidad**: Ya incluida en los componentes

## 📋 Checklist de migración

Para cada componente que migres:

- [ ] Importar componentes UI desde `@/shared/ui`
- [ ] Reemplazar inputs nativos con `<Input />`
- [ ] Reemplazar selects nativos con `<Select />`
- [ ] Reemplazar textareas nativos con `<Textarea />`
- [ ] Reemplazar botones custom con `<Button />`
- [ ] Reemplazar divs de tarjeta con `<Card />`
- [ ] Reemplazar alerts custom con `<Alert />`
- [ ] Usar `<Badge />` para etiquetas
- [ ] Usar `<Spinner />` para estados de carga
- [ ] Usar `<EmptyState />` para estados vacíos

## 🔄 Patrones de migración comunes

### 1. Input con label

**❌ Antes:**
```tsx
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Nombre *
  </label>
  <input
    type="text"
    required
    value={name}
    onChange={e => setName(e.target.value)}
    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
    placeholder="Ingresa el nombre"
  />
</div>
```

**✅ Después:**
```tsx
<Input
  label="Nombre"
  required
  value={name}
  onChange={e => setName(e.target.value)}
  placeholder="Ingresa el nombre"
/>
```

**Ahorro:** 8 líneas → 6 líneas (25% menos código)

---

### 2. Select con opciones

**❌ Antes:**
```tsx
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Tipo de propiedad *
  </label>
  <select
    required
    value={type}
    onChange={e => setType(e.target.value)}
    className="w-full px-3.5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
  >
    <option value="HOUSE">Casa</option>
    <option value="APARTMENT">Apartamento</option>
    <option value="LAND">Terreno</option>
  </select>
</div>
```

**✅ Después:**
```tsx
<Select
  label="Tipo de propiedad"
  required
  value={type}
  onChange={e => setType(e.target.value)}
  options={[
    { value: 'HOUSE', label: 'Casa' },
    { value: 'APARTMENT', label: 'Apartamento' },
    { value: 'LAND', label: 'Terreno' }
  ]}
/>
```

**Ahorro:** 13 líneas → 10 líneas (23% menos código)

---

### 3. Botones de acción

**❌ Antes:**
```tsx
<div className="flex gap-3">
  <button
    type="button"
    onClick={onCancel}
    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
  >
    Cancelar
  </button>
  <button
    type="submit"
    disabled={saving}
    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50"
  >
    {saving ? 'Guardando...' : 'Guardar'}
  </button>
</div>
```

**✅ Después:**
```tsx
<div className="flex gap-3">
  <Button
    type="button"
    onClick={onCancel}
    variant="tertiary"
    className="flex-1"
  >
    Cancelar
  </Button>
  <Button
    type="submit"
    variant="primary"
    loading={saving}
    className="flex-1"
  >
    Guardar
  </Button>
</div>
```

**Ahorro:** 16 líneas → 14 líneas (12% menos código) + lógica de loading incluida

---

### 4. Tarjetas (Cards)

**❌ Antes:**
```tsx
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
  <h3 className="text-lg font-bold text-slate-900 mb-4">Título</h3>
  <p className="text-slate-600">Contenido de la tarjeta</p>
</div>
```

**✅ Después:**
```tsx
<Card>
  <h3 className="text-lg font-bold text-slate-900 mb-4">Título</h3>
  <p className="text-slate-600">Contenido de la tarjeta</p>
</Card>
```

O mejor aún, con header incluido:

```tsx
<CardWithHeader title="Título">
  <p className="text-slate-600">Contenido de la tarjeta</p>
</CardWithHeader>
```

---

### 5. Alertas informativas

**❌ Antes:**
```tsx
<div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4">
  <div className="flex items-start gap-3">
    <svg className="size-5 text-indigo-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <p className="text-sm font-semibold text-indigo-900">Título</p>
      <p className="text-xs text-indigo-700 mt-1">
        Mensaje informativo aquí
      </p>
    </div>
  </div>
</div>
```

**✅ Después:**
```tsx
<Alert variant="info" title="Título">
  Mensaje informativo aquí
</Alert>
```

**Ahorro:** 12 líneas → 3 líneas (75% menos código!)

---

### 6. Estados de carga

**❌ Antes:**
```tsx
{loading && (
  <div className="flex items-center justify-center py-16">
    <svg className="animate-spin size-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <p className="ml-3 text-sm text-slate-500">Cargando...</p>
  </div>
)}
```

**✅ Después:**
```tsx
{loading && <LoadingState message="Cargando..." />}
```

**Ahorro:** 9 líneas → 1 línea (89% menos código!)

---

### 7. Estados vacíos

**❌ Antes:**
```tsx
{items.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="rounded-full bg-slate-100 p-6 mb-4">
      <svg className="size-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-slate-700 mb-2">No hay resultados</h3>
    <p className="text-sm text-slate-500 mb-6">No se encontraron elementos</p>
    <button
      onClick={onCreate}
      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
    >
      Crear nuevo
    </button>
  </div>
)}
```

**✅ Después:**
```tsx
{items.length === 0 && (
  <EmptyState
    title="No hay resultados"
    description="No se encontraron elementos"
    actionLabel="Crear nuevo"
    onAction={onCreate}
  />
)}
```

**Ahorro:** 18 líneas → 7 líneas (61% menos código!)

---

### 8. Badges de estado

**❌ Antes:**
```tsx
<span className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
  Activo
</span>
```

**✅ Después:**
```tsx
<Badge variant="success">Activo</Badge>
```

---

## 🚀 Proceso de migración paso a paso

1. **Identifica el componente a migrar**
   - Busca archivos con mucho código de UI repetitivo
   - Prioriza modales y formularios

2. **Importa los componentes necesarios**
   ```tsx
   import { Button, Input, Select, Card, Modal, Alert } from '@/shared/ui';
   ```

3. **Reemplaza de arriba hacia abajo**
   - Empieza por los inputs y selects
   - Luego los botones
   - Finalmente las tarjetas y alerts

4. **Verifica el tipado**
   - TypeScript te dirá si falta alguna prop requerida
   - Revisa las interfaces en los archivos de componentes

5. **Prueba visualmente**
   - Abre el componente en el navegador
   - Verifica que todo se vea igual o mejor
   - Confirma que las interacciones funcionen

6. **Limpia el código**
   - Elimina imports no usados
   - Elimina className personalizados si ya no son necesarios

## 📊 Estadísticas de reducción de código

Basado en la migración de `QuickPropertyModal.tsx`:

| Elemento | Antes | Después | Reducción |
|----------|-------|---------|-----------|
| Inputs | ~10 líneas/input | ~6 líneas/input | 40% |
| Selects | ~13 líneas/select | ~10 líneas/select | 23% |
| Botones | ~8 líneas/button | ~6 líneas/button | 25% |
| Alerts | ~12 líneas | ~3 líneas | 75% |
| **Total modal** | **251 líneas** | **~180 líneas** | **~28%** |

## 🎨 Customización

Si necesitas customizar un componente:

```tsx
// Los componentes aceptan className para extender estilos
<Button
  variant="primary"
  className="shadow-2xl hover:scale-105"
>
  Click me
</Button>

// Puedes combinar con la utilidad cn() para estilos condicionales
import { cn } from '@/shared/styles/utils';

<Input
  className={cn(
    'mb-4',
    isHighlighted && 'ring-2 ring-yellow-400'
  )}
/>
```

## 📝 Componentes pendientes de migrar

Archivos prioritarios para migrar (con más código repetitivo):

1. ✅ `QuickPropertyModal.tsx` - **MIGRADO**
2. ⏳ `NewNotificationModal.tsx`
3. ⏳ `NewAppointmentModal.tsx`
4. ⏳ `UploadDocumentModal.tsx`
5. ⏳ `CreateLeadModal.tsx`
6. ⏳ `AppointmentModal.tsx`
7. ⏳ `DocumentPreviewModal.tsx`
8. ⏳ Páginas: `PropertiesPage`, `AgendaPage`, `NotificationsPage`, etc.

## 🆘 Soporte

Si encuentras un caso que no está cubierto por los componentes actuales:

1. Revisa el [README de componentes UI](src/shared/ui/README.md)
2. Verifica si puedes extender un componente existente con `className`
3. Si realmente necesitas algo nuevo, crea un issue o propón un nuevo componente reutilizable

## ✅ Checklist final antes de hacer commit

- [ ] El componente se ve igual o mejor que antes
- [ ] Todas las funcionalidades siguen funcionando
- [ ] TypeScript no muestra errores
- [ ] Se eliminó código duplicado
- [ ] Las props están correctamente tipadas
- [ ] Los estados de loading/error/success funcionan correctamente
