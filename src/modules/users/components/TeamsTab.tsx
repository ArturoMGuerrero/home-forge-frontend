import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Avatar, Badge, Button, Card, Checkbox, EmptyState, Input, LoadingState, Menu, Modal, Select, Textarea } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';
import { Team, createTeam, listTeams, CompanyUser, listCompanyUsers, addTeamMember, removeTeamMember } from '../api/usersApi';

const emptyForm = { name: '', description: '', leaderId: '', memberIds: [] as string[] };

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [teamsData, usersData] = await Promise.all([
        listTeams(),
        listCompanyUsers()
      ]);
      setTeams(teamsData);
      setUsers(usersData.users);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar equipos.');
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const created = await createTeam({
        name: form.name,
        description: form.description || undefined,
        leaderId: form.leaderId || undefined,
        memberIds: form.memberIds.length > 0 ? form.memberIds : undefined
      });
      setTeams([...teams, created]);
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Equipo creado correctamente.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear equipo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMember(teamId: string, userId: string) {
    try {
      await addTeamMember(teamId, userId);
      setTeams(current => current.map(t =>
        t.id === teamId
          ? { ...t, memberIds: [...t.memberIds, userId], memberCount: t.memberCount + 1 }
          : t
      ));
      toast.success('Miembro agregado al equipo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al agregar miembro.');
    }
  }

  async function handleRemoveMember(teamId: string, userId: string) {
    try {
      await removeTeamMember(teamId, userId);
      setTeams(current => current.map(t =>
        t.id === teamId
          ? { ...t, memberIds: t.memberIds.filter(id => id !== userId), memberCount: t.memberCount - 1 }
          : t
      ));
      toast.success('Miembro removido del equipo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al remover miembro.');
    }
  }

  function toggleMember(userId: string, checked: boolean) {
    setForm(current => ({
      ...current,
      memberIds: checked ? [...current.memberIds, userId] : current.memberIds.filter(id => id !== userId)
    }));
  }

  if (loading) return <Card><LoadingState message="Cargando equipos..." /></Card>;

  const activeUsers = users.filter(u => u.active);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fg-subtle">Organiza a tu equipo en grupos de trabajo para asignar leads y propiedades.</p>
        <Button icon={<Icon className="size-4" name="plus" />} onClick={() => setShowForm(true)}>Nuevo equipo</Button>
      </div>

      {teams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              users={users}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <EmptyState
            actionLabel="Crear primer equipo"
            description="Agrupa a tus asesores para repartir prospectos y propiedades."
            icon={<Icon name="users" />}
            onAction={() => setShowForm(true)}
            title="No hay equipos creados aún"
          />
        </Card>
      )}

      <Modal
        footer={
          <>
            <Button disabled={saving} onClick={() => setShowForm(false)} variant="tertiary">Cancelar</Button>
            <Button form="create-team-form" loading={saving} type="submit">Crear equipo</Button>
          </>
        }
        isOpen={showForm}
        onClose={() => !saving && setShowForm(false)}
        title="Crear nuevo equipo"
      >
        <form className="grid gap-4" id="create-team-form" onSubmit={submit}>
          <Input label="Nombre del equipo" maxLength={120} onChange={e => setForm({ ...form, name: e.target.value })} required value={form.name} />
          <Textarea label="Descripción (opcional)" maxLength={255} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} value={form.description} />
          <Select
            label="Líder del equipo (opcional)"
            onChange={e => setForm({ ...form, leaderId: e.target.value })}
            options={activeUsers.map(user => ({ value: user.id, label: user.fullName }))}
            placeholder="Seleccionar líder"
            value={form.leaderId}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-fg-muted">Miembros iniciales (opcional)</legend>
            <div className="max-h-48 space-y-2.5 overflow-y-auto rounded-xl border border-border p-3">
              {activeUsers.map(user => (
                <Checkbox
                  checked={form.memberIds.includes(user.id)}
                  key={user.id}
                  label={user.fullName}
                  onChange={e => toggleMember(user.id, e.target.checked)}
                />
              ))}
            </div>
          </fieldset>
        </form>
      </Modal>
    </div>
  );
}

function TeamCard({ team, users, onAddMember, onRemoveMember }: {
  team: Team;
  users: CompanyUser[];
  onAddMember: (teamId: string, userId: string) => void;
  onRemoveMember: (teamId: string, userId: string) => void;
}) {
  const [showMembers, setShowMembers] = useState(false);
  const leader = users.find(u => u.id === team.leaderId);
  const members = users.filter(u => team.memberIds.includes(u.id));
  const availableUsers = users.filter(u => u.active && !team.memberIds.includes(u.id));

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-fg">{team.name}</h3>
          {team.description && <p className="mt-1 text-sm text-fg-subtle">{team.description}</p>}
          {leader && (
            <p className="mt-2 text-xs text-fg-subtle">
              Líder: <span className="font-medium text-fg-muted">{leader.fullName}</span>
            </p>
          )}
        </div>
        <Badge dot variant={team.active ? 'success' : 'neutral'}>{team.active ? 'Activo' : 'Inactivo'}</Badge>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          aria-expanded={showMembers}
          className="flex-1 justify-between"
          iconRight={<svg aria-hidden="true" className={`size-4 transition ${showMembers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
          onClick={() => setShowMembers(!showMembers)}
          size="sm"
          variant="tertiary"
        >
          {team.memberCount} {team.memberCount === 1 ? 'miembro' : 'miembros'}
        </Button>
        <Menu
          emptyLabel="Todos los usuarios ya son miembros"
          items={availableUsers.map(user => ({ label: user.fullName, onSelect: () => onAddMember(team.id, user.id) }))}
          label={`Agregar miembro a ${team.name}`}
          trigger={<><Icon className="size-3.5" name="plus" />Agregar</>}
        />
      </div>

      {showMembers && members.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-border pt-4">
          {members.map(member => (
            <li key={member.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={member.fullName} size="sm" />
                <span className="truncate text-sm text-fg">{member.fullName}</span>
              </div>
              <Button onClick={() => onRemoveMember(team.id, member.id)} size="sm" variant="danger-ghost">Remover</Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
