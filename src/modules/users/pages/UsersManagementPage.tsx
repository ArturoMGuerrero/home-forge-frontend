import { useState } from 'react';
import { getSession } from '../../auth';
import { Alert, PageHeader, Tabs } from '../../../shared/ui';
import { UsersTab } from '../components/UsersTab';
import { TeamsTab } from '../components/TeamsTab';
import { ActivityTab } from '../components/ActivityTab';
import { UserSettingsTab } from '../components/UserSettingsTab';

type Tab = 'users' | 'teams' | 'activity' | 'settings';

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'users', label: 'Usuarios' },
  { id: 'teams', label: 'Equipos' },
  { id: 'activity', label: 'Actividad' },
  { id: 'settings', label: 'Mi configuración' }
];

export function UsersManagementPage() {
  const session = getSession();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  if (session?.role !== 'ADMIN') {
    return (
      <Alert title="Acceso restringido" variant="warning">
        Solo los administradores pueden gestionar usuarios de la empresa.
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Gestión de equipo"
        subtitle="Administra usuarios, equipos, permisos y revisa la actividad del sistema."
        title="Usuarios y equipos"
      >
        <Tabs activeTab={activeTab} onChange={id => setActiveTab(id as Tab)} tabs={tabs} />
      </PageHeader>

      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'teams' && <TeamsTab />}
      {activeTab === 'activity' && <ActivityTab />}
      {activeTab === 'settings' && <UserSettingsTab />}
    </>
  );
}
