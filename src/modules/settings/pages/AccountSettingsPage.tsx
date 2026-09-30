import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Tabs } from '../../../shared/ui/Tabs';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Icon } from '../../../shared/Icon';
import { Avatar } from '../../../shared/ui/Avatar';
import { ThemeSelector } from '../components/ThemeSelector';
import { getSession } from '../../auth';
import { getUserAvatar, setUserAvatar } from '../api/accountPreferences';

export function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { id: 'profile', label: 'Perfil personal', icon: <Icon className="size-4" name="user" /> },
    { id: 'security', label: 'Seguridad', icon: <Icon className="size-4" name="lock" /> },
    { id: 'appearance', label: 'Apariencia', icon: <Icon className="size-4" name="palette" /> }
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">Preferencias personales</p>
          <h1 className="text-2xl font-bold text-fg sm:text-3xl">Mi cuenta</h1>
          <p className="mt-2 text-sm text-fg-subtle">Administra tu identidad personal, seguridad y apariencia de HomeForge.</p>
        </div>
        <Link className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-fg-muted shadow-sm transition hover:border-primary-line hover:text-primary-fg sm:self-auto" to="/app/configuracion/empresa">
          <Icon className="size-4" name="properties" />Logo y perfil de empresa
        </Link>
      </header>

      <div className="rounded-2xl border border-info-line bg-info-soft p-4 text-sm text-info-fg">
        <strong>Cuenta personal:</strong> el avatar te identifica dentro del equipo. El logo, nombre comercial y datos públicos se administran en Configuración de empresa.
      </div>

      <div className="mt-6"><Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" /></div>
      <div className="mt-6">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'appearance' && <Card><ThemeSelector /></Card>}
      </div>
    </div>
  );
}

function ProfileTab() {
  const session = getSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(() => getUserAvatar(session?.userId));
  const [firstName, setFirstName] = useState(session?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(session?.name?.split(' ').slice(1).join(' ') || '');

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Selecciona una imagen válida.');
    if (file.size > 2 * 1024 * 1024) return toast.error('La imagen no debe superar 2 MB.');
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result);
      setUserAvatar(session?.userId, value);
      setAvatar(value);
      toast.success('Avatar personal actualizado en este dispositivo.');
    };
    reader.readAsDataURL(file);
  }

  return (
    <Card>
      <div className="space-y-7">
        <div><h2 className="text-lg font-bold text-fg">Perfil personal</h2><p className="mt-1 text-sm text-fg-subtle">Información utilizada para identificarte dentro del equipo.</p></div>
        <div className="flex flex-col gap-4 rounded-2xl bg-surface-muted p-4 sm:flex-row sm:items-center">
          <Avatar src={avatar || undefined} name={session?.name || 'Usuario'} size="2xl" className="shrink-0 ring-4 ring-surface" />
          <div>
            <h3 className="font-bold text-fg">Avatar personal</h3>
            <p className="mt-1 text-sm text-fg-subtle">No es el logo de la empresa. Solo se muestra a los integrantes de tu organización.</p>
            <input accept="image/png,image/jpeg,image/webp" className="hidden" onChange={selectAvatar} ref={fileRef} type="file" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button icon={<Icon className="size-4" name="upload" />} onClick={() => fileRef.current?.click()} size="sm">Cambiar avatar</Button>
              {avatar && <Button onClick={() => { setUserAvatar(session?.userId, ''); setAvatar(''); }} size="sm" variant="tertiary">Usar iniciales</Button>}
            </div>
            <p className="mt-2 text-xs text-fg-subtle">JPG, PNG o WebP. Máximo 2 MB.</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Nombre" onChange={event => setFirstName(event.target.value)} value={firstName} />
          <Input label="Apellidos" onChange={event => setLastName(event.target.value)} value={lastName} />
          <div className="sm:col-span-2"><Input disabled helperText="El correo está asociado a tus credenciales de acceso." label="Correo electrónico" type="email" value={session?.email || ''} /></div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button onClick={() => { setFirstName(session?.name?.split(' ')[0] || ''); setLastName(session?.name?.split(' ').slice(1).join(' ') || ''); }} variant="ghost">Cancelar cambios</Button>
          <Button onClick={() => toast.success('Preferencias personales guardadas.')}><Icon className="size-4" name="save" />Guardar cambios</Button>
        </div>
      </div>
    </Card>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  function changePassword() {
    if (newPassword !== confirmPassword) return toast.error('Las contraseñas no coinciden.');
    if (newPassword.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres.');
    toast.success('Solicitud de cambio de contraseña preparada.');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  }
  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-muted"><Icon className="size-5 text-primary-fg" name="shield" /></span><div><h2 className="text-lg font-bold">Seguridad de acceso</h2><p className="mt-1 text-sm text-fg-subtle">Utiliza una contraseña única de al menos ocho caracteres.</p></div></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input label="Contraseña actual" onChange={event => setCurrentPassword(event.target.value)} type="password" value={currentPassword} /></div>
          <Input label="Nueva contraseña" onChange={event => setNewPassword(event.target.value)} type="password" value={newPassword} />
          <Input label="Confirmar contraseña" onChange={event => setConfirmPassword(event.target.value)} type="password" value={confirmPassword} />
        </div>
        <div className="flex justify-end border-t border-border pt-5"><Button onClick={changePassword}><Icon className="size-4" name="shield" />Actualizar contraseña</Button></div>
      </div>
    </Card>
  );
}
