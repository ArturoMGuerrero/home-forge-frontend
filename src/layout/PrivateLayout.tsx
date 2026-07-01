import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getSession, logout, updateSessionSubscription } from '../shared/auth';
import { Icon, IconName } from '../shared/Icon';
import { getSubscription, Subscription } from '../shared/subscriptionApi';
import { SubscriptionBadge } from '../shared/SubscriptionBadge';
import { SubscriptionBanner } from '../shared/SubscriptionBanner';
import { useSubscriptionRestrictions } from '../shared/useSubscriptionRestrictions';

const navigation: Array<{ label: string; to: string; icon: IconName; end?: boolean }> = [
  { label: 'Dashboard', to: '/app', icon: 'dashboard', end: true },
  { label: 'Prospectos', to: '/app/prospectos', icon: 'leads' },
  { label: 'Propiedades', to: '/app/propiedades', icon: 'properties' },
  { label: 'Agenda', to: '/app/agenda', icon: 'calendar' },
  { label: 'Documentos', to: '/app/documentos', icon: 'document' },
  { label: 'Notificaciones', to: '/app/notificaciones', icon: 'document' },
  { label: 'Reportes', to: '/app/reportes', icon: 'reports' },
  { label: 'Configuración', to: '/app/configuracion', icon: 'settings' }
];

export function PrivateLayout() {
  const navigate = useNavigate();
  const session = getSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { restrictions } = useSubscriptionRestrictions();

  useEffect(() => {
    getSubscription()
      .then(response => {
        setSubscription(response);
        updateSessionSubscription(response.planCode, response.userLimit, response.status, response.trialEndsAt);
      })
      .catch(() => undefined);
  }, []);

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
              <img alt="HomeForge" className="w-full h-full object-contain" src="/favicon.png" />
            </div>
            <div className="min-w-0 flex flex-col">
              <strong className="truncate text-lg font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">HomeForge</strong>
              <small className="truncate text-xs text-slate-400">Real Estate Platform</small>
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
          {navigation.filter(item => item.to !== '/app/usuarios' || session?.role === 'ADMIN').map(item => (
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

        <div className="mt-auto hidden space-y-3 lg:block">
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
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-lg">
                {session?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'JM'}
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

            <button className="mt-3 w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all" onClick={signOut} type="button">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <SubscriptionBanner restrictions={restrictions} />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
          <Outlet context={{ restrictions }} />
        </main>
      </div>
    </div>
  );
}
