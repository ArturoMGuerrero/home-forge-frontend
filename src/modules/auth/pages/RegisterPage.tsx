import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAuthenticated, register } from '../api/authApi';
import { Button, Checkbox, Input } from '../../../shared/ui';
import { AuthHeading, AuthLayout } from '../components/AuthLayout';

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
    <AuthLayout
      eyebrow="Empieza hoy"
      footnote="Sin tarjeta de crédito. Configuración en minutos."
      headline="Tu operación inmobiliaria, en orden desde el primer día."
      highlights={[
        'Administra prospectos y seguimientos',
        'Controla tu inventario de propiedades',
        'Centraliza la operación de tu equipo'
      ]}
      width="xl"
    >
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AuthHeading description="Registra tu empresa y la cuenta del administrador principal." eyebrow="Crea tu espacio de trabajo" title="Comienza con HomeForge" />
        <p className="shrink-0 text-sm text-fg-subtle">
          ¿Ya tienes cuenta?{' '}
          <Link className="font-semibold text-primary-fg hover:underline" to="/login">Inicia sesión</Link>
        </p>
      </div>

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

        <Button className="sm:col-span-2" fullWidth loading={saving} size="lg" type="submit">
          {saving ? 'Creando empresa y cuenta...' : 'Crear mi cuenta'}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-fg-subtle">Tu empresa y usuario administrador se guardarán de forma segura.</p>
    </AuthLayout>
  );
}
