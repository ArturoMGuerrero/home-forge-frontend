import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSession } from '../../auth';
import { Alert, Button, Card, Checkbox, LoadingState, Select, Switch, Textarea } from '../../../shared/ui';
import { UserSettings, getUserSettings, updateUserSettings } from '../api/usersApi';

const languageOptions = [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }];
const timezoneOptions = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Monterrey', label: 'Monterrey (GMT-6)' },
  { value: 'America/Cancun', label: 'Cancún (GMT-5)' },
  { value: 'America/Tijuana', label: 'Tijuana (GMT-8)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' }
];
const currencyOptions = [
  { value: 'MXN', label: 'MXN - Peso mexicano' },
  { value: 'USD', label: 'USD - Dólar estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' }
];
const themeOptions = [{ value: 'light', label: 'Claro' }, { value: 'dark', label: 'Oscuro' }, { value: 'auto', label: 'Automático' }];
const layoutOptions = [{ value: 'default', label: 'Predeterminado' }, { value: 'compact', label: 'Compacto' }, { value: 'detailed', label: 'Detallado' }];

type EventKey = 'notificationNewLead' | 'notificationLeadUpdate' | 'notificationAppointment' | 'notificationTeamActivity';
const eventOptions: Array<{ key: EventKey; label: string }> = [
  { key: 'notificationNewLead', label: 'Nuevo lead asignado' },
  { key: 'notificationLeadUpdate', label: 'Actualización de lead' },
  { key: 'notificationAppointment', label: 'Recordatorio de citas' },
  { key: 'notificationTeamActivity', label: 'Actividad del equipo' }
];

export function UserSettingsTab() {
  const session = getSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.userId) {
      load();
    }
  }, [session?.userId]);

  async function load() {
    if (!session?.userId) return;
    try {
      const data = await getUserSettings(session.userId);
      setSettings(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar configuración.');
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session?.userId || !settings) return;

    setSaving(true);
    try {
      const updated = await updateUserSettings(session.userId, settings);
      setSettings(updated);
      toast.success('Configuración guardada correctamente.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar configuración.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Card><LoadingState message="Cargando configuración..." /></Card>;
  if (!settings) return <Alert variant="error">No fue posible cargar la configuración.</Alert>;

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-fg">Preferencias generales</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Select label="Idioma" onChange={e => setSettings({ ...settings, language: e.target.value })} options={languageOptions} value={settings.language} />
          <Select label="Zona horaria" onChange={e => setSettings({ ...settings, timezone: e.target.value })} options={timezoneOptions} value={settings.timezone} />
          <Select label="Moneda predeterminada" onChange={e => setSettings({ ...settings, currency: e.target.value })} options={currencyOptions} value={settings.currency} />
          <Select label="Tema de la interfaz" onChange={e => setSettings({ ...settings, theme: e.target.value })} options={themeOptions} value={settings.theme} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-fg">Notificaciones</h2>
        <p className="mt-1 text-sm text-fg-subtle">Configura cómo y cuándo quieres recibir notificaciones.</p>
        <div className="mt-5 space-y-5">
          <Switch
            checked={settings.emailNotifications}
            description="Recibe resúmenes y alertas importantes por email"
            label="Notificaciones por correo"
            onChange={checked => setSettings({ ...settings, emailNotifications: checked })}
          />
          <Switch
            checked={settings.pushNotifications}
            description="Alertas en tiempo real en tu navegador"
            label="Notificaciones push"
            onChange={checked => setSettings({ ...settings, pushNotifications: checked })}
          />

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Eventos específicos</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {eventOptions.map(option => (
                <Checkbox
                  checked={settings[option.key]}
                  key={option.key}
                  label={option.label}
                  onChange={e => setSettings({ ...settings, [option.key]: e.target.checked })}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Textarea
          helperText="Esta firma se agregará automáticamente a tus correos."
          label="Firma de correo"
          onChange={e => setSettings({ ...settings, emailSignature: e.target.value })}
          placeholder={'Saludos,\n[Tu nombre]\n[Tu cargo]\n[Teléfono]'}
          rows={4}
          value={settings.emailSignature || ''}
        />
      </Card>

      <Card>
        <Select
          containerClassName="sm:max-w-xs"
          label="Diseño del dashboard"
          onChange={e => setSettings({ ...settings, dashboardLayout: e.target.value })}
          options={layoutOptions}
          value={settings.dashboardLayout}
        />
      </Card>

      <div className="flex justify-end">
        <Button loading={saving} type="submit">{saving ? 'Guardando...' : 'Guardar configuración'}</Button>
      </div>
    </form>
  );
}
