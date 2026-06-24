import { useEffect, useState } from 'react';
import { getSession } from './auth';
import { getPaymentStatus, PaymentStatusResponse } from './paymentApi';
import { getSubscriptionRestrictions, SubscriptionRestrictions } from './subscriptionRestrictions';

export function useSubscriptionRestrictions() {
  const [restrictions, setRestrictions] = useState<SubscriptionRestrictions>({
    level: 'NONE',
    canCreate: true,
    canEdit: true,
    canExport: true,
    canUploadMultiple: true,
    canInviteUsers: true,
    showBanner: false,
    bannerMessage: '',
    bannerType: 'warning'
  });
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session?.companyId) {
      setLoading(false);
      return;
    }

    getPaymentStatus(session.companyId)
      .then(status => {
        console.log('🔍 Payment Status Response:', status);
        setPaymentStatus(status);
        const computed = getSubscriptionRestrictions(status, status.nextBillingAt);
        console.log('🔍 Computed Restrictions:', computed);
        setRestrictions(computed);
      })
      .catch((error) => {
        console.error('❌ Error getting payment status:', error);
        // En caso de error, no bloquear nada
        setRestrictions({
          level: 'NONE',
          canCreate: true,
          canEdit: true,
          canExport: true,
          canUploadMultiple: true,
          canInviteUsers: true,
          showBanner: false,
          bannerMessage: '',
          bannerType: 'warning'
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return { restrictions, loading, paymentStatus };
}
