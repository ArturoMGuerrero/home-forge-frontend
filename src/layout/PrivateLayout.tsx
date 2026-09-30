import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getSession, logout, updateSessionSubscription } from '../modules/auth';
import { Icon, IconName } from '../shared/Icon';
import { ACCOUNT_PREFERENCES_EVENT, COMPANY_BRANDING_EVENT, getCompanyLogo, getSubscription, getUserAvatar, Subscription } from '../modules/settings';
import { SubscriptionBanner } from '../shared/SubscriptionBanner';
import { useSubscriptionRestrictions } from '../shared/useSubscriptionRestrictions';
import { Avatar, cn } from '../shared/ui';

type NavGroup = 'Operación' | 'Gestión' | 'Administración';

const navigation: Array<{ label: string; to: string; icon: IconName; group: NavGroup; end?: boolean; adminOnly?: boolean }> = [
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

const navGroups: NavGroup[] = ['Operación', 'Gestión', 'Administración'];

// El sidebar es siempre oscuro (identidad de marca), por eso usa colores fijos y no tokens de tema.
const navItemClass = 'flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';
const navItemIdleClass = 'text-slate-400 hover:bg-white/[0.06] hover:text-white';

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

  const closeMenu = () => setMenuOpen(false);
  const isBlocked = restrictions.level !== 'NONE' && restrictions.level !== 'WARNING';

  return (
    <div className="min-h-screen bg-app text-fg lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="border-b border-white/5 bg-slate-950 px-4 py-4 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
        <div className="flex items-center justify-between gap-4 lg:px-2">
          <NavLink className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" onClick={closeMenu} to="/app">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06] p-1.5 ring-1 ring-white/10">
              <img alt={companyLogo ? 'Logo de la empresa' : 'HomeForge'} className="size-full object-contain" src={companyLogo || '/favicon.png'} />
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-base font-semibold tracking-tight">HomeForge</strong>
              <small className="block truncate text-xs text-slate-500">Gestión inmobiliaria</small>
            </span>
          </NavLink>

          <button
            aria-controls="app-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMenuOpen(current => !current)}
            type="button"
          >
            <span className="relative block h-3.5 w-5">
              <span className={cn('absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition', menuOpen && 'translate-y-[6px] rotate-45')} />
              <span className={cn('absolute left-0 top-[6px] h-0.5 w-5 rounded bg-current transition', menuOpen && 'opacity-0')} />
              <span className={cn('absolute left-0 top-[12px] h-0.5 w-5 rounded bg-current transition', menuOpen && '-translate-y-[6px] -rotate-45')} />
            </span>
          </button>
        </div>

        <nav
          aria-label="Navegación principal"
          className={cn(menuOpen ? 'flex' : 'hidden', 'mt-4 flex-col gap-0.5 border-t border-white/5 pt-3 lg:mt-7 lg:flex lg:flex-1 lg:overflow-y-auto lg:border-0 lg:pt-0')}
          id="app-navigation"
        >
          {navGroups.map(group => {
            const items = navigation.filter(item => item.group === group && (!item.adminOnly || session?.role === 'ADMIN'));
            if (!items.length) return null;
            return (
              <div className="mb-3" key={group}>
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{group}</p>
                <div className="space-y-0.5">
                  {items.map(item => (
                    <NavLink
                      className={({ isActive }) => cn(navItemClass, isActive ? 'bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-400/25' : navItemIdleClass)}
                      end={item.end}
                      key={item.to}
                      onClick={closeMenu}
                      to={item.to}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={cn('size-[18px] shrink-0', isActive ? 'text-indigo-300' : 'text-slate-500')} name={item.icon} />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-auto space-y-0.5 border-t border-white/5 pt-3">
            <NavLink className={cn(navItemClass, navItemIdleClass)} onClick={closeMenu} to="/propiedades">
              <Icon className="size-[18px] shrink-0 text-slate-500" name="website" />
              <span className="truncate">Sitio público</span>
            </NavLink>
            <button className={cn(navItemClass, navItemIdleClass, 'w-full text-left lg:hidden')} onClick={signOut} type="button">
              <Icon className="size-[18px] shrink-0 text-slate-500" name="arrow" />
              <span className="truncate">Cerrar sesión</span>
            </button>
          </div>
        </nav>

        <div className="mt-3 hidden space-y-2 lg:block">
          {subscription && (
            <NavLink
              className={cn(
                'group block rounded-xl border p-3 transition',
                subscription.status === 'TRIAL'
                  ? 'border-amber-400/20 bg-amber-400/[0.07] hover:bg-amber-400/[0.12]'
                  : isBlocked
                    ? 'border-rose-400/20 bg-rose-400/[0.07] hover:bg-rose-400/[0.12]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]'
              )}
              to="/app/planes"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Plan actual</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-white">{subscription.planName || subscription.planCode}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    subscription.status === 'TRIAL' ? 'bg-amber-400/15 text-amber-300' : subscription.status === 'ACTIVE' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'
                  )}
                >
                  {subscription.status === 'TRIAL' ? `${subscription.trialDaysRemaining} días` : subscription.status === 'ACTIVE' ? 'Activo' : 'Revisar'}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-slate-200">
                <span>{subscription.status === 'TRIAL' || isBlocked ? 'Mejorar plan' : 'Administrar plan'}</span>
                <Icon className="size-3.5 transition group-hover:translate-x-0.5" name="arrow" />
              </div>
            </NavLink>
          )}

          <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5">
            <NavLink className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1.5 transition hover:bg-white/[0.06]" to="/app/cuenta">
              <Avatar name={session?.name || 'Usuario'} size="sm" src={userAvatar} />
              <span className="min-w-0">
                <strong className="block truncate text-sm font-medium text-white">{session?.name}</strong>
                <span className="block truncate text-[11px] text-slate-500">{session?.email}</span>
              </span>
            </NavLink>
            <button
              aria-label="Cerrar sesión"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/[0.08] hover:text-white"
              onClick={signOut}
              title="Cerrar sesión"
              type="button"
            >
              <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <SubscriptionBanner restrictions={restrictions} />
        <main className="mx-auto w-full min-w-0 max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet context={{ restrictions }} />
        </main>
      </div>
    </div>
  );
}
