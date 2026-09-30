import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../api/authApi';
import { Button, Input } from '../../../shared/ui';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      toast.success('Solicitud enviada');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible restablecer la contraseña.');
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
          <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Recuperación de acceso</p>
          <h1 className="text-5xl font-bold leading-tight">Recupera el acceso a tu cuenta de forma segura.</h1>
          <p className="mt-5 text-lg text-border-strong">Ingresa tu correo y tu nueva contraseña para restablecer el acceso.</p>
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

          <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-fg-muted transition hover:text-primary-fg" to="/login">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio de sesión
          </Link>

          {!success ? (
            <>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary-fg">Recuperar contraseña</p>
              <h2 className="text-3xl font-bold">¿Olvidaste tu contraseña?</h2>
              <p className="mt-2 text-sm text-fg-subtle">Ingresa tu correo electrónico y te enviaremos un enlace seguro para continuar.</p>

              <form className="mt-8 space-y-5" onSubmit={submit}>
                <Input
                    autoComplete="email"
                    label="Correo electrónico"
                    onChange={event => setEmail(event.target.value)}
                    placeholder="tu@email.com"
                    required
                    type="email"
                    value={email}
                />

                <Button
                  disabled={saving}
                  fullWidth
                  loading={saving}
                  size="lg"
                  type="submit"
                >
                  {saving ? 'Enviando...' : 'Enviar enlace seguro'}
                </Button>
              </form>
            </>
          ) : (
            <div className="rounded-2xl border border-success-line bg-success-soft p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-success-muted">
                  <svg className="size-6 text-success-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-success-fg">Revisa tu correo</h3>
                  <p className="text-sm text-success-fg">La solicitud fue procesada</p>
                </div>
              </div>
              <p className="text-sm text-success-fg">
                Si existe una cuenta asociada, recibirás un enlace que será válido durante 30 minutos.
              </p>
              <Link
                className="mt-4 block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-hover"
                to="/login"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-fg-subtle">
            ¿Recordaste tu contraseña?{' '}
            <Link className="font-semibold text-primary-fg hover:underline" to="/login">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
