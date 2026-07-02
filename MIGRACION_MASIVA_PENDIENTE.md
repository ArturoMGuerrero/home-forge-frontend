# 🔄 Migración Masiva de Botones - Pendiente

## 📊 Estado Actual

### ✅ Páginas Migradas (8/36 = 22%)

1. ✅ DashboardPage.tsx
2. ✅ PropertiesPage.tsx
3. ✅ LeadsPage.tsx
4. ✅ AgendaPage.tsx
5. ✅ NotificationsPage.tsx
6. ✅ DocumentsPage.tsx
7. ✅ CalendarPage.tsx ← **RECIÉN MIGRADO**
8. ✅ QuickPropertyModal.tsx

### ⏳ Páginas Pendientes con Botones (28 páginas)

#### Prioridad ALTA - Páginas Principales (10 páginas)

1. **AgentAvailabilityPage.tsx** (2 botones)
   - Línea 91: `bg-gradient-to-r from-indigo-600 to-purple-600` ✓ (correcto)
   - Línea 187: `bg-blue-600` ❌ (debe ser gradiente)

2. **FollowUpTasksPage.tsx** (4+ botones)
   - Líneas 99, 109, 119, 137: `bg-indigo-600` ❌ (deben ser gradiente)

3. **LeadDetailPage.tsx** (varios botones)
   - Línea 296: `bg-indigo-600 px-5 py-3` ❌ (debe ser gradiente y px-4 py-2.5)

4. **MatchesPage.tsx**
   - Línea 239: `bg-indigo-600 px-4 py-3.5` ❌ (debe ser gradiente y px-4 py-2.5)

5. **MessageTemplatesPage.tsx** (2+ botones)
   - Líneas 62, 149: `bg-indigo-600 rounded-lg` ❌ (debe ser gradiente y rounded-xl)

6. **NewPropertyPage.tsx** (1+ botones)
   - Línea 563: `bg-indigo-600` ❌ (debe ser gradiente)

7. **ReportsPage.tsx**
   - Línea 286: `bg-indigo-600` ❌ (debe ser gradiente)

8. **TemplateEditorPage.tsx**
   - Línea 304: `bg-indigo-600 rounded-lg` ❌ (debe ser gradiente y rounded-xl)

9. **TemplatesPage.tsx** (2+ botones)
   - Líneas 63, 124: `bg-indigo-600 rounded-lg` ❌ (debe ser gradiente y rounded-xl)

10. **ContractsPage.tsx**
    - Línea 85: `bg-indigo-600 rounded-lg` ❌ (debe ser gradiente y rounded-xl)

#### Prioridad MEDIA - Páginas de Configuración (3 páginas)

11. **CompanyProfileSettingsPage.tsx**
    - Línea 140: `bg-indigo-600` ❌ (debe ser gradiente)

12. **SettingsPage.tsx**
    - Revisar todos los botones

13. **UsersPage.tsx**
    - Revisar todos los botones

#### Prioridad BAJA - Páginas Públicas/Auth (6 páginas)

14. **LoginPage.tsx**
    - Línea 83: `bg-indigo-600` ❌

15. **RegisterPage.tsx**
    - Línea 121: `bg-indigo-600` ❌

16. **ForgotPasswordPage.tsx** (2 botones)
    - Líneas 148, 173: `bg-indigo-600` ❌

17. **ResetPasswordPage.tsx**
    - Línea 143: `bg-indigo-600` ❌

18. **PaymentSuccessPage.tsx**
    - Línea 77: `bg-indigo-600` ❌

19. **PaymentPendingPage.tsx**
    - Línea 38: `bg-indigo-600` ❌

20. **PaymentFailurePage.tsx**
    - Línea 42: `bg-indigo-600` ❌

#### Prioridad BAJA - Otras Páginas (9 páginas)

21. **PublicPropertiesPage.tsx**
22. **PublicPropertyDetailPage.tsx**
23. **PublicCompanyPage.tsx**
24. **CatalogPage.tsx**
25. **LeadsPipelinePage.tsx**
26. **LeadsPipelinePage.kanban.tsx**
27. **PlansPage.tsx**
28. **UsersManagementPage.tsx**
29. **AgendaPage.old.tsx** (archivo antiguo - ignorar)

## 🎯 Problemas Comunes Encontrados

### 1. Color Azul Sólido (bg-blue-600)
```tsx
// ❌ ANTES
className="bg-blue-600 text-white rounded-lg"

// ✅ DESPUÉS
<Button variant="primary">Texto</Button>
```

### 2. Indigo Sólido (bg-indigo-600)
```tsx
// ❌ ANTES
className="bg-indigo-600 text-white hover:bg-indigo-700"

// ✅ DESPUÉS
<Button variant="primary">Texto</Button>
```

### 3. rounded-lg en lugar de rounded-xl
```tsx
// ❌ ANTES
className="rounded-lg bg-indigo-600"

// ✅ DESPUÉS
<Button variant="primary">Texto</Button>
// (automáticamente usa rounded-xl)
```

### 4. Padding Inconsistente
```tsx
// ❌ ANTES
className="px-5 py-3"  // o "px-3.5 py-3" o "px-4 py-3.5"

// ✅ DESPUÉS
<Button variant="primary">Texto</Button>
// (automáticamente usa px-4 py-2.5)
```

## 🔧 Proceso de Migración

### Paso 1: Importar Button
```tsx
import { Button } from '../shared/ui';
```

### Paso 2: Identificar Patrón
```tsx
// Buscar:
className=".*bg-blue-600|bg-indigo-600.*rounded.*"
```

### Paso 3: Reemplazar
```tsx
// DE:
<button className="bg-blue-600 text-white rounded-lg px-4 py-2">
  Texto
</button>

// A:
<Button variant="primary">
  Texto
</Button>
```

### Paso 4: Mantener Estados
```tsx
// DE:
<button disabled={saving} className="bg-indigo-600...">
  {saving ? 'Guardando...' : 'Guardar'}
</button>

// A:
<Button variant="primary" loading={saving}>
  Guardar
</Button>
```

## 📈 Plan de Acción

### Fase 1: Páginas Principales (HOY)
- [ ] AgentAvailabilityPage
- [ ] FollowUpTasksPage
- [ ] LeadDetailPage
- [ ] MatchesPage
- [ ] MessageTemplatesPage
- [ ] NewPropertyPage
- [ ] ReportsPage
- [ ] TemplateEditorPage
- [ ] TemplatesPage
- [ ] ContractsPage

**Estimado**: 2-3 horas

### Fase 2: Configuración (MAÑANA)
- [ ] CompanyProfileSettingsPage
- [ ] SettingsPage
- [ ] UsersPage

**Estimado**: 1 hora

### Fase 3: Auth y Pagos (CUANDO SEA NECESARIO)
- [ ] LoginPage
- [ ] RegisterPage
- [ ] ForgotPasswordPage
- [ ] ResetPasswordPage
- [ ] PaymentSuccessPage
- [ ] PaymentPendingPage
- [ ] PaymentFailurePage

**Estimado**: 1.5 horas

### Fase 4: Páginas Públicas (CUANDO SEA NECESARIO)
- [ ] Resto de páginas públicas

**Estimado**: 1 hora

## 🎯 Objetivo Final

**Tener el 100% de los botones estandarizados** con:
- ✅ `rounded-xl` (NO `rounded-lg`)
- ✅ `px-4 py-2.5` (tamaño md estándar)
- ✅ Gradiente `from-indigo-600 to-purple-600` (NO `bg-blue-600` o `bg-indigo-600`)
- ✅ `gap-2` entre icono y texto
- ✅ `shadow-lg hover:shadow-xl`
- ✅ `disabled:opacity-50`

## 📊 Métricas

### Actual
- **Migradas**: 8/36 páginas (22%)
- **Pendientes**: 28 páginas (78%)
- **Botones con bug-blue-600**: ~15
- **Botones con bg-indigo-600**: ~40
- **Botones con rounded-lg**: ~25

### Objetivo
- **Migradas**: 36/36 páginas (100%)
- **Consistencia**: 100%
- **Tiempo total estimado**: 5-6 horas

---

**Creado**: 2026-07-02  
**Última actualización**: CalendarPage migrado  
**Próximo**: AgentAvailabilityPage
