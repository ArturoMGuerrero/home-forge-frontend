import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../shared/auth';

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

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-slate-950 to-cyan-500/40" />
        <div className="absolute -left-24 top-28 size-80 rounded-full border-[60px] border-white/5" />
        <img alt="HomeForge" className="relative w-56 rounded-3xl object-contain shadow-2xl shadow-cyan-950/40" src="/homeforge-logo.png" />
        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Nueva contraseña</p>
          <h1 className="text-5xl font-bold leading-tight">Crea una contraseña segura para tu cuenta.</h1>
          <p className="mt-5 text-lg text-slate-300">Asegúrate de que sea fácil de recordar pero difícil de adivinar.</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <img alt="HomeForge" className="size-12 rounded-xl object-cover" src="/favicon.png" />
              <strong className="text-xl font-bold text-slate-950">HomeForge</strong>
            </div>
          </div>

          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Nueva contraseña</p>
          <h2 className="text-3xl font-bold">Restablecer contraseña</h2>
          <p className="mt-2 text-sm text-slate-500">Ingresa tu nueva contraseña para completar el proceso de recuperación.</p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Nueva contraseña
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                minLength={6}
                onChange={event => setNewPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                type="password"
                value={newPassword}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Confirmar nueva contraseña
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                minLength={6}
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Escribe la contraseña nuevamente"
                required
                type="password"
                value={confirmPassword}
              />
            </label>

            {/* Validación visual */}
            {newPassword && confirmPassword && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs">
                <div className="flex items-center gap-2">
                  {newPassword === confirmPassword ? (
                    <>
                      <svg className="size-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-emerald-700">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <svg className="size-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="font-medium text-amber-700">Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
                {newPassword.length < 6 && (
                  <p className="mt-1 text-slate-600">La contraseña debe tener al menos 6 caracteres ({newPassword.length}/6)</p>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
                {error}
              </p>
            )}

            <button
              className="w-full shrink-0 rounded-xl bg-indigo-600 px-3.5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || newPassword !== confirmPassword || newPassword.length < 6}
              type="submit"
            >
              {saving ? 'Guardando...' : 'Restablecer contraseña'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Problemas con el enlace?{' '}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-800" to="/recuperar-contraseña">
              Solicitar uno nuevo
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
