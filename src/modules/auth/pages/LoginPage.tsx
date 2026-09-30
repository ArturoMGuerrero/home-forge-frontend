import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAuthenticated, login } from '../api/authApi';
import { Button, Input } from '../../../shared/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (isAuthenticated()) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      await login(email, password);
      toast.success('Sesión iniciada correctamente');
      navigate('/app');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible iniciar sesión.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-inverse lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-slate-950 to-cyan-500/40" />
        <div className="absolute -left-24 top-28 size-80 rounded-full border-[60px] border-white/5" />
        <img alt="HomeForge" className="relative w-56 rounded-3xl object-contain shadow-2xl shadow-cyan-950/40" src="/homeforge-logo.png" />
        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Operación inmobiliaria</p>
          <h1 className="text-5xl font-bold leading-tight">Convierte cada oportunidad en una venta mejor gestionada.</h1>
          <p className="mt-5 text-lg text-border-strong">Prospectos, inventario y publicación de propiedades en un solo lugar.</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-surface-muted px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <img alt="HomeForge" className="size-12 rounded-xl object-cover" src="/favicon.png" />
              <strong className="text-xl font-bold text-fg">HomeForge</strong>
            </div>
          </div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">Acceso privado</p>
          <h2 className="text-3xl font-bold">Bienvenido de nuevo</h2>
          <p className="mt-2 text-sm text-fg-subtle">Ingresa con la cuenta registrada para tu empresa.</p>


          <form className="mt-8 space-y-5" onSubmit={submit}>
            <Input
              autoComplete="email"
              label="Correo electrónico"
              onChange={event => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
            <div className="relative">
              <div className="absolute right-0 top-0 z-10">
                <Link className="text-xs font-semibold text-primary-fg hover:underline" to="/recuperar-contraseña">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                autoComplete="current-password"
                label="Contraseña"
                minLength={6}
                onChange={event => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
            <Button
              disabled={saving}
              fullWidth
              loading={saving}
              size="lg"
              type="submit"
            >
              {saving ? 'Verificando...' : 'Entrar al sistema'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-subtle">
            ¿Aún no tienes cuenta?{' '}
            <Link className="font-semibold text-primary-fg hover:underline" to="/registro">
              Crear una cuenta
            </Link>
          </p>
          <Link className="mt-6 block text-center text-sm font-semibold text-primary-fg hover:underline" to="/propiedades">
            Ver propiedades sin iniciar sesión
          </Link>
        </div>
      </section>
    </div>
  );
}
