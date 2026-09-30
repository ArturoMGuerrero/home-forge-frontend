import { FormEvent, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSession } from '../../auth';
import { CompanyUser, createCompanyUser, listCompanyUsers, UserListResponse } from '../api/usersApi';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';

const inputClass = 'w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal text-fg outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-line';
const labelClass = 'grid gap-2 text-sm font-semibold text-fg-muted';

export function UsersPage() {
  const session = getSession();
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canEdit: true, canExport: true, canUploadMultiple: true, canInviteUsers: true, level: 'NONE' };
  const [data, setData] = useState<UserListResponse | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneE164: '', role: 'AGENT' as 'ADMIN' | 'AGENT', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

    // Check invite users permission
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

  if (session?.role !== 'ADMIN') {
    return <RestrictedCard message="Solo los administradores pueden gestionar usuarios de la empresa." />;
  }

  if (loading) return <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle">Cargando usuarios...</p>;
  if (!data) return <RestrictedCard message="No fue posible consultar los usuarios." />;

  const limitReached = data.usedSeats >= data.userLimit;
  const canInvite = restrictions.canInviteUsers && !limitReached;

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">Equipo</p>
          <h1 className="text-3xl font-bold">Usuarios de la empresa</h1>
          <p className="mt-2 text-sm text-fg-subtle">Crea accesos para administradores y asesores de {session.companyName}.</p>
        </div>
        <div className="rounded-2xl border border-primary-line bg-primary-soft px-5 py-3 text-right">
          <span className="block text-xs font-bold uppercase tracking-wider text-primary">Plan {data.planCode}</span>
          <strong className="text-lg text-primary-fg">{data.usedSeats} de {data.userLimit} usuarios</strong>
        </div>
      </header>

      <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4"><h2 className="font-bold">Equipo actual</h2></div>
          {data.users.map(user => <UserRow key={user.id} user={user} current={user.id === session.userId} />)}
        </section>

        <aside>
          {!restrictions.canInviteUsers ? (
            <section className="rounded-2xl border border-danger-line bg-danger-soft p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-danger-fg">Función bloqueada</span>
              <h2 className="mt-2 text-xl font-bold text-danger-fg">No puedes invitar usuarios</h2>
              <p className="mt-3 text-sm leading-6 text-danger-fg">Tu plan actual no permite invitar nuevos usuarios. Actualiza tu suscripción para continuar.</p>
              <Link className="mt-5 inline-flex rounded-xl bg-danger-hover px-4 py-3 text-sm font-bold text-white" to="/app/planes">Actualizar plan</Link>
            </section>
          ) : limitReached ? (
            <section className="rounded-2xl border border-warning-line bg-warning-soft p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-warning-fg">Límite alcanzado</span>
              <h2 className="mt-2 text-xl font-bold text-warning-fg">Tu plan permite {data.userLimit} usuarios</h2>
              <p className="mt-3 text-sm leading-6 text-warning-fg">Actualiza a Pro para administrar hasta 10 integrantes en la misma empresa.</p>
              <Link className="mt-5 inline-flex rounded-xl bg-warning-hover px-4 py-3 text-sm font-bold text-white" to="/app/planes">Comparar planes</Link>
            </section>
          ) : (
            <form className="rounded-2xl border border-border bg-surface p-5 shadow-sm" onSubmit={submit}>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-primary-fg">Nuevo acceso</p>
              <h2 className="mt-1 text-xl font-bold">Agregar usuario</h2>
              <div className="mt-5 grid gap-4">
                <label className={labelClass}>Nombre completo<input className={inputClass} maxLength={180} onChange={event => setForm({ ...form, fullName: event.target.value })} required value={form.fullName} /></label>
                <label className={labelClass}>Correo<input className={inputClass} onChange={event => setForm({ ...form, email: event.target.value })} required type="email" value={form.email} /></label>
                <label className={labelClass}>Teléfono<input className={inputClass} onChange={event => setForm({ ...form, phoneE164: event.target.value })} pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" value={form.phoneE164} /></label>
                <label className={labelClass}>Rol<select className={inputClass} onChange={event => setForm({ ...form, role: event.target.value as 'ADMIN' | 'AGENT' })} value={form.role}><option value="AGENT">Asesor</option><option value="ADMIN">Administrador</option></select></label>
                <label className={labelClass}>Contraseña temporal<input className={inputClass} minLength={8} onChange={event => setForm({ ...form, password: event.target.value })} required type="password" value={form.password} /></label>
                <button className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={saving || !restrictions.canInviteUsers} type="submit">{saving ? 'Creando...' : !restrictions.canInviteUsers ? '🔒 Crear usuario' : 'Crear usuario'}</button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}

function UserRow({ user, current }: { user: CompanyUser; current: boolean }) {
  return (
    <article className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-muted text-sm font-bold text-primary-fg">{user.fullName.split(' ').slice(0, 2).map(part => part[0]).join('')}</span>
      <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{user.fullName} {current && <span className="text-primary-fg">(tú)</span>}</strong><small className="block truncate text-fg-subtle">{user.email}</small></div>
      <span className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-bold text-fg-muted">{user.role === 'ADMIN' ? 'Administrador' : 'Asesor'}</span>
    </article>
  );
}

function RestrictedCard({ message }: { message: string }) {
  return <div className="rounded-2xl border border-warning-line bg-warning-soft p-7"><h1 className="text-xl font-bold text-warning-fg">Acceso restringido</h1><p className="mt-2 text-sm text-warning-fg">{message}</p></div>;
}
