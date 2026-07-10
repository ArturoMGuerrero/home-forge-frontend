import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '../shared/ui/Tabs';
import { Card } from '../shared/ui/Card';
import { Input } from '../shared/ui/Input';
import { Button } from '../shared/ui/Button';
import { Icon } from '../shared/Icon';
import { Avatar } from '../shared/ui/Avatar';
import { ThemeSelector } from '../components/ThemeSelector';
import { getSession } from '../shared/auth';
import toast from 'react-hot-toast';

export function AccountSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const session = getSession();

  const tabs = [
    { id: 'profile', label: t('accountSettings.tabs.profile'), icon: <Icon className="size-4" name="user" /> },
    { id: 'security', label: t('accountSettings.tabs.security'), icon: <Icon className="size-4" name="lock" /> },
    { id: 'appearance', label: t('accountSettings.tabs.appearance'), icon: <Icon className="size-4" name="palette" /> }
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('accountSettings.title')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('accountSettings.subtitle')}</p>
      </header>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" />

      <div className="mt-8">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  const session = getSession();
  const [firstName, setFirstName] = useState(session?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(session?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(session?.email || '');

  const handleSave = () => {
    toast.success('Profile updated successfully');
  };

  return (
    <Card>
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Profile Information</h2>
          <p className="text-sm text-slate-500">Update your personal information and profile picture</p>
        </div>

        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <Avatar
              name={session?.name || 'User'}
              size="xl"
              className="ring-4 ring-slate-100"
            />
          </div>

          <div className="flex-1">
            <button
              type="button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <Icon className="size-4 inline mr-2" name="upload" />
              Change Avatar
            </button>
            <p className="mt-2 text-xs text-slate-500">
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              First Name
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jorge"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Last Name
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Moreno"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" name="envelope" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="jorge.moreno@autozone.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="ghost">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Icon className="size-4" name="save" />
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    // TODO: Implementar cambio de contraseña con API
    toast.success('Contraseña actualizada correctamente');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-100">
              <Icon className="size-6 text-indigo-600" name="shield" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Gestión de Contraseña</h3>
              <p className="text-sm text-slate-600 mb-4">
                Mantén tu cuenta segura actualizando tu contraseña regularmente. Usa una combinación de letras, números y símbolos.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon className="size-5 text-green-600" name="check" />
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon className="size-5 text-green-600" name="check" />
                  <span>Encriptación de extremo a extremo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon className="size-5 text-green-600" name="check" />
                  <span>Verificación de seguridad avanzada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Cambiar contraseña</h3>
            <p className="text-sm text-slate-500 mb-4">
              Actualiza tu contraseña para mantener tu cuenta segura.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña actual
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nueva contraseña
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirmar nueva contraseña
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="ghost">
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleChangePassword}>
              <Icon className="size-4" name="shield" />
              Actualizar contraseña
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 p-4">
            <Icon className="size-5 text-blue-600 shrink-0 mt-0.5" name="info" />
            <p className="text-sm text-blue-800">
              Después de cambiar tu contraseña, deberás iniciar sesión nuevamente con tus nuevas credenciales.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AppearanceTab() {
  return (
    <Card>
      <ThemeSelector />
    </Card>
  );
}
