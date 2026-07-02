# 🔘 Estado de Migración de Botones

## Objetivo
Estandarizar todos los botones de la aplicación para usar el componente reutilizable `<Button />` en lugar de botones HTML con clases directas.

## ✅ Páginas Completadas

### 1. DashboardPage.tsx
- [x] Botón "Ver reportes" → `<Button variant="secondary">`
- [x] Botón "+ Nueva propiedad" → `<Button variant="primary">`
- [x] Botón "Ver todos los seguimientos" → `<Button variant="danger" fullWidth>`
- [x] Botones "Ver leads" y "Ver agenda" → `<Button variant="success">`

### 2. PropertiesPage.tsx
- [x] Botón "Crear rápida" → `<Button variant="secondary" icon={...}>`
- [x] Botón "Crear completa" → `<Button variant="primary" icon={...}>`
- [x] Botón bloqueado "Agregar propiedad" → `<Button variant="tertiary" disabled>`

### 3. QuickPropertyModal.tsx
- [x] Botón "Cancelar" → `<Button variant="tertiary">`
- [x] Botón "Crear y continuar" → `<Button variant="primary" loading={saving}>`

## 📋 Páginas Pendientes (Prioridad Alta)

### 4. AgendaPage.tsx
**Botones a migrar:**
- [ ] Botón "+ Nueva Cita" (línea 267)
```tsx
// Antes:
className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg..."

// Después:
<Button variant="primary" icon={...}>+ Nueva Cita</Button>
```

### 5. NotificationsPage.tsx
**Botones a migrar:**
- [ ] Botón "+ Nueva Notificación"
- [ ] Botones de acción en cada notificación
- [ ] Botones del modal de confirmación

### 6. DocumentsPage.tsx
**Botones a migrar:**
- [ ] Botón "+ Subir documento"
- [ ] Botones "Vista previa", "Descargar", "Eliminar"
- [ ] Exportar a Excel

### 7. ReportsPage.tsx
**Botones a migrar:**
- [ ] Botones "Exportar a Excel"
- [ ] Botones de filtros de periodo

## 📋 Modales Pendientes (Prioridad Media)

### 8. NewNotificationModal.tsx
- [ ] Botones "Cancelar" y "Enviar"
- [ ] Toggle de modo masivo
- [ ] Botones de selección de plantilla

### 9. NewAppointmentModal.tsx
- [ ] Botones "Cancelar" y "Guardar cita"
- [ ] Botones de selección de prospecto
- [ ] Botones de fecha/hora

### 10. UploadDocumentModal.tsx
- [ ] Botones "Cancelar" y "Subir"
- [ ] Botón de selección de archivo

### 11. AppointmentModal.tsx
- [ ] Botones "Cerrar", "Editar", "Eliminar"
- [ ] Botones de acciones rápidas

### 12. CreateLeadModal.tsx
- [ ] Botones "Cancelar" y "Crear prospecto"
- [ ] Botones de selección de origen

### 13. DocumentPreviewModal.tsx
- [ ] Botones "Cerrar", "Descargar"
- [ ] Botones de navegación

## 📋 Páginas Secundarias (Prioridad Baja)

### 14. LeadsPipelinePage.tsx
- [ ] Botones "+ Nuevo prospecto"
- [ ] Botones de las tarjetas de leads
- [ ] Botones de cambio de estado

### 15. SettingsPage.tsx
- [ ] Botones "Guardar configuración"
- [ ] Botones de secciones

### 16. TemplatesPage.tsx / MessageTemplatesPage.tsx
- [ ] Botones "+ Nueva plantilla"
- [ ] Botones "Editar", "Eliminar"

### 17. ContractsPage.tsx
- [ ] Botones de gestión de contratos

### 18. PlansPage.tsx
- [ ] Botones "Seleccionar plan"
- [ ] Botones de upgrade

## 🎯 Patrón de Migración Estándar

### Variantes de Botón

```tsx
// PRIMARIO - Acción principal (crear, guardar, enviar)
<Button variant="primary">Crear</Button>

// SECUNDARIO - Acción secundaria (ver reportes, exportar)
<Button variant="secondary">Ver reportes</Button>

// TERCIARIO - Acción cancelar o neutral
<Button variant="tertiary">Cancelar</Button>

// PELIGRO - Acciones destructivas (eliminar, rechazar)
<Button variant="danger">Eliminar</Button>

// ÉXITO - Acciones positivas confirmadas
<Button variant="success">Aprobar</Button>
```

### Props Comunes

```tsx
// Con icono
<Button variant="primary" icon={<IconComponent />}>
  Texto
</Button>

// Con loading
<Button variant="primary" loading={isLoading}>
  Guardar
</Button>

// Ancho completo
<Button variant="primary" fullWidth>
  Enviar formulario
</Button>

// Deshabilitado
<Button variant="tertiary" disabled>
  No disponible
</Button>

// Tamaños
<Button variant="primary" size="sm">Pequeño</Button>
<Button variant="primary" size="md">Mediano</Button>
<Button variant="primary" size="lg">Grande</Button>
```

## 📊 Estadísticas

| Estado | Cantidad | Porcentaje |
|--------|----------|-----------|
| ✅ Completadas | 3 | 16% |
| 🔄 En progreso | 0 | 0% |
| ⏳ Pendientes | 15 | 84% |
| **Total** | **18** | **100%** |

## 🎨 Beneficios de la Migración

1. **Consistencia Visual**: Todos los botones se ven iguales
2. **Menos Código**: ~60% menos código por botón
3. **Mantenibilidad**: Cambiar estilos en un solo lugar
4. **Accesibilidad**: Estados de focus, disabled automáticos
5. **TypeScript**: Tipado fuerte de props

## 📝 Checklist por Página

Cuando migres una página, verifica:
- [ ] Importar `Button` desde `@/shared/ui`
- [ ] Reemplazar todos los `<button>` y `<Link>` con botones
- [ ] Elegir la variante correcta (primary, secondary, tertiary, danger, success)
- [ ] Mantener los iconos si los había
- [ ] Mantener estados loading si aplica
- [ ] Probar visualmente que todo funcione
- [ ] Eliminar imports y código no usado

## 🚀 Próximos Pasos

1. **Fase 1** (Hoy): Completar páginas principales (Dashboard, Properties, Agenda, Notifications, Documents, Reports)
2. **Fase 2** (Mañana): Completar modales principales
3. **Fase 3** (Siguiente semana): Completar páginas secundarias

---

**Última actualización**: 2026-07-02  
**Completadas**: 3/18 (16%)  
**Tiempo estimado restante**: 4-6 horas
