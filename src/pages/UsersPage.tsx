import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../shared/auth';
import { CompanyUser, createCompanyUser, listCompanyUsers, UserListResponse } from '../shared/usersApi';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const labelClass = 'grid gap-2 text-sm font-semibold text-slate-700';

export function UsersPage() {
  const session = getSession();
  const [data, setData] = useState<UserListResponse | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneE164: '', role: 'AGENT' as 'ADMIN' | 'AGENT', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    load();
  }, []);

  function load() {
    listCompanyUsers()
      .then(setData)
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar los usuarios.'))
      .finally(() => setLoading(false));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const created = await createCompanyUser({
        ...form,
        phoneE164: form.phoneE164.trim() || undefined
      });
      setData(current => current ? { ...current, usedSeats: current.usedSeats + 1, users: [...current.users, created] } : current);
      setForm({ fullName: '', email: '', phoneE164: '', role: 'AGENT', password: '' });
      setSuccess('Usuario creado. Ya puede iniciar sesión con su correo y contraseña.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible crear el usuario.');
    } finally {
      setSaving(false);
    }
  }

  if (session?.role !== 'ADMIN') {
    return <RestrictedCard message="Solo los administradores pueden gestionar usuarios de la empresa." />;
  }

  if (loading) return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando usuarios...</p>;
  if (!data) return <RestrictedCard message={error || 'No fue posible consultar los usuarios.'} />;

  const limitReached = data.usedSeats >= data.userLimit;

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Equipo</p>
          <h1 className="text-3xl font-bold">Usuarios de la empresa</h1>
          <p className="mt-2 text-sm text-slate-500">Crea accesos para administradores y asesores de {session.companyName}.</p>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-right">
          <span className="block text-xs font-bold uppercase tracking-wider text-indigo-500">Plan {data.planCode}</span>
          <strong className="text-lg text-indigo-950">{data.usedSeats} de {data.userLimit} usuarios</strong>
        </div>
      </header>

      <div className="grid gap-7 xl:grid-cols-[1fr_390px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-bold">Equipo actual</h2></div>
          {data.users.map(user => <UserRow key={user.id} user={user} current={user.id === session.userId} />)}
        </section>

        <aside>
          {limitReached ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Límite alcanzado</span>
              <h2 className="mt-2 text-xl font-bold text-amber-950">Tu plan permite {data.userLimit} usuarios</h2>
              <p className="mt-3 text-sm leading-6 text-amber-800">Actualiza a Pro para administrar hasta 10 integrantes en la misma empresa.</p>
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
                <button className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Creando...' : 'Crear usuario'}</button>
              </div>
            </form>
          )}
          {success && <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{success}</p>}
          {error && <p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}
        </aside>
      </div>
    </>
  );
}

function UserRow({ user, current }: { user: CompanyUser; current: boolean }) {
  return (
    <article className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{user.fullName.split(' ').slice(0, 2).map(part => part[0]).join('')}</span>
      <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{user.fullName} {current && <span className="text-indigo-600">(tú)</span>}</strong><small className="block truncate text-slate-500">{user.email}</small></div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{user.role === 'ADMIN' ? 'Administrador' : 'Asesor'}</span>
    </article>
  );
}

function RestrictedCard({ message }: { message: string }) {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7"><h1 className="text-xl font-bold text-amber-950">Acceso restringido</h1><p className="mt-2 text-sm text-amber-800">{message}</p></div>;
}
