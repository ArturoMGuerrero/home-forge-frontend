import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Team, createTeam, listTeams, CompanyUser, listCompanyUsers, addTeamMember, removeTeamMember } from '../../shared/usersApi';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const labelClass = 'grid gap-2 text-sm font-semibold text-slate-700';

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', leaderId: '', memberIds: [] as string[] });

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
    try {
      const created = await createTeam({
        name: form.name,
        description: form.description || undefined,
        leaderId: form.leaderId || undefined,
        memberIds: form.memberIds.length > 0 ? form.memberIds : undefined
      });
      setTeams([...teams, created]);
      setForm({ name: '', description: '', leaderId: '', memberIds: [] });
      setShowForm(false);
      toast.success('Equipo creado correctamente.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear equipo.');
    }
  }

  async function handleAddMember(teamId: string, userId: string) {
    try {
      await addTeamMember(teamId, userId);
      const updated = teams.map(t =>
        t.id === teamId
          ? { ...t, memberIds: [...t.memberIds, userId], memberCount: t.memberCount + 1 }
          : t
      );
      setTeams(updated);
      toast.success('Miembro agregado al equipo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al agregar miembro.');
    }
  }

  async function handleRemoveMember(teamId: string, userId: string) {
    try {
      await removeTeamMember(teamId, userId);
      const updated = teams.map(t =>
        t.id === teamId
          ? { ...t, memberIds: t.memberIds.filter(id => id !== userId), memberCount: t.memberCount - 1 }
          : t
      );
      setTeams(updated);
      toast.success('Miembro removido del equipo.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al remover miembro.');
    }
  }

  if (loading) return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando equipos...</p>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Organiza a tu equipo en grupos de trabajo para asignar leads y propiedades.</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
        >
          {showForm ? 'Cancelar' : '+ Nuevo equipo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Crear nuevo equipo</h2>
          <div className="mt-5 grid gap-4">
            <label className={labelClass}>
              Nombre del equipo
              <input
                className={inputClass}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                maxLength={120}
              />
            </label>
            <label className={labelClass}>
              Descripción (opcional)
              <textarea
                className={inputClass}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                maxLength={255}
              />
            </label>
            <label className={labelClass}>
              Líder del equipo (opcional)
              <select
                className={inputClass}
                value={form.leaderId}
                onChange={e => setForm({ ...form, leaderId: e.target.value })}
              >
                <option value="">Seleccionar líder</option>
                {users.filter(u => u.active).map(user => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Miembros iniciales (opcional)
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {users.filter(u => u.active).map(user => (
                  <label key={user.id} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={form.memberIds.includes(user.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm({ ...form, memberIds: [...form.memberIds, user.id] });
                        } else {
                          setForm({ ...form, memberIds: form.memberIds.filter(id => id !== user.id) });
                        }
                      }}
                    />
                    <span className="text-sm">{user.fullName}</span>
                  </label>
                ))}
              </div>
            </label>
          </div>
          <button type="submit" className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">
            Crear equipo
          </button>
        </form>
      )}

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

      {teams.length === 0 && !showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-sm text-slate-500">No hay equipos creados aún.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white"
          >
            Crear primer equipo
          </button>
        </div>
      )}
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
  const [showAddMenu, setShowAddMenu] = useState(false);
  const leader = users.find(u => u.id === team.leaderId);
  const members = users.filter(u => team.memberIds.includes(u.id));
  const availableUsers = users.filter(u => u.active && !team.memberIds.includes(u.id));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold">{team.name}</h3>
          {team.description && <p className="mt-1 text-sm text-slate-600">{team.description}</p>}
          {leader && (
            <p className="mt-2 text-xs text-slate-500">
              Líder: <span className="font-semibold text-slate-700">{leader.fullName}</span>
            </p>
          )}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${team.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {team.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          {team.memberCount} {team.memberCount === 1 ? 'miembro' : 'miembros'}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-200"
          >
            + Agregar
          </button>
          {showAddMenu && availableUsers.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-56 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg z-10">
              {availableUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => { onAddMember(team.id, user.id); setShowAddMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {user.fullName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showMembers && members.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {member.fullName.split(' ').slice(0, 2).map(p => p[0]).join('')}
                </span>
                <span className="text-sm">{member.fullName}</span>
              </div>
              <button
                onClick={() => onRemoveMember(team.id, member.id)}
                className="text-xs text-rose-600 hover:text-rose-800"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
