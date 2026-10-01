import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isAuthenticated, login } from '../api/authApi';
import { Button, Input } from '../../../shared/ui';
import { AuthHeading, AuthLayout } from '../components/AuthLayout';

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
    <AuthLayout
      description="Prospectos, inventario y publicación de propiedades en un solo lugar."
      eyebrow="Operación inmobiliaria"
      headline="Convierte cada oportunidad en una venta mejor gestionada."
    >
      <AuthHeading description="Ingresa con la cuenta registrada para tu empresa." eyebrow="Acceso privado" title="Bienvenido de nuevo" />

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
          <Link className="absolute right-0 top-0 z-10 text-xs font-semibold text-primary-fg hover:underline" to="/recuperar-contraseña">
            ¿Olvidaste tu contraseña?
          </Link>
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
        <Button fullWidth loading={saving} size="lg" type="submit">
          {saving ? 'Verificando...' : 'Entrar al sistema'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-subtle">
        ¿Aún no tienes cuenta?{' '}
        <Link className="font-semibold text-primary-fg hover:underline" to="/registro">
          Crear una cuenta
        </Link>
      </p>
      <div className="mt-8 border-t border-border pt-6 text-center">
        <Link className="text-sm font-medium text-fg-muted hover:text-fg" to="/propiedades">
          Ver propiedades sin iniciar sesión →
        </Link>
      </div>
    </AuthLayout>
  );
}
