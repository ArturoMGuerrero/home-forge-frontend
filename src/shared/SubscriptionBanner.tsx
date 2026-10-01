import { Link } from 'react-router-dom';
import { SubscriptionRestrictions } from './subscriptionRestrictions';
import { AlertIcon, buttonClasses, cn } from './ui';

type Props = {
  restrictions: SubscriptionRestrictions;
};

const styles = {
  warning: { bar: 'border-warning-line bg-warning-soft', icon: 'text-warning', text: 'text-warning-fg' },
  error: { bar: 'border-danger-line bg-danger-soft', icon: 'text-danger', text: 'text-danger-fg' },
  blocked: { bar: 'border-border-strong bg-surface-sunken', icon: 'text-fg-muted', text: 'text-fg' }
};

/** Aviso persistente sobre el estado de la suscripción, sobre el contenido principal. */
export function SubscriptionBanner({ restrictions }: Props) {
  if (!restrictions.showBanner) return null;

  const { bannerType, bannerMessage } = restrictions;
  const style = styles[bannerType];

  return (
    <div className={cn('border-b', style.bar)} role={bannerType === 'warning' ? 'status' : 'alert'}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-2.5">
          <AlertIcon className={style.icon} variant={bannerType === 'warning' ? 'warning' : 'error'} />
          <p className={cn('text-sm font-medium', style.text)}>{bannerMessage}</p>
        </div>
        <Link className={buttonClasses({ size: 'sm', variant: bannerType === 'blocked' ? 'primary' : 'tertiary' })} to="/app/planes">
          {bannerType === 'blocked' ? 'Reactivar plan' : 'Renovar ahora'}
        </Link>
      </div>
    </div>
  );
}
