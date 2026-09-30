import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import { Alert, Button, Input } from '../../../shared/ui';
import { AuthHeading, AuthLayout } from '../components/AuthLayout';

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
    <AuthLayout
      description="Asegúrate de que sea fácil de recordar pero difícil de adivinar."
      eyebrow="Nueva contraseña"
      headline="Crea una contraseña segura para tu cuenta."
    >
      <AuthHeading description="Ingresa tu nueva contraseña para completar el proceso de recuperación." eyebrow="Nueva contraseña" title="Restablecer contraseña" />

      {!token && (
        <Alert className="mt-6" title="Enlace incompleto" variant="warning">
          Este enlace no contiene un token válido. Solicita un nuevo enlace de recuperación.
        </Alert>
      )}

      <form className="mt-8 space-y-5" onSubmit={submit}>
        <Input
          autoComplete="new-password"
          helperText={newPassword && newPassword.length < 8 ? `Te faltan ${8 - newPassword.length} caracteres.` : 'Usa al menos 8 caracteres.'}
          label="Nueva contraseña"
          minLength={8}
          onChange={event => setNewPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          type="password"
          value={newPassword}
        />

        <Input
          autoComplete="new-password"
          error={confirmPassword && newPassword !== confirmPassword ? 'Las contraseñas no coinciden.' : undefined}
          helperText={confirmPassword && newPassword === confirmPassword ? 'Las contraseñas coinciden.' : undefined}
          label="Confirmar nueva contraseña"
          minLength={8}
          onChange={event => setConfirmPassword(event.target.value)}
          placeholder="Escribe la contraseña nuevamente"
          required
          type="password"
          value={confirmPassword}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <Button
          disabled={newPassword !== confirmPassword || newPassword.length < 8 || !token}
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
    </AuthLayout>
  );
}
