import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../shared/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      setSaving(false);
      return;
    }

    try {
      await requestPasswordReset(email, newPassword);
      setSuccess(true);
      toast.success('Contraseña restablecida exitosamente');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible restablecer la contraseña.');
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
          <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Recuperación de acceso</p>
          <h1 className="text-5xl font-bold leading-tight">Recupera el acceso a tu cuenta de forma segura.</h1>
          <p className="mt-5 text-lg text-slate-300">Ingresa tu correo y tu nueva contraseña para restablecer el acceso.</p>
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

          <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600" to="/login">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio de sesión
          </Link>

          {!success ? (
            <>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Recuperar contraseña</p>
              <h2 className="text-3xl font-bold">¿Olvidaste tu contraseña?</h2>
              <p className="mt-2 text-sm text-slate-500">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

              <form className="mt-8 space-y-5" onSubmit={submit}>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Correo electrónico
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    onChange={event => setEmail(event.target.value)}
                    placeholder="tu@email.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>

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
                      <p className="mt-1 text-slate-600">
                        La contraseña debe tener al menos 6 caracteres ({newPassword.length}/6)
                      </p>
                    )}
                  </div>
                )}

                <button
                  className="w-full shrink-0 rounded-xl bg-indigo-600 px-3.5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving || newPassword !== confirmPassword || newPassword.length < 6}
                  type="submit"
                >
                  {saving ? 'Procesando...' : 'Restablecer contraseña'}
                </button>
              </form>
            </>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-100">
                  <svg className="size-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900">¡Contraseña restablecida!</h3>
                  <p className="text-sm text-emerald-700">Ya puedes iniciar sesión</p>
                </div>
              </div>
              <p className="text-sm text-emerald-800">
                Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link
                className="mt-4 block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                to="/login"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Recordaste tu contraseña?{' '}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-800" to="/login">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
