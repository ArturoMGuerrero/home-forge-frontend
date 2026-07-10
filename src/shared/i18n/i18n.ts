import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const resources = {
  en: { translation: {
    dashboard: 'Dashboard',
    leads: 'Leads',
    properties: 'Properties',
    catalogs: 'Catalogs',
    plans: 'Plans',
    language: 'Language',
    workspace: 'Workspace',
    welcome: 'Your commercial operation, at a glance',
    welcomeSubtitle: 'Track prospects, inventory, catalogs and growth from one place.',
    summary: 'Business summary',
    activeLeads: 'Active leads',
    availableProperties: 'Available properties',
    estimatedSales: 'Estimated sales',
    thisMonth: 'this month',
    reserved: 'reserved',
    recentLeads: 'Recent leads',
    newLead: 'New lead',
    crm: 'Sales pipeline',
    demoMode: 'Showing sample data while the API is offline.',
    demoData: 'Demo data',
    noLeads: 'No leads yet.',
    noEmail: 'No email',
    inventory: 'Inventory',
    featuredProperties: 'Featured properties',
    viewAll: 'View all',
    subscription: 'Subscription',
    configuration: 'Configuration',
    catalogNames: {
      'lead-sources': 'Lead sources',
      'property-types': 'Property types',
      'document-types': 'Documents',
      'mortgage-types': 'Financing'
    },
    status: { NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified' },
    propertyStatus: { AVAILABLE: 'Available', RESERVED: 'Reserved' },
    propertyForm: {
      photos: 'Property photos',
      photosDescription: 'Up to 12 images JPG, PNG or WebP. Maximum 8 MB each.',
      photosCounter: '{{count}}/12',
      dragPhotos: 'Drag photos here or click to select',
      dragPhotosEdit: 'Drag photos or click to select',
      dropPhotosHere: 'Drop images here',
      formatInfo: 'JPG, PNG or WebP • Maximum 8MB per image',
      savedPhotos: 'Saved photos ({{count}})',
      newPhotos: 'New photos ({{count}})',
      coverBadge: 'Cover',
      newBadge: 'New',
      setCover: 'Set as cover',
      remove: 'Remove',
      uploading: 'Uploading {{count}} photo...',
      uploading_other: 'Uploading {{count}} photos...',
      saving: 'Saving property...',
      saveChanges: 'Save changes',
      saveProperty: 'Save property',
      errorFormats: 'Only JPG, PNG or WebP images are allowed.',
      errorSize: 'Each image must be maximum 8 MB.',
      errorLimit: 'Each property can have maximum 12 photos.',
      removePhoto: 'Remove photo'
    },
    export: {
      button: 'Export to Excel',
      fileName: 'export',
      exporting: 'Exporting...'
    },
    agenda: {
      title: 'Agenda',
      subtitle: 'Manage your appointments and tours',
      newAppointment: 'New appointment',
      today: 'Today',
      noAppointments: 'No appointments for today',
      noAppointmentsHint: 'Click "New appointment" to add one',
      deleteConfirm: 'Delete this appointment?',
      deleteMessage: 'This action cannot be undone.',
      delete: 'Delete',
      cancel: 'Cancel',
      markComplete: 'Mark as completed',
      appointmentDeleted: 'Appointment deleted',
      appointmentCompleted: 'Appointment marked as completed',
      appointmentCreated: 'Appointment added to agenda',
      modal: {
        title: 'New appointment',
        subtitle: 'Add an appointment to your agenda',
        titleField: 'Title',
        type: 'Type',
        status: 'Status',
        start: 'Start',
        end: 'End (optional)',
        lead: 'Lead (optional)',
        property: 'Property (optional)',
        location: 'Location (optional)',
        notes: 'Notes (optional)',
        searchLead: 'Search lead...',
        searchProperty: 'Search property...',
        noLink: 'No link',
        saving: 'Saving...',
        addAppointment: 'Add appointment'
      },
      types: {
        TOUR: 'Tour',
        CALL: 'Call',
        MEETING: 'Meeting',
        FOLLOW_UP: 'Follow-up',
        OTHER: 'Other'
      },
      statuses: {
        SCHEDULED: 'Scheduled',
        COMPLETED: 'Completed',
        CANCELED: 'Canceled'
      },
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    accountSettings: {
      title: 'Account Settings',
      subtitle: 'Manage your account settings and preferences',
      tabs: {
        profile: 'Profile',
        security: 'Security',
        appearance: 'Appearance'
      },
      profile: {
        title: 'Profile Information',
        subtitle: 'Update your personal information and profile picture',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        changeAvatar: 'Change Avatar',
        avatarHint: 'JPG, PNG or GIF. Max size 2MB.',
        cancel: 'Cancel',
        saveChanges: 'Save Changes'
      },
      security: {
        title: 'Password Management',
        subtitle: 'Keep your account secure by updating your password regularly. Use a combination of letters, numbers and symbols.',
        features: {
          minChars: 'Minimum 8 characters',
          encryption: 'End-to-end encryption',
          verification: 'Advanced security verification'
        },
        changePassword: 'Change password',
        changePasswordSubtitle: 'Update your password to keep your account secure.',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm new password',
        currentPasswordPlaceholder: 'Enter your current password',
        newPasswordPlaceholder: 'Minimum 8 characters',
        confirmPasswordPlaceholder: 'Repeat your new password',
        cancel: 'Cancel',
        updatePassword: 'Update password',
        infoMessage: 'After changing your password, you will need to sign in again with your new credentials.',
        passwordMismatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordUpdated: 'Password updated successfully'
      },
      appearance: {
        title: 'Theme Mode',
        subtitle: 'Customize the look and feel of your interface',
        themes: {
          light: { name: 'Light', description: 'Bright & clear' },
          dark: { name: 'Dark', description: 'Easy on eyes' },
          obsidian: { name: 'Obsidian', description: 'Deep black' }
        },
        infoMessage: 'Your theme preference will be saved and applied across all pages. Changes take effect immediately.'
      }
    }
  } },
  es: { translation: {
    dashboard: 'Panel',
    leads: 'Prospectos',
    properties: 'Propiedades',
    catalogs: 'Catálogos',
    plans: 'Planes',
    language: 'Idioma',
    workspace: 'Espacio de trabajo',
    welcome: 'Tu operación comercial, de un vistazo',
    welcomeSubtitle: 'Controla prospectos, inventario, catálogos y crecimiento desde un solo lugar.',
    summary: 'Resumen del negocio',
    activeLeads: 'Prospectos activos',
    availableProperties: 'Propiedades disponibles',
    estimatedSales: 'Ventas estimadas',
    thisMonth: 'este mes',
    reserved: 'reservadas',
    recentLeads: 'Prospectos recientes',
    newLead: 'Nuevo prospecto',
    crm: 'Pipeline comercial',
    demoMode: 'Mostrando datos de ejemplo mientras la API está apagada.',
    demoData: 'Datos demo',
    noLeads: 'Aún no hay prospectos.',
    noEmail: 'Sin correo',
    inventory: 'Inventario',
    featuredProperties: 'Propiedades destacadas',
    viewAll: 'Ver todas',
    subscription: 'Suscripción',
    configuration: 'Configuración',
    catalogNames: {
      'lead-sources': 'Origen de prospectos',
      'property-types': 'Tipos de propiedad',
      'document-types': 'Documentos',
      'mortgage-types': 'Financiamiento'
    },
    status: { NEW: 'Nuevo', CONTACTED: 'Contactado', QUALIFIED: 'Calificado' },
    propertyStatus: { AVAILABLE: 'Disponible', RESERVED: 'Reservada' },
    propertyForm: {
      photos: 'Fotos de la propiedad',
      photosDescription: 'Hasta 12 imágenes JPG, PNG o WebP. Máximo 8 MB cada una.',
      photosCounter: '{{count}}/12',
      dragPhotos: 'Arrastra fotos aquí o haz clic para seleccionar',
      dragPhotosEdit: 'Arrastra fotos o haz clic para seleccionar',
      dropPhotosHere: 'Suelta las imágenes aquí',
      formatInfo: 'JPG, PNG o WebP • Máximo 8MB por imagen',
      savedPhotos: 'Fotos guardadas ({{count}})',
      newPhotos: 'Nuevas fotos ({{count}})',
      coverBadge: 'Portada',
      newBadge: 'Nueva',
      setCover: 'Portada',
      remove: 'Eliminar',
      uploading: 'Subiendo {{count}} foto...',
      uploading_other: 'Subiendo {{count}} fotos...',
      saving: 'Guardando propiedad...',
      saveChanges: 'Guardar cambios',
      saveProperty: 'Guardar propiedad',
      errorFormats: 'Solo se permiten imágenes JPG, PNG o WebP.',
      errorSize: 'Cada imagen debe pesar máximo 8 MB.',
      errorLimit: 'Cada propiedad puede tener máximo 12 fotos.',
      removePhoto: 'Quitar foto'
    },
    export: {
      button: 'Exportar a Excel',
      fileName: 'exportacion',
      exporting: 'Exportando...'
    },
    agenda: {
      title: 'Agenda',
      subtitle: 'Gestiona tus citas y recorridos',
      newAppointment: 'Nueva cita',
      today: 'Hoy',
      noAppointments: 'No hay citas para hoy',
      noAppointmentsHint: 'Haz clic en "Nueva cita" para agregar una',
      deleteConfirm: '¿Eliminar esta cita?',
      deleteMessage: 'Esta acción no se puede deshacer.',
      delete: 'Eliminar',
      cancel: 'Cancelar',
      markComplete: 'Marcar realizada',
      appointmentDeleted: 'Cita eliminada',
      appointmentCompleted: 'Cita marcada como realizada',
      appointmentCreated: 'Cita agregada a la agenda',
      modal: {
        title: 'Nueva cita',
        subtitle: 'Agrega una cita a tu agenda',
        titleField: 'Título',
        type: 'Tipo',
        status: 'Estado',
        start: 'Inicio',
        end: 'Fin (opcional)',
        lead: 'Prospecto (opcional)',
        property: 'Propiedad (opcional)',
        location: 'Lugar (opcional)',
        notes: 'Notas (opcional)',
        searchLead: 'Buscar prospecto...',
        searchProperty: 'Buscar propiedad...',
        noLink: 'Sin vincular',
        saving: 'Guardando...',
        addAppointment: 'Agregar cita'
      },
      types: {
        TOUR: 'Recorrido',
        CALL: 'Llamada',
        MEETING: 'Reunión',
        FOLLOW_UP: 'Seguimiento',
        OTHER: 'Otro'
      },
      statuses: {
        SCHEDULED: 'Programada',
        COMPLETED: 'Realizada',
        CANCELED: 'Cancelada'
      },
      weekDays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    },
    accountSettings: {
      title: 'Configuración de Cuenta',
      subtitle: 'Gestiona la configuración y preferencias de tu cuenta',
      tabs: {
        profile: 'Perfil',
        security: 'Seguridad',
        appearance: 'Apariencia'
      },
      profile: {
        title: 'Información de Perfil',
        subtitle: 'Actualiza tu información personal y foto de perfil',
        firstName: 'Nombre',
        lastName: 'Apellido',
        email: 'Correo Electrónico',
        changeAvatar: 'Cambiar Avatar',
        avatarHint: 'JPG, PNG o GIF. Tamaño máximo 2MB.',
        cancel: 'Cancelar',
        saveChanges: 'Guardar Cambios'
      },
      security: {
        title: 'Gestión de Contraseña',
        subtitle: 'Mantén tu cuenta segura actualizando tu contraseña regularmente. Usa una combinación de letras, números y símbolos.',
        features: {
          minChars: 'Mínimo 8 caracteres',
          encryption: 'Encriptación de extremo a extremo',
          verification: 'Verificación de seguridad avanzada'
        },
        changePassword: 'Cambiar contraseña',
        changePasswordSubtitle: 'Actualiza tu contraseña para mantener tu cuenta segura.',
        currentPassword: 'Contraseña actual',
        newPassword: 'Nueva contraseña',
        confirmPassword: 'Confirmar nueva contraseña',
        currentPasswordPlaceholder: 'Ingresa tu contraseña actual',
        newPasswordPlaceholder: 'Mínimo 8 caracteres',
        confirmPasswordPlaceholder: 'Repite tu nueva contraseña',
        cancel: 'Cancelar',
        updatePassword: 'Actualizar contraseña',
        infoMessage: 'Después de cambiar tu contraseña, deberás iniciar sesión nuevamente con tus nuevas credenciales.',
        passwordMismatch: 'Las contraseñas no coinciden',
        passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
        passwordUpdated: 'Contraseña actualizada correctamente'
      },
      appearance: {
        title: 'Modo de Tema',
        subtitle: 'Personaliza el aspecto de tu interfaz',
        themes: {
          light: { name: 'Claro', description: 'Brillante y limpio' },
          dark: { name: 'Oscuro', description: 'Suave para la vista' },
          obsidian: { name: 'Obsidiana', description: 'Negro profundo' }
        },
        infoMessage: 'Tu preferencia de tema se guardará y aplicará en todas las páginas. Los cambios surten efecto inmediatamente.'
      }
    }
  } }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;
