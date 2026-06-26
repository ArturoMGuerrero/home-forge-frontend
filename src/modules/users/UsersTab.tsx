import { FormEvent, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSession } from '../../shared/auth';
import { CompanyUser, createCompanyUser, listCompanyUsers, UserListResponse, updateUser, changeUserStatus, changeUserRole } from '../../shared/usersApi';
import { SubscriptionRestrictions } from '../../shared/subscriptionRestrictions';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const labelClass = 'grid gap-2 text-sm font-semibold text-slate-700';

export function UsersTab() {
  const session = getSession();
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canEdit: true, canExport: true, canUploadMultiple: true, canInviteUsers: true, level: 'NONE' };
  const [data, setData] = useState<UserListResponse | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneE164: '', role: 'AGENT' as 'ADMIN' | 'AGENT', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    listCompanyUsers()
      .then(setData)
      .catch(requestError => toast.error(requestError instanceof Error ? requestError.message : 'No fue posible cargar los usuarios.'))
      .finally(() => setLoading(false));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!restrictions.canInviteUsers) {
      toast.error('Tu plan no permite invitar nuevos usuarios. Actualiza tu suscripción para continuar.');
      return;
    }

    setSaving(true);
    try {
      const created = await createCompanyUser({
        ...form,
        phoneE164: form.phoneE164.trim() || undefined
      });
      setData(current => current ? { ...current, usedSeats: current.usedSeats + 1, users: [...current.users, created] } : current);
      setForm({ fullName: '', email: '', phoneE164: '', role: 'AGENT', password: '' });
      toast.success('Usuario creado. Ya puede iniciar sesión con su correo y contraseña.');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible crear el usuario.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(user: CompanyUser) {
    setEditingUser(user);
  }

  async function handleToggleStatus(user: CompanyUser) {
    try {
      await changeUserStatus(user.id, !user.active);
      setData(current => current ? {
        ...current,
        users: current.users.map(u => u.id === user.id ? { ...u, active: !u.active } : u)
      } : current);
      toast.success(`Usuario ${!user.active ? 'activado' : 'desactivado'} correctamente.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar estado del usuario.');
    }
  }

  async function handleChangeRole(user: CompanyUser, newRole: 'ADMIN' | 'AGENT') {
    try {
      await changeUserRole(user.id, newRole);
      setData(current => current ? {
        ...current,
        users: current.users.map(u => u.id === user.id ? { ...u, role: newRole } : u)
      } : current);
      toast.success('Rol actualizado correctamente.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar rol.');
    }
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingUser) return;

    try {
      const updated = await updateUser(editingUser.id, {
        fullName: editingUser.fullName,
        email: editingUser.email,
        phoneE164: editingUser.phoneE164 || undefined
      });
      setData(current => current ? {
        ...current,
        users: current.users.map(u => u.id === updated.id ? updated : u)
      } : current);
      setEditingUser(null);
      toast.success('Usuario actualizado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar usuario.');
    }
  }

  if (loading) return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando usuarios...</p>;
  if (!data) return <p className="rounded-2xl border border-rose-200 bg-rose-50 p-7 text-sm text-rose-800">No fue posible consultar los usuarios.</p>;

  const limitReached = data.usedSeats >= data.userLimit;
  const canInvite = restrictions.canInviteUsers && !limitReached;

  return (
    <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold">Equipo actual ({data.users.length})</h2>
          <div className="text-xs">
            <span className="font-bold text-indigo-600">{data.usedSeats} de {data.userLimit}</span>
            <span className="text-slate-500"> usuarios</span>
          </div>
        </div>
        {data.users.map(user => (
          <UserRow
            key={user.id}
            user={user}
            current={user.id === session?.userId}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onChangeRole={handleChangeRole}
          />
        ))}
      </section>

      <aside className="space-y-6">
        {!restrictions.canInviteUsers ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Función bloqueada</span>
            <h2 className="mt-2 text-xl font-bold text-rose-950">No puedes invitar usuarios</h2>
            <p className="mt-3 text-sm leading-6 text-rose-800">Tu plan actual no permite invitar nuevos usuarios.</p>
            <Link className="mt-5 inline-flex rounded-xl bg-rose-900 px-4 py-3 text-sm font-bold text-white" to="/app/planes">Actualizar plan</Link>
          </section>
        ) : limitReached ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Límite alcanzado</span>
            <h2 className="mt-2 text-xl font-bold text-amber-950">Tu plan permite {data.userLimit} usuarios</h2>
            <p className="mt-3 text-sm leading-6 text-amber-800">Actualiza a Pro para administrar hasta 10 integrantes.</p>
            <Link className="mt-5 inline-flex rounded-xl bg-amber-900 px-4 py-3 text-sm font-bold text-white" to="/app/planes">Comparar planes</Link>
          </section>
        ) : (
          <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">Nuevo acceso</p>
            <h2 className="mt-1 text-xl font-bold">Agregar usuario</h2>
            <div className="mt-5 grid gap-4">
              <label className={labelClass}>Nombre completo<input className={inputClass} maxLength={180} onChange={event => setForm({ ...form, fullName: event.target.value })} required value={form.fullName} /></label>
              <label className={labelClass}>Correo<input className={inputClass} onChange={event => setForm({ ...form, email: event.target.value })} required type="email" value={form.email} /></label>
              <label className={labelClass}>Teléfono<input className={inputClass} onChange={event => setForm({ ...form, phoneE164: event.target.value })} pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" value={form.phoneE164} /></label>
              <label className={labelClass}>Rol<select className={inputClass} onChange={event => setForm({ ...form, role: event.target.value as 'ADMIN' | 'AGENT' })} value={form.role}><option value="AGENT">Asesor</option><option value="ADMIN">Administrador</option></select></label>
              <label className={labelClass}>Contraseña temporal<input className={inputClass} minLength={8} onChange={event => setForm({ ...form, password: event.target.value })} required type="password" value={form.password} /></label>
              <button className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={saving} type="submit">{saving ? 'Creando...' : 'Crear usuario'}</button>
            </div>
          </form>
        )}
      </aside>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingUser(null)}>
          <form className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()} onSubmit={saveEdit}>
            <h2 className="text-xl font-bold">Editar usuario</h2>
            <div className="mt-5 grid gap-4">
              <label className={labelClass}>Nombre completo<input className={inputClass} value={editingUser.fullName} onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })} required /></label>
              <label className={labelClass}>Correo<input className={inputClass} type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} required /></label>
              <label className={labelClass}>Teléfono<input className={inputClass} value={editingUser.phoneE164 || ''} onChange={e => setEditingUser({ ...editingUser, phoneE164: e.target.value })} pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" /></label>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700" onClick={() => setEditingUser(null)}>Cancelar</button>
              <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, current, onEdit, onToggleStatus, onChangeRole }: {
  user: CompanyUser;
  current: boolean;
  onEdit: (user: CompanyUser) => void;
  onToggleStatus: (user: CompanyUser) => void;
  onChangeRole: (user: CompanyUser, role: 'ADMIN' | 'AGENT') => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <article className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{user.fullName.split(' ').slice(0, 2).map(part => part[0]).join('')}</span>
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{user.fullName} {current && <span className="text-indigo-600">(tú)</span>}</strong>
        <small className="block truncate text-slate-500">{user.email}</small>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        {user.active ? 'Activo' : 'Inactivo'}
      </span>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{user.role === 'ADMIN' ? 'Admin' : 'Asesor'}</span>
      {!current && (
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="rounded-lg p-2 hover:bg-slate-100">⋮</button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-lg z-10">
              <button onClick={() => { onEdit(user); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">Editar</button>
              <button onClick={() => { onToggleStatus(user); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">{user.active ? 'Desactivar' : 'Activar'}</button>
              <button onClick={() => { onChangeRole(user, user.role === 'ADMIN' ? 'AGENT' : 'ADMIN'); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50">Cambiar a {user.role === 'ADMIN' ? 'Asesor' : 'Admin'}</button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
