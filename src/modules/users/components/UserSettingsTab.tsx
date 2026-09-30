import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSession } from '../../auth';
import { UserSettings, getUserSettings, updateUserSettings } from '../api/usersApi';

const inputClass = 'w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-line';
const labelClass = 'grid gap-2 text-sm font-semibold text-fg-muted';

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

  if (loading) return <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle">Cargando configuración...</p>;
  if (!settings) return <p className="rounded-2xl border border-danger-line bg-danger-soft p-7 text-sm text-danger-fg">No fue posible cargar la configuración.</p>;

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-bold">Preferencias generales</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Idioma
            <select
              className={inputClass}
              value={settings.language}
              onChange={e => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className={labelClass}>
            Zona horaria
            <select
              className={inputClass}
              value={settings.timezone}
              onChange={e => setSettings({ ...settings, timezone: e.target.value })}
            >
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="America/Monterrey">Monterrey (GMT-6)</option>
              <option value="America/Cancun">Cancún (GMT-5)</option>
              <option value="America/Tijuana">Tijuana (GMT-8)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
            </select>
          </label>
          <label className={labelClass}>
            Moneda predeterminada
            <select
              className={inputClass}
              value={settings.currency}
              onChange={e => setSettings({ ...settings, currency: e.target.value })}
            >
              <option value="MXN">MXN - Peso mexicano</option>
              <option value="USD">USD - Dólar estadounidense</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </label>
          <label className={labelClass}>
            Tema de la interfaz
            <select
              className={inputClass}
              value={settings.theme}
              onChange={e => setSettings({ ...settings, theme: e.target.value })}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="auto">Automático</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-bold">Notificaciones</h2>
        <p className="mt-1 text-sm text-fg-muted">Configura cómo y cuándo quieres recibir notificaciones.</p>
        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="size-5 rounded border-border-strong text-primary-fg focus:ring-2 focus:ring-primary-line"
            />
            <div>
              <p className="text-sm font-semibold text-fg">Notificaciones por correo</p>
              <p className="text-xs text-fg-subtle">Recibe resúmenes y alertas importantes por email</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={e => setSettings({ ...settings, pushNotifications: e.target.checked })}
              className="size-5 rounded border-border-strong text-primary-fg focus:ring-2 focus:ring-primary-line"
            />
            <div>
              <p className="text-sm font-semibold text-fg">Notificaciones push</p>
              <p className="text-xs text-fg-subtle">Alertas en tiempo real en tu navegador</p>
            </div>
          </label>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-fg-subtle">Eventos específicos</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notificationNewLead}
                  onChange={e => setSettings({ ...settings, notificationNewLead: e.target.checked })}
                  className="size-4 rounded border-border-strong text-primary-fg"
                />
                <span className="text-sm text-fg-muted">Nuevo lead asignado</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notificationLeadUpdate}
                  onChange={e => setSettings({ ...settings, notificationLeadUpdate: e.target.checked })}
                  className="size-4 rounded border-border-strong text-primary-fg"
                />
                <span className="text-sm text-fg-muted">Actualización de lead</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notificationAppointment}
                  onChange={e => setSettings({ ...settings, notificationAppointment: e.target.checked })}
                  className="size-4 rounded border-border-strong text-primary-fg"
                />
                <span className="text-sm text-fg-muted">Recordatorio de citas</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.notificationTeamActivity}
                  onChange={e => setSettings({ ...settings, notificationTeamActivity: e.target.checked })}
                  className="size-4 rounded border-border-strong text-primary-fg"
                />
                <span className="text-sm text-fg-muted">Actividad del equipo</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-bold">Firma de correo</h2>
        <p className="mt-1 text-sm text-fg-muted">Esta firma se agregará automáticamente a tus correos.</p>
        <div className="mt-4">
          <textarea
            className={inputClass}
            rows={4}
            placeholder="Saludos,&#10;[Tu nombre]&#10;[Tu cargo]&#10;[Teléfono]"
            value={settings.emailSignature || ''}
            onChange={e => setSettings({ ...settings, emailSignature: e.target.value })}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-bold">Dashboard</h2>
        <div className="mt-4">
          <label className={labelClass}>
            Diseño del dashboard
            <select
              className={inputClass}
              value={settings.dashboardLayout}
              onChange={e => setSettings({ ...settings, dashboardLayout: e.target.value })}
            >
              <option value="default">Predeterminado</option>
              <option value="compact">Compacto</option>
              <option value="detailed">Detallado</option>
            </select>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </form>
  );
}
