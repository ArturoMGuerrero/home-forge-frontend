import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Alert, Avatar, Button, buttonClasses, Card, Input, PageHeader, Tabs } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';
import { ThemeSelector } from '../components/ThemeSelector';
import { getSession } from '../../auth';
import { getUserAvatar, setUserAvatar } from '../api/accountPreferences';
import { changeAccountPassword, getAccount, updateAccountProfile } from '../api/accountApi';

export function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { id: 'profile', label: 'Perfil personal', icon: <Icon className="size-4" name="user" /> },
    { id: 'security', label: 'Seguridad', icon: <Icon className="size-4" name="lock" /> },
    { id: 'appearance', label: 'Apariencia', icon: <Icon className="size-4" name="palette" /> }
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        actions={
          <Link className={buttonClasses({ variant: 'tertiary' })} to="/app/configuracion/empresa">
            <Icon className="size-4" name="properties" />Logo y perfil de empresa
          </Link>
        }
        eyebrow="Preferencias personales"
        subtitle="Administra tu identidad personal, seguridad y apariencia de HomeForge."
        title="Mi cuenta"
      />

      <Alert title="Cuenta personal">El avatar te identifica dentro del equipo. El logo, nombre comercial y datos públicos se administran en Configuración de empresa.</Alert>

      <div className="mt-6"><Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} /></div>
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
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState({ firstName, lastName, phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAccount()
      .then(profile => {
        const [first = '', ...rest] = profile.fullName.split(' ');
        const loaded = { firstName: first, lastName: rest.join(' '), phone: profile.phoneE164 ?? '' };
        setFirstName(loaded.firstName);
        setLastName(loaded.lastName);
        setPhone(loaded.phone);
        setSaved(loaded);
      })
      .catch(() => toast.error('No fue posible cargar tu perfil.'));
  }, []);

  async function saveProfile() {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (fullName.length < 2) return toast.error('Escribe tu nombre.');
    setSaving(true);
    try {
      await updateAccountProfile({ fullName, phoneE164: phone.trim() });
      setSaved({ firstName, lastName, phone });
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible guardar tu perfil.');
    } finally {
      setSaving(false);
    }
  }

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
        <div><h2 className="text-lg font-semibold text-fg">Perfil personal</h2><p className="mt-1 text-sm text-fg-subtle">Información utilizada para identificarte dentro del equipo.</p></div>
        <div className="flex flex-col gap-4 rounded-2xl bg-surface-muted p-4 sm:flex-row sm:items-center">
          <Avatar src={avatar || undefined} name={session?.name || 'Usuario'} size="2xl" className="shrink-0 ring-4 ring-surface" />
          <div>
            <h3 className="font-semibold text-fg">Avatar personal</h3>
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
          <Input helperText="Formato internacional, por ejemplo +526141234567." label="Teléfono" onChange={event => setPhone(event.target.value)} placeholder="+526141234567" type="tel" value={phone} />
          <Input disabled helperText="El correo está asociado a tus credenciales de acceso." label="Correo electrónico" type="email" value={session?.email || ''} />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button onClick={() => { setFirstName(saved.firstName); setLastName(saved.lastName); setPhone(saved.phone); }} variant="ghost">Cancelar cambios</Button>
          <Button icon={<Icon className="size-4" name="save" />} loading={saving} onClick={saveProfile}>Guardar cambios</Button>
        </div>
      </div>
    </Card>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);

  async function changePassword() {
    if (!currentPassword) return toast.error('Escribe tu contraseña actual.');
    if (newPassword !== confirmPassword) return toast.error('Las contraseñas no coinciden.');
    if (newPassword.length < 8) return toast.error('La contraseña debe tener al menos 8 caracteres.');
    setChanging(true);
    try {
      await changeAccountPassword(currentPassword, newPassword);
      toast.success('Contraseña actualizada. Cerramos tu sesión en los demás dispositivos.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible cambiar la contraseña.');
    } finally {
      setChanging(false);
    }
  }
  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft"><Icon className="size-5 text-primary-fg" name="shield" /></span><div><h2 className="text-lg font-semibold text-fg">Seguridad de acceso</h2><p className="mt-1 text-sm text-fg-subtle">Utiliza una contraseña única de al menos ocho caracteres. Al cambiarla se cierra tu sesión en los demás dispositivos.</p></div></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input label="Contraseña actual" onChange={event => setCurrentPassword(event.target.value)} type="password" value={currentPassword} /></div>
          <Input label="Nueva contraseña" onChange={event => setNewPassword(event.target.value)} type="password" value={newPassword} />
          <Input label="Confirmar contraseña" onChange={event => setConfirmPassword(event.target.value)} type="password" value={confirmPassword} />
        </div>
        <div className="flex justify-end border-t border-border pt-5"><Button icon={<Icon className="size-4" name="shield" />} loading={changing} onClick={changePassword}>Actualizar contraseña</Button></div>
      </div>
    </Card>
  );
}
