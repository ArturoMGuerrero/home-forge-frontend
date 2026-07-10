import { Link } from 'react-router-dom';
import { SubscriptionRestrictions } from './subscriptionRestrictions';

type Props = {
  restrictions: SubscriptionRestrictions;
};

export function SubscriptionBanner({ restrictions }: Props) {
  if (!restrictions.showBanner) return null;

  const { bannerType, bannerMessage } = restrictions;

  const styles = {
    warning: 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-700 text-white',
    error: 'bg-gradient-to-r from-rose-600 to-pink-600 border-rose-700 text-white',
    blocked: 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 text-white'
  };

  const icons = {
    warning: (
      <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    blocked: (
      <svg className="size-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className={`border-b ${styles[bannerType]}`}>
      <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-3 sm:px-7 lg:px-10">
        <div className="flex items-center gap-3">
          {icons[bannerType]}
          <p className="text-sm font-medium">
            {bannerMessage}
          </p>
        </div>
        <Link
          className="shrink-0 rounded-lg bg-white/20 px-4 py-1.5 text-xs font-bold transition hover:bg-white/30"
          to="/app/planes"
        >
          {bannerType === 'blocked' ? 'Reactivar Plan' : 'Renovar Ahora'}
        </Link>
      </div>
    </div>
  );
}
