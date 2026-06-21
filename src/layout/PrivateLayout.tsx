import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getSession, logout, updateSessionSubscription } from '../shared/auth';
import { Icon, IconName } from '../shared/Icon';
import { getSubscription, Subscription } from '../shared/subscriptionApi';

const navigation: Array<{ label: string; to: string; icon: IconName; end?: boolean }> = [
  { label: 'Panel', to: '/app', icon: 'dashboard', end: true },
  { label: 'Prospectos', to: '/app/prospectos', icon: 'leads' },
  { label: 'Propiedades', to: '/app/propiedades', icon: 'properties' },
  { label: 'Agenda', to: '/app/agenda', icon: 'calendar' },
  { label: 'Asignaciones', to: '/app/asignaciones', icon: 'link' },
  { label: 'Documentos', to: '/app/documentos', icon: 'document' },
  { label: 'Reportes', to: '/app/reportes', icon: 'reports' },
  { label: 'Usuarios', to: '/app/usuarios', icon: 'users' },
  { label: 'Planes', to: '/app/planes', icon: 'plans' },
  { label: 'Configuración', to: '/app/configuracion', icon: 'settings' }
];

export function PrivateLayout() {
  const navigate = useNavigate();
  const session = getSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

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
                <small className="block truncate text-xs text-slate-400">{subscription?.planCode ?? session?.planCode ?? 'Starter'}</small>
              </div>
            </div>
            <button className="mt-3 w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all" onClick={signOut} type="button">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1480px] px-4 py-7 sm:px-7 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
