import { FormEvent, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Alert, Avatar, Badge, Button, buttonClasses, Card, Input, LoadingState, Menu, Modal, Select } from '../../../shared/ui';
import toast from 'react-hot-toast';
import { getSession } from '../../auth';
import { CompanyUser, createCompanyUser, listCompanyUsers, UserListResponse, updateUser, changeUserStatus, changeUserRole } from '../api/usersApi';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';

const PHONE_PATTERN = String.raw`^\+[1-9][0-9]{1,14}$`;
const roleOptions = [{ value: 'AGENT', label: 'Asesor' }, { value: 'ADMIN', label: 'Administrador' }];

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

  if (loading) return <Card><LoadingState message="Cargando usuarios..." /></Card>;
  if (!data) return <Alert variant="error">No fue posible consultar los usuarios.</Alert>;

  const limitReached = data.usedSeats >= data.userLimit;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <Card noPadding truncate>
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="font-semibold text-fg">Equipo actual <span className="font-normal text-fg-subtle">({data.users.length})</span></h2>
          <Badge variant={limitReached ? 'warning' : 'primary'}>{data.usedSeats} de {data.userLimit} usuarios</Badge>
        </div>
        <div className="divide-y divide-border">
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
        </div>
      </Card>

      <aside className="space-y-6">
        {!restrictions.canInviteUsers ? (
          <Alert
            actions={<Link className={buttonClasses({ variant: 'danger-solid', size: 'sm' })} to="/app/planes">Actualizar plan</Link>}
            title="No puedes invitar usuarios"
            variant="error"
          >
            Tu plan actual no permite invitar nuevos usuarios.
          </Alert>
        ) : limitReached ? (
          <Alert
            actions={<Link className={buttonClasses({ size: 'sm' })} to="/app/planes">Comparar planes</Link>}
            title={`Tu plan permite ${data.userLimit} usuarios`}
            variant="warning"
          >
            Actualiza a Pro para administrar hasta 10 integrantes.
          </Alert>
        ) : (
          <Card>
            <form onSubmit={submit}>
              <h2 className="text-lg font-semibold text-fg">Agregar usuario</h2>
              <p className="mt-1 text-sm text-fg-subtle">Podrá iniciar sesión con su correo y la contraseña temporal.</p>
              <div className="mt-5 grid gap-4">
                <Input label="Nombre completo" maxLength={180} onChange={event => setForm({ ...form, fullName: event.target.value })} required value={form.fullName} />
                <Input label="Correo" onChange={event => setForm({ ...form, email: event.target.value })} required type="email" value={form.email} />
                <Input label="Teléfono" onChange={event => setForm({ ...form, phoneE164: event.target.value })} pattern={PHONE_PATTERN} placeholder="+524421234567" type="tel" value={form.phoneE164} />
                <Select label="Rol" onChange={event => setForm({ ...form, role: event.target.value as 'ADMIN' | 'AGENT' })} options={roleOptions} value={form.role} />
                <Input helperText="Mínimo 8 caracteres." label="Contraseña temporal" minLength={8} onChange={event => setForm({ ...form, password: event.target.value })} required type="password" value={form.password} />
                <Button fullWidth loading={saving} type="submit">{saving ? 'Creando...' : 'Crear usuario'}</Button>
              </div>
            </form>
          </Card>
        )}
      </aside>

      <Modal
        footer={
          <>
            <Button onClick={() => setEditingUser(null)} variant="tertiary">Cancelar</Button>
            <Button form="edit-user-form" type="submit">Guardar</Button>
          </>
        }
        isOpen={editingUser !== null}
        maxWidth="md"
        onClose={() => setEditingUser(null)}
        title="Editar usuario"
      >
        {editingUser && (
          <form className="grid gap-4" id="edit-user-form" onSubmit={saveEdit}>
            <Input label="Nombre completo" onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })} required value={editingUser.fullName} />
            <Input label="Correo" onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} required type="email" value={editingUser.email} />
            <Input label="Teléfono" onChange={e => setEditingUser({ ...editingUser, phoneE164: e.target.value })} pattern={PHONE_PATTERN} placeholder="+524421234567" type="tel" value={editingUser.phoneE164 || ''} />
          </form>
        )}
      </Modal>
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
  return (
    <article className="flex items-center gap-3 px-5 py-3.5 sm:gap-4">
      <Avatar name={user.fullName} />
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-medium text-fg">{user.fullName} {current && <span className="font-normal text-fg-subtle">(tú)</span>}</strong>
        <small className="block truncate text-xs text-fg-subtle">{user.email}</small>
      </div>
      <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
        <Badge dot variant={user.active ? 'success' : 'neutral'}>{user.active ? 'Activo' : 'Inactivo'}</Badge>
        <Badge variant={user.role === 'ADMIN' ? 'primary' : 'neutral'}>{user.role === 'ADMIN' ? 'Admin' : 'Asesor'}</Badge>
      </div>
      {current ? <span aria-hidden="true" className="size-9" /> : (
        <Menu
          items={[
            { label: 'Editar', onSelect: () => onEdit(user) },
            { label: `Cambiar a ${user.role === 'ADMIN' ? 'Asesor' : 'Admin'}`, onSelect: () => onChangeRole(user, user.role === 'ADMIN' ? 'AGENT' : 'ADMIN') },
            { label: user.active ? 'Desactivar' : 'Activar', onSelect: () => onToggleStatus(user), danger: user.active },
          ]}
          label={`Acciones para ${user.fullName}`}
        />
      )}
    </article>
  );
}
