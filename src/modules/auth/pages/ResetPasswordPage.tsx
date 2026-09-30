import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import { Button, Input } from '../../../shared/ui';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setSaving(false);
      return;
    }

    if (!token) {
      setError('Token inválido. Por favor solicita un nuevo enlace de recuperación.');
      setSaving(false);
      return;
    }

    try {
      await resetPassword(token, newPassword);
      navigate('/login?reset=success');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible restablecer la contraseña. El enlace podría haber expirado.'
      );
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
          <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Nueva contraseña</p>
          <h1 className="text-5xl font-bold leading-tight">Crea una contraseña segura para tu cuenta.</h1>
          <p className="mt-5 text-lg text-border-strong">Asegúrate de que sea fácil de recordar pero difícil de adivinar.</p>
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

          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">Nueva contraseña</p>
          <h2 className="text-3xl font-bold">Restablecer contraseña</h2>
          <p className="mt-2 text-sm text-fg-subtle">Ingresa tu nueva contraseña para completar el proceso de recuperación.</p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <Input
                autoComplete="new-password"
                helperText="Usa al menos 8 caracteres."
                label="Nueva contraseña"
                minLength={8}
                onChange={event => setNewPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                type="password"
                value={newPassword}
            />

            <Input
                autoComplete="new-password"
                error={confirmPassword && newPassword !== confirmPassword ? 'Las contraseñas no coinciden.' : undefined}
                label="Confirmar nueva contraseña"
                minLength={8}
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Escribe la contraseña nuevamente"
                required
                type="password"
                value={confirmPassword}
            />

            {/* Validación visual */}
            {newPassword && confirmPassword && (
              <div className="rounded-xl bg-surface-muted p-3 text-xs">
                <div className="flex items-center gap-2">
                  {newPassword === confirmPassword ? (
                    <>
                      <svg className="size-4 text-success-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-success-fg">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <svg className="size-4 text-warning-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="font-medium text-warning-fg">Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
                {newPassword.length < 8 && (
                  <p className="mt-1 text-fg-muted">La contraseña debe tener al menos 8 caracteres ({newPassword.length}/8)</p>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm font-medium text-danger-fg" role="alert">
                {error}
              </p>
            )}

            <Button
              disabled={saving || newPassword !== confirmPassword || newPassword.length < 8 || !token}
              fullWidth
              loading={saving}
              size="lg"
              type="submit"
            >
              {saving ? 'Guardando...' : 'Restablecer contraseña'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-subtle">
            ¿Problemas con el enlace?{' '}
            <Link className="font-semibold text-primary-fg hover:underline" to="/recuperar-contraseña">
              Solicitar uno nuevo
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
