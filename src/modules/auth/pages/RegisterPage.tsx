import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAuthenticated, register } from '../api/authApi';
import { Button, Checkbox, Input } from '../../../shared/ui';

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

  if (isAuthenticated()) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos para crear tu cuenta.');
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
      toast.success('Cuenta creada exitosamente');
      navigate('/app');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible crear la cuenta.');
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

          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Crea tu espacio de trabajo</p>
          <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">Comienza con HomeForge</h2>
          <p className="mt-2 text-sm text-slate-500">Registra tu empresa y la cuenta del administrador principal.</p>

          <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
            <Input autoComplete="name" label="Nombre completo" onChange={event => setName(event.target.value)} placeholder="Jorge Martínez" required value={name} />
            <Input autoComplete="organization" label="Empresa" onChange={event => setCompany(event.target.value)} placeholder="Inmobiliaria Horizonte" required value={company} />
            <Input autoComplete="email" label="Correo electrónico" onChange={event => setEmail(event.target.value)} placeholder="jorge@empresa.com" required type="email" value={email} />
            <Input autoComplete="tel" helperText="Incluye el código de país, por ejemplo +52." label="Teléfono" onChange={event => setPhone(event.target.value)} pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" required type="tel" value={phone} />
            <Input autoComplete="new-password" helperText="Usa al menos 8 caracteres." label="Contraseña" minLength={8} onChange={event => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" required type="password" value={password} />
            <Input autoComplete="new-password" error={passwordConfirmation && password !== passwordConfirmation ? 'Las contraseñas no coinciden.' : undefined} label="Confirmar contraseña" minLength={8} onChange={event => setPasswordConfirmation(event.target.value)} placeholder="Repite tu contraseña" required type="password" value={passwordConfirmation} />

            <div className="sm:col-span-2">
              <Checkbox checked={acceptedTerms} label="Acepto los términos de servicio y el aviso de privacidad." onChange={event => setAcceptedTerms(event.target.checked)} required />
            </div>

            <Button className="sm:col-span-2" disabled={saving} fullWidth loading={saving} size="lg" type="submit">
              {saving ? 'Creando empresa y cuenta...' : 'Crear mi cuenta'}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">Tu empresa y usuario administrador se guardarán de forma segura.</p>
        </div>
      </section>
    </div>
  );
}
