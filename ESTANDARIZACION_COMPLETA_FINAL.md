# 🎨 Estandarización Completa del Diseño - Plan Final

## 🎯 Objetivo

Estandarizar **TODO** el diseño de la aplicación para que sea **100% consistente**:
- ✅ Botones
- ✅ Inputs  
- ✅ Selects
- ✅ Textareas
- ✅ Modales
- ✅ Checkboxes
- ✅ Radio buttons
- ✅ Cards
- ✅ Badges
- ✅ Alerts

## 📊 Estado Actual

### ✅ Páginas Completamente Migradas (9/36)

1. ✅ DashboardPage - Botones + Componentes
2. ✅ PropertiesPage - Botones + Componentes
3. ✅ LeadsPage - Botones + Componentes
4. ✅ AgendaPage - Botones + Componentes
5. ✅ NotificationsPage - Botones + Componentes
6. ✅ DocumentsPage - Botones + Componentes
7. ✅ CalendarPage - Botones migrados
8. ✅ AgentAvailabilityPage - **RECIÉN COMPLETADO** (Botones + Inputs + Select)
9. ✅ QuickPropertyModal - Botones + Inputs + Select

### 📊 Elementos Pendientes de Migrar

**Según análisis**:
- ⏳ **3 botones** con `bg-blue-600` (azul incorrecto)
- ⏳ **27 botones** con `bg-indigo-600` sólido (sin gradiente)
- ⏳ **10 inputs** con `rounded-lg` (debe ser `rounded-xl`)
- ⏳ **~15 modales** sin componente Modal estandarizado
- ⏳ **~20 formularios** con inputs/selects sin componentizar

## 🎨 Estándares Definidos

### 1. Botones

```tsx
// ✅ CORRECTO
<Button variant="primary">Crear</Button>
<Button variant="secondary">Ver reportes</Button>
<Button variant="tertiary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
<Button variant="success">Aprobar</Button>

// ❌ INCORRECTO
<button className="bg-blue-600 rounded-lg px-4 py-2">...</button>
<button className="bg-indigo-600 rounded-lg px-4 py-2">...</button>
```

**Estilos estándar**:
- Border radius: `rounded-xl` (NO `rounded-lg`)
- Padding: `px-4 py-2.5` (tamaño md)
- Primary: Gradiente `from-indigo-600 to-purple-600`
- Sombras: `shadow-lg hover:shadow-xl`

### 2. Inputs

```tsx
// ✅ CORRECTO
<Input
  label="Nombre"
  placeholder="Ingresa tu nombre"
  error="Campo requerido"
  helperText="Texto de ayuda"
/>

// ❌ INCORRECTO
<input className="rounded-lg border border-gray-300 px-3 py-2" />
```

**Estilos estándar**:
- Border radius: `rounded-xl` (NO `rounded-lg`)
- Padding: `px-3.5 py-3`
- Border: `border-slate-200`
- Focus: `focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`

### 3. Selects

```tsx
// ✅ CORRECTO
<Select
  label="Tipo"
  options={[
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' }
  ]}
/>

// ❌ INCORRECTO
<select className="rounded-lg border border-gray-300">...</select>
```

### 4. Modales

```tsx
// ✅ CORRECTO
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título"
  subtitle="Subtítulo"
  maxWidth="lg"
>
  Contenido
</Modal>

// ❌ INCORRECTO
<div className="fixed inset-0 bg-black/50">...</div>
```

### 5. Cards

```tsx
// ✅ CORRECTO
<Card>Contenido</Card>
<CardWithHeader title="Título">Contenido</CardWithHeader>

// ❌ INCORRECTO
<div className="bg-white rounded-lg border p-6">...</div>
```

## 📋 Páginas Pendientes de Migración Completa (27 páginas)

### Prioridad ALTA - Páginas Principales (10)

1. **FollowUpTasksPage.tsx**
   - [ ] 4+ botones con `bg-indigo-600`
   - [ ] Filtros/tabs a estandarizar

2. **LeadDetailPage.tsx**
   - [ ] Formulario completo con inputs
   - [ ] Botones de acción
   - [ ] Badge de estados

3. **MatchesPage.tsx**
   - [ ] Botón principal
   - [ ] Formulario de matching

4. **MessageTemplatesPage.tsx**
   - [ ] 2+ botones `rounded-lg` → `rounded-xl`
   - [ ] Inputs del formulario

5. **NewPropertyPage.tsx**
   - [ ] Formulario ENORME con muchos inputs
   - [ ] Botón submit
   - [ ] Selects de catálogos

6. **ReportsPage.tsx**
   - [ ] Botones de exportar
   - [ ] Filtros de fecha

7. **TemplateEditorPage.tsx**
   - [ ] Botones `rounded-lg`
   - [ ] Editor de contenido

8. **TemplatesPage.tsx**
   - [ ] 2+ botones
   - [ ] Lista de templates

9. **ContractsPage.tsx**
   - [ ] Botones
   - [ ] Filtros

10. **LeadsPipelinePage.tsx**
    - [ ] Botones de las tarjetas
    - [ ] Modales de edición

### Prioridad MEDIA - Configuración (3)

11. **CompanyProfileSettingsPage.tsx**
    - [ ] Formulario de perfil
    - [ ] Botón guardar

12. **SettingsPage.tsx**
    - [ ] Enlaces/botones de configuración

13. **UsersPage.tsx**
    - [ ] Formulario de usuarios
    - [ ] Botones de gestión

### Prioridad BAJA - Auth (7)

14. **LoginPage.tsx**
15. **RegisterPage.tsx**
16. **ForgotPasswordPage.tsx**
17. **ResetPasswordPage.tsx**
18. **PaymentSuccessPage.tsx**
19. **PaymentPendingPage.tsx**
20. **PaymentFailurePage.tsx**

### Prioridad BAJA - Otros (7)

21. **PublicPropertiesPage.tsx**
22. **PublicPropertyDetailPage.tsx**
23. **PublicCompanyPage.tsx**
24. **CatalogPage.tsx**
25. **LeadsPipelinePage.kanban.tsx**
26. **PlansPage.tsx**
27. **UsersManagementPage.tsx**

## 🔧 Componentes a Migrar en Modales

### Modales Principales (src/components/)

1. **NewAppointmentModal.tsx**
   - [ ] Inputs → `<Input />`
   - [ ] Selects → `<Select />`
   - [ ] Botones → `<Button />`

2. **NewNotificationModal.tsx**
   - [ ] Formulario completo
   - [ ] Toggle/switches
   - [ ] Textarea

3. **UploadDocumentModal.tsx**
   - [ ] File input
   - [ ] Select de tipo
   - [ ] Botones

4. **CreateLeadModal.tsx**
   - [ ] Formulario de lead
   - [ ] Inputs de contacto
   - [ ] Botones

5. **AppointmentModal.tsx**
   - [ ] Vista de detalle
   - [ ] Botones de acción

6. **DocumentPreviewModal.tsx**
   - [ ] Botones de descarga

## 📝 Plan de Ejecución

### Fase 1: Páginas Principales (AHORA)
**Tiempo estimado**: 3-4 horas

- [x] AgentAvailabilityPage ✅
- [ ] FollowUpTasksPage
- [ ] LeadDetailPage
- [ ] MessageTemplatesPage
- [ ] NewPropertyPage (el más grande)
- [ ] ReportsPage
- [ ] TemplateEditorPage
- [ ] TemplatesPage
- [ ] ContractsPage
- [ ] LeadsPipelinePage

### Fase 2: Modales Principales (DESPUÉS)
**Tiempo estimado**: 2 horas

- [ ] NewAppointmentModal
- [ ] NewNotificationModal
- [ ] UploadDocumentModal
- [ ] CreateLeadModal
- [ ] AppointmentModal

### Fase 3: Configuración (DESPUÉS)
**Tiempo estimado**: 1 hora

- [ ] CompanyProfileSettingsPage
- [ ] SettingsPage
- [ ] UsersPage

### Fase 4: Auth y Resto (CUANDO SEA NECESARIO)
**Tiempo estimado**: 2 horas

- [ ] Páginas de auth
- [ ] Páginas públicas
- [ ] Páginas de pagos

## ✅ Checklist por Componente

Al migrar cada página, verificar:

### Botones
- [ ] Todos usan `<Button />` component
- [ ] Todos usan `rounded-xl`
- [ ] Primary usa gradiente `indigo→purple`
- [ ] Padding consistente `px-4 py-2.5`

### Inputs
- [ ] Todos usan `<Input />` component
- [ ] Todos usan `rounded-xl`
- [ ] Padding `px-3.5 py-3`
- [ ] Focus ring indigo

### Selects
- [ ] Todos usan `<Select />` component
- [ ] Mismo estilo que inputs
- [ ] Options array cuando sea posible

### Modales
- [ ] Usan `<Modal />` component
- [ ] Backdrop blur
- [ ] Close con ESC
- [ ] Título y subtítulo

### Forms
- [ ] Labels consistentes
- [ ] Mensajes de error estándar
- [ ] Helper text cuando corresponda
- [ ] Required indicator `*`

## 📊 Métricas Objetivo

### Antes (Estado Actual)
- ✅ Migradas: 9/36 páginas (25%)
- ⏳ Pendientes: 27/36 páginas (75%)
- 🔴 Botones inconsistentes: ~30
- 🔴 Inputs inconsistentes: ~10
- 🔴 Modales custom: ~15

### Después (Objetivo Final)
- ✅ Migradas: 36/36 páginas (100%)
- ✅ Consistencia visual: 100%
- ✅ Todos los botones: `rounded-xl` + gradiente
- ✅ Todos los inputs: `rounded-xl` + focus indigo
- ✅ Todos los modales: Componente estandarizado

## 🎯 Resultado Final Esperado

Al completar la migración:

1. **Consistencia Visual Total**
   - Mismo border-radius en todos lados (`rounded-xl`)
   - Mismo gradiente en botones primarios
   - Mismo padding en todos los elementos
   - Mismos colores de focus

2. **Menos Código**
   - ~60% menos código por botón
   - ~40% menos código por input
   - ~70% menos código por modal

3. **Más Mantenible**
   - Cambiar estilos en un solo lugar
   - Componentes reutilizables
   - TypeScript ayuda a no equivocarse

4. **Mejor UX**
   - Experiencia consistente
   - Accesibilidad mejorada
   - Estados claros (loading, disabled, error)

---

**Creado**: 2026-07-02  
**Última actualización**: AgentAvailabilityPage completado  
**Progreso**: 9/36 páginas (25%)  
**Tiempo estimado restante**: 6-8 horas
