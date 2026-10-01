import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset } from '../api/authApi';
import { Alert, Button, buttonClasses, Input } from '../../../shared/ui';
import { AuthHeading, AuthLayout } from '../components/AuthLayout';

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
    <AuthLayout
      description="Te enviaremos un enlace seguro para que elijas una nueva contraseña."
      eyebrow="Recuperación de acceso"
      headline="Recupera el acceso a tu cuenta de forma segura."
    >
      <Link className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-fg-subtle transition hover:text-fg" to="/login">
        <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al inicio de sesión
      </Link>

      {!success ? (
        <>
          <AuthHeading description="Ingresa tu correo electrónico y te enviaremos un enlace seguro para continuar." eyebrow="Recuperar contraseña" title="¿Olvidaste tu contraseña?" />

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
            <Button fullWidth loading={saving} size="lg" type="submit">
              {saving ? 'Enviando...' : 'Enviar enlace seguro'}
            </Button>
          </form>
        </>
      ) : (
        <Alert
          actions={<Link className={buttonClasses({ fullWidth: true })} to="/login">Volver al inicio de sesión</Link>}
          title="Revisa tu correo"
          variant="success"
        >
          Si existe una cuenta asociada, recibirás un enlace que será válido durante 30 minutos.
        </Alert>
      )}

      <p className="mt-6 text-center text-sm text-fg-subtle">
        ¿Recordaste tu contraseña?{' '}
        <Link className="font-semibold text-primary-fg hover:underline" to="/login">
          Iniciar sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
