import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getSession, logout, updateSessionSubscription } from '../modules/auth';
import { Icon, IconName } from '../shared/Icon';
import { ACCOUNT_PREFERENCES_EVENT, COMPANY_BRANDING_EVENT, getCompanyLogo, getSubscription, getUserAvatar, Subscription } from '../modules/settings';
import { SubscriptionBadge } from '../shared/SubscriptionBadge';
import { SubscriptionBanner } from '../shared/SubscriptionBanner';
import { useSubscriptionRestrictions } from '../shared/useSubscriptionRestrictions';

const navigation: Array<{ label: string; to: string; icon: IconName; group: 'Operación' | 'Gestión' | 'Administración'; end?: boolean; adminOnly?: boolean }> = [
  { label: 'Dashboard', to: '/app', icon: 'dashboard', group: 'Operación', end: true },
  { label: 'Prospectos', to: '/app/prospectos', icon: 'leads', group: 'Operación' },
  { label: 'Propiedades', to: '/app/propiedades', icon: 'properties', group: 'Operación' },
  { label: 'Calendario', to: '/app/calendario', icon: 'calendar', group: 'Operación' },
  { label: 'Documentos', to: '/app/documentos', icon: 'document', group: 'Gestión' },
  { label: 'Notificaciones', to: '/app/notificaciones', icon: 'envelope', group: 'Gestión' },
  { label: 'Reportes', to: '/app/reportes', icon: 'reports', group: 'Gestión' },
  { label: 'Usuarios', to: '/app/usuarios', icon: 'users', group: 'Administración', adminOnly: true },
  { label: 'Configuración', to: '/app/configuracion', icon: 'settings', group: 'Administración' }
];

export function PrivateLayout() {
  const navigate = useNavigate();
  const session = getSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [companyLogo, setCompanyLogo] = useState(() => getCompanyLogo(session?.companyId));
  const [userAvatar, setUserAvatar] = useState(() => getUserAvatar(session?.userId));
  const { restrictions } = useSubscriptionRestrictions();

  useEffect(() => {
    getSubscription()
      .then(response => {
        setSubscription(response);
        updateSessionSubscription(response.planCode, response.userLimit, response.status, response.trialEndsAt);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const refreshLogo = () => setCompanyLogo(getCompanyLogo(session?.companyId));
    window.addEventListener(COMPANY_BRANDING_EVENT, refreshLogo);
    return () => window.removeEventListener(COMPANY_BRANDING_EVENT, refreshLogo);
  }, [session?.companyId]);

  useEffect(() => {
    const refreshAvatar = () => setUserAvatar(getUserAvatar(session?.userId));
    window.addEventListener(ACCOUNT_PREFERENCES_EVENT, refreshAvatar);
    return () => window.removeEventListener(ACCOUNT_PREFERENCES_EVENT, refreshAvatar);
  }, [session?.userId]);

  function signOut() {
    logout();
    setMenuOpen(false);
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-5 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-5 lg:py-6">
        <div className="flex items-center justify-between gap-4">
          <NavLink className="flex min-w-0 items-center gap-3 group" onClick={() => setMenuOpen(false)} to="/app">
            <div className="size-11 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 shadow-lg shadow-indigo-900/40 group-hover:shadow-indigo-500/30 transition-shadow">
              <img alt={companyLogo ? 'Logo de la empresa' : 'HomeForge'} className="size-full object-contain" src={companyLogo || '/favicon.png'} />
            </div>
            <div className="min-w-0 flex flex-col">
              <strong className="truncate text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">HomeForge</strong>
              <small className="truncate text-xs text-slate-400">Gestión inmobiliaria</small>
            </div>
          </NavLink>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-200 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMenuOpen(current => !current)}
            type="button"
          >
            <span className="relative block h-4 w-5">
              <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
              <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 top-[14px] h-0.5 w-5 rounded bg-current transition ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>

        <nav className={`${menuOpen ? 'grid' : 'hidden'} mt-5 grid-cols-2 gap-1.5 border-t border-white/5 pt-5 lg:mt-8 lg:grid lg:grid-cols-1 lg:border-0 lg:pt-0`}>
          {(['Operación', 'Gestión', 'Administración'] as const).map(group => {
            const items = navigation.filter(item => item.group === group && (!item.adminOnly || session?.role === 'ADMIN'));
            if (!items.length) return null;
            return (
              <div className="contents lg:block lg:space-y-1" key={group}>
                <p className="col-span-2 mb-1 mt-3 px-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 first:mt-0 lg:mt-5">
                  {group}
                </p>
                {items.map(item => (
              <NavLink
                className={({ isActive }) => `flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all lg:gap-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                end={item.end}
                key={item.to}
                onClick={() => setMenuOpen(false)}
                to={item.to}
              >
                <Icon className="size-5 shrink-0" name={item.icon} />
                <span className="truncate">{item.label}</span>
              </NavLink>
                ))}
              </div>
            );
          })}
          <NavLink
            className="flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all lg:gap-3"
            onClick={() => setMenuOpen(false)}
            to="/propiedades"
          >
            <Icon className="size-5 shrink-0" name="website" />
            <span className="truncate">Sitio público</span>
          </NavLink>
          <button className="flex min-w-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all lg:hidden" onClick={signOut} type="button">
            <Icon className="size-5 shrink-0" name="arrow" />
            <span className="truncate">Cerrar sesión</span>
          </button>
        </nav>

        <div className="hidden">
          {subscription?.status === 'TRIAL' && (
            <NavLink className="block rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-3.5 py-2.5 hover:from-amber-500/15 hover:to-orange-500/15 transition-all border border-amber-500/20" to="/app/planes">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-amber-200">Prueba gratis</span>
                <span className="text-xs font-bold text-white">{subscription.trialDaysRemaining}d</span>
              </div>
              <p className="text-[11px] text-amber-100/70">Actualiza para continuar</p>
            </NavLink>
          )}

          <div className="rounded-xl bg-white/5 px-3.5 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg">
                {userAvatar
                  ? <img alt={`Avatar de ${session?.name || 'usuario'}`} className="size-full object-cover" src={userAvatar} />
                  : session?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'JM'}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-white">{session?.name}</strong>
                <div className="mt-1">
                  <SubscriptionBadge />
                </div>
              </div>
            </div>

            {/* Estado de suscripción */}
            {subscription && (
              <div className="mt-3 space-y-1.5">
                {subscription.status === 'ACTIVE' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estado</span>
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Activo
                    </span>
                  </div>
                )}
                {subscription.status === 'TRIAL' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estado</span>
                    <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                      <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Prueba ({subscription.trialDaysRemaining}d)
                    </span>
                  </div>
                )}
                {(subscription.status === 'SUSPENDED' || subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED') && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estado</span>
                    <span className="flex items-center gap-1.5 font-semibold text-rose-400">
                      <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {subscription.status === 'SUSPENDED' ? 'Suspendido' : subscription.status === 'EXPIRED' ? 'Expirado' : 'Cancelado'}
                    </span>
                  </div>
                )}

                {restrictions.level !== 'NONE' && restrictions.level !== 'WARNING' && (
                  <NavLink
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-rose-900/50 hover:shadow-rose-900/70 transition-all"
                    to="/app/planes"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Renovar plan
                  </NavLink>
                )}
              </div>
            )}

            <div className="mt-3 space-y-1.5">
              <NavLink
                className="flex items-center gap-2 w-full rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                to="/app/cuenta"
              >
                <Icon className="size-3.5" name="user" />
                Mi cuenta
              </NavLink>
              <button className="flex items-center gap-2 w-full rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all" onClick={signOut} type="button">
                <Icon className="size-3.5" name="arrow" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto hidden space-y-3 border-t border-white/10 pt-4 lg:block">
          {subscription && (
            <NavLink className={`group block rounded-2xl border p-3.5 transition ${subscription.status === 'TRIAL' ? 'border-amber-400/25 bg-amber-400/10 hover:bg-amber-400/15' : restrictions.level !== 'NONE' && restrictions.level !== 'WARNING' ? 'border-rose-400/25 bg-rose-400/10 hover:bg-rose-400/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`} to="/app/planes">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Plan actual</p>
                  <p className="mt-1 truncate text-sm font-bold text-white">{subscription.planName || subscription.planCode}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${subscription.status === 'TRIAL' ? 'bg-amber-300 text-amber-950' : subscription.status === 'ACTIVE' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
                  {subscription.status === 'TRIAL' ? `${subscription.trialDaysRemaining} días` : subscription.status === 'ACTIVE' ? 'Activo' : 'Revisar'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>{subscription.status === 'TRIAL' ? 'Mejorar plan' : 'Administrar plan'}</span>
                <Icon className="size-4 transition group-hover:translate-x-1" name="arrow" />
              </div>
            </NavLink>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <NavLink className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.07]" to="/app/cuenta">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg">
                {userAvatar
                  ? <img alt={`Avatar de ${session?.name || 'usuario'}`} className="size-full object-cover" src={userAvatar} />
                  : session?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'JM'}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm text-white">{session?.name}</strong>
                <span className="mt-0.5 block truncate text-[11px] text-slate-400">{session?.email}</span>
              </div>
              <Icon className="size-4 shrink-0 text-slate-500" name="arrow" />
            </NavLink>
            <button className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white" onClick={signOut} type="button">
              <Icon className="size-3.5" name="arrow" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        <SubscriptionBanner restrictions={restrictions} />
        <main className="mx-auto w-full min-w-0 max-w-[1480px] flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-10">
          <Outlet context={{ restrictions }} />
        </main>
      </div>
    </div>
  );
}
