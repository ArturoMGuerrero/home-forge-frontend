import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, register } from '../shared/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated()) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los términos para crear tu cuenta.');
      return;
    }

    setSaving(true);
    try {
      await register({
        fullName: name,
        companyName: company,
        email,
        phoneE164: phone,
        password
      });
      navigate('/app');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible crear la cuenta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[.82fr_1.18fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-slate-950 to-cyan-500/50" />
        <div className="absolute -right-24 top-32 size-80 rounded-full border-[58px] border-white/5" />
        <Link className="relative" to="/">
          <img alt="HomeForge" className="w-56 rounded-3xl object-contain shadow-2xl shadow-cyan-950/40" src="/homeforge-logo.png" />
        </Link>

        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-bold uppercase tracking-[.2em] text-cyan-300">Empieza hoy</p>
          <h1 className="text-5xl font-bold leading-tight">Tu operación inmobiliaria, en orden desde el primer día.</h1>
          <div className="mt-8 grid gap-4 text-sm text-slate-200">
            {[
              'Administra prospectos y seguimientos',
              'Controla tu inventario de propiedades',
              'Centraliza la operación de tu equipo'
            ].map(item => (
              <div className="flex items-center gap-3" key={item}>
                <span className="grid size-7 place-items-center rounded-full bg-cyan-300 font-bold text-slate-950">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-400">Sin tarjeta de crédito. Configuración en minutos.</p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:py-14">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <Link className="flex items-center gap-3 lg:hidden" to="/">
              <img alt="HomeForge" className="size-11 rounded-xl object-cover" src="/favicon.png" />
              <strong className="text-lg font-bold">HomeForge</strong>
            </Link>
            <p className="ml-auto text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <Link className="font-semibold text-indigo-600 hover:text-indigo-800" to="/login">Inicia sesión</Link>
            </p>
          </div>

          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Crea tu espacio de trabajo</p>
          <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">Comienza con HomeForge</h2>
          <p className="mt-2 text-sm text-slate-500">Registra tu empresa y la cuenta del administrador principal.</p>

          <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Nombre completo
              <input autoComplete="name" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={event => setName(event.target.value)} placeholder="Jorge Martínez" required value={name} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Empresa
              <input autoComplete="organization" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={event => setCompany(event.target.value)} placeholder="Inmobiliaria Horizonte" required value={company} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Correo electrónico
              <input autoComplete="email" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={event => setEmail(event.target.value)} placeholder="jorge@empresa.com" required type="email" value={email} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Teléfono
              <input autoComplete="tel" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={event => setPhone(event.target.value)} pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" required type="tel" value={phone} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Contraseña
              <input autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" minLength={8} onChange={event => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" required type="password" value={password} />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Confirmar contraseña
              <input autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" minLength={8} onChange={event => setPasswordConfirmation(event.target.value)} placeholder="Repite tu contraseña" required type="password" value={passwordConfirmation} />
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-600 sm:col-span-2">
              <input checked={acceptedTerms} className="mt-0.5 size-4 rounded border-slate-300 accent-indigo-600" onChange={event => setAcceptedTerms(event.target.checked)} type="checkbox" />
              <span>Acepto los <a className="font-semibold text-indigo-600" href="#">términos de servicio</a> y el <a className="font-semibold text-indigo-600" href="#">aviso de privacidad</a>.</span>
            </label>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 sm:col-span-2" role="alert">
                {error}
              </div>
            )}

            <button className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2" disabled={saving} type="submit">
              {saving ? 'Creando empresa y cuenta...' : 'Crear mi cuenta'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">Tu empresa y usuario administrador se guardarán de forma segura.</p>
        </div>
      </section>
    </div>
  );
}
