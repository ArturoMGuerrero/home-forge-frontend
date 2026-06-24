import { PaymentStatusResponse, SubscriptionStatus } from './paymentApi';

export type SubscriptionRestrictionLevel = 'NONE' | 'WARNING' | 'LIMITED' | 'BLOCKED';

export type SubscriptionRestrictions = {
  level: SubscriptionRestrictionLevel;
  canCreate: boolean;
  canEdit: boolean;
  canExport: boolean;
  canUploadMultiple: boolean;
  canInviteUsers: boolean;
  showBanner: boolean;
  bannerMessage: string;
  bannerType: 'warning' | 'error' | 'blocked';
  daysUntilExpiry?: number;
  daysExpired?: number;
};

/**
 * Calcula el nivel de restricción basado en el estado de la suscripción
 */
export function getSubscriptionRestrictions(
  paymentStatus: PaymentStatusResponse | null,
  nextBillingAt?: string
): SubscriptionRestrictions {
  // Sin información de pago - asumimos plan STARTER (gratis)
  if (!paymentStatus) {
    return {
      level: 'NONE',
      canCreate: true,
      canEdit: true,
      canExport: true,
      canUploadMultiple: true,
      canInviteUsers: true,
      showBanner: false,
      bannerMessage: '',
      bannerType: 'warning'
    };
  }

  const { subscriptionStatus, planCode, nextBillingAt: billingDate } = paymentStatus;

  // Plan STARTER (gratis) - sin restricciones de tiempo
  if (planCode === 'STARTER') {
    return {
      level: 'NONE',
      canCreate: true,
      canEdit: true,
      canExport: true,
      canUploadMultiple: false, // STARTER solo 1 imagen
      canInviteUsers: true,
      showBanner: false,
      bannerMessage: '',
      bannerType: 'warning'
    };
  }

  // Calcular días hasta expiración o días expirado
  let daysUntilExpiry: number | undefined;
  let daysExpired: number | undefined;

  if (billingDate) {
    const now = new Date();
    const billingDateObj = new Date(billingDate);
    const diffMs = billingDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      daysUntilExpiry = diffDays;
    } else {
      daysExpired = Math.abs(diffDays);
    }
  }

  // NIVEL 1: ACTIVO o PRUEBA - Sin restricciones
  if (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') {
    // Mostrar advertencia si faltan menos de 7 días
    if (daysUntilExpiry !== undefined && daysUntilExpiry <= 7) {
      return {
        level: 'WARNING',
        canCreate: true,
        canEdit: true,
        canExport: true,
        canUploadMultiple: true,
        canInviteUsers: true,
        showBanner: true,
        bannerMessage: `Tu plan expira en ${daysUntilExpiry} día${daysUntilExpiry !== 1 ? 's' : ''}. Renueva ahora para evitar interrupciones.`,
        bannerType: 'warning',
        daysUntilExpiry
      };
    }

    return {
      level: 'NONE',
      canCreate: true,
      canEdit: true,
      canExport: true,
      canUploadMultiple: true,
      canInviteUsers: true,
      showBanner: false,
      bannerMessage: '',
      bannerType: 'warning'
    };
  }

  // NIVEL 2: PENDIENTE - Restricciones moderadas
  if (subscriptionStatus === 'PENDING') {
    return {
      level: 'LIMITED',
      canCreate: false,
      canEdit: true,
      canExport: false,
      canUploadMultiple: false,
      canInviteUsers: false,
      showBanner: true,
      bannerMessage: 'Tu pago está pendiente. Algunas funciones están limitadas hasta confirmar el pago.',
      bannerType: 'warning'
    };
  }

  // NIVEL 3: SUSPENDIDO - Restricciones severas (0-7 días expirado)
  if (subscriptionStatus === 'SUSPENDED') {
    if (daysExpired !== undefined && daysExpired <= 7) {
      return {
        level: 'LIMITED',
        canCreate: false,
        canEdit: true,
        canExport: false,
        canUploadMultiple: false,
        canInviteUsers: false,
        showBanner: true,
        bannerMessage: `Tu plan expiró hace ${daysExpired} día${daysExpired !== 1 ? 's' : ''}. Renueva ahora para continuar creando contenido.`,
        bannerType: 'error',
        daysExpired
      };
    }

    // Más de 7 días expirado - BLOQUEADO
    return {
      level: 'BLOCKED',
      canCreate: false,
      canEdit: false,
      canExport: false,
      canUploadMultiple: false,
      canInviteUsers: false,
      showBanner: true,
      bannerMessage: 'Tu cuenta está suspendida. Renueva tu suscripción para recuperar el acceso completo.',
      bannerType: 'blocked',
      daysExpired
    };
  }

  // NIVEL 4: EXPIRADO - Restricciones según días expirado
  if (subscriptionStatus === 'EXPIRED') {
    if (daysExpired !== undefined && daysExpired <= 7) {
      return {
        level: 'LIMITED',
        canCreate: false,
        canEdit: true,
        canExport: false,
        canUploadMultiple: false,
        canInviteUsers: false,
        showBanner: true,
        bannerMessage: `Tu plan expiró hace ${daysExpired} día${daysExpired !== 1 ? 's' : ''}. Renueva ahora para continuar creando contenido.`,
        bannerType: 'error',
        daysExpired
      };
    }

    // Más de 7 días expirado - BLOQUEADO
    return {
      level: 'BLOCKED',
      canCreate: false,
      canEdit: false,
      canExport: false,
      canUploadMultiple: false,
      canInviteUsers: false,
      showBanner: true,
      bannerMessage: 'Tu plan ha expirado. Renueva tu suscripción para recuperar el acceso completo.',
      bannerType: 'blocked',
      daysExpired
    };
  }

  // NIVEL 5: CANCELADO - Solo lectura
  if (subscriptionStatus === 'CANCELLED') {
    return {
      level: 'BLOCKED',
      canCreate: false,
      canEdit: false,
      canExport: false,
      canUploadMultiple: false,
      canInviteUsers: false,
      showBanner: true,
      bannerMessage: 'Tu suscripción fue cancelada. Reactiva tu plan para continuar usando HomeForge.',
      bannerType: 'blocked'
    };
  }

  // Default: sin restricciones
  return {
    level: 'NONE',
    canCreate: true,
    canEdit: true,
    canExport: true,
    canUploadMultiple: true,
    canInviteUsers: true,
    showBanner: false,
    bannerMessage: '',
    bannerType: 'warning'
  };
}
