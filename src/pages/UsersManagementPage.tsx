import { useState } from 'react';
import { getSession } from '../shared/auth';
import { UsersTab } from '../modules/users/UsersTab';
import { TeamsTab } from '../modules/users/TeamsTab';
import { ActivityTab } from '../modules/users/ActivityTab';
import { UserSettingsTab } from '../modules/users/UserSettingsTab';

type Tab = 'users' | 'teams' | 'activity' | 'settings';

export function UsersManagementPage() {
  const session = getSession();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  if (session?.role !== 'ADMIN') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7">
        <h1 className="text-xl font-bold text-amber-950">Acceso restringido</h1>
        <p className="mt-2 text-sm text-amber-800">Solo los administradores pueden gestionar usuarios de la empresa.</p>
      </div>
    );
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'users', label: 'Usuarios' },
    { key: 'teams', label: 'Equipos' },
    { key: 'activity', label: 'Actividad' },
    { key: 'settings', label: 'Mi configuración' }
  ];

  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Gestión de equipo</p>
        <h1 className="text-3xl font-bold">Usuarios y equipos</h1>
        <p className="mt-2 text-sm text-slate-500">Administra usuarios, equipos, permisos y revisa la actividad del sistema.</p>
      </header>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-bold transition ${
              activeTab === tab.key
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'teams' && <TeamsTab />}
      {activeTab === 'activity' && <ActivityTab />}
      {activeTab === 'settings' && <UserSettingsTab />}
    </>
  );
}
