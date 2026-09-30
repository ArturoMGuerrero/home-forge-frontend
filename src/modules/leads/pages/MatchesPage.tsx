import { FormEvent, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LeadItem } from '../api/leadsApi';
import { ApiProperty, formatApiPrice } from '../../properties';
import { createMatch, deleteMatch, listMatches, PropertyMatch, updateMatch } from '../api/matchesApi';
import { loadOperationsContext } from '../../../shared/operationsContext';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { Badge, Button, Card, EmptyState, PageHeader, SearchInput, Select, Textarea } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';
import { LeadsNav } from '../components/LeadsNav';

const matchStatusOptions = [
  { value: 'SUGGESTED', label: 'Sugerida' },
  { value: 'SENT', label: 'Enviada' },
  { value: 'INTERESTED', label: 'Interesado' },
  { value: 'VISIT_SCHEDULED', label: 'Visita agendada' },
  { value: 'REJECTED', label: 'Descartada' }
];

export function MatchesPage() {
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canEdit: true, canExport: true, canUploadMultiple: true, canInviteUsers: true, level: 'NONE' };
  const [matches, setMatches] = useState<PropertyMatch[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [form, setForm] = useState({ leadId: '', propertyId: '', notes: '' });
  const [searchLead, setSearchLead] = useState('');
  const [searchProperty, setSearchProperty] = useState('');

  useEffect(() => {
    Promise.all([listMatches(), loadOperationsContext()])
      .then(([items, [leadItems, propertyItems]]) => {
        setMatches(items);
        setLeads(leadItems);
        setProperties(propertyItems);
      })
      .catch(e => toast.error(e.message));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();

    // Check create permission
    if (!restrictions.canCreate) {
      toast.error('Tu plan no permite crear nuevas asignaciones de propiedades. Actualiza tu suscripción para continuar.');
      return;
    }

    try {
      const created = await createMatch({ ...form, notes: form.notes || undefined });
      setMatches(current => [created, ...current]);
      setForm({ leadId: '', propertyId: '', notes: '' });
      setSearchLead('');
      setSearchProperty('');
      toast.success('Propiedad asignada correctamente');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No fue posible asignar la propiedad.');
    }
  }

  async function changeStatus(item: PropertyMatch, status: PropertyMatch['status']) {
    try {
      const updated = await updateMatch({ ...item, status });
      setMatches(current => current.map(match => (match.id === item.id ? updated : match)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No fue posible actualizar el estado.');
    }
  }

  async function remove(id: string) {
    try {
      await deleteMatch(id);
      setMatches(current => current.filter(item => item.id !== id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No fue posible quitar la asignación.');
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (!searchLead) return true;
    const query = searchLead.toLowerCase();
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    return fullName.includes(query) || lead.email?.toLowerCase().includes(query);
  });

  const filteredProperties = properties.filter(property => {
    if (!searchProperty) return true;
    const query = searchProperty.toLowerCase();
    return (
      property.code?.toLowerCase().includes(query) ||
      property.title?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query)
    );
  });

  const selectedProperty = properties.find(property => property.id === form.propertyId);

  return (
    <>
      <PageHeader
        subtitle="Recomienda inmuebles y registra el nivel de interés de cada prospecto."
        title="Asignaciones de propiedades"
      >
        <LeadsNav />
      </PageHeader>

      <Card className="mb-6">
        <form onSubmit={submit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Select
                helperText={searchLead && filteredLeads.length === 0 ? `No se encontraron prospectos con "${searchLead}"` : undefined}
                label="Prospecto"
                onChange={e => { setForm({ ...form, leadId: e.target.value }); setSearchLead(''); }}
                options={filteredLeads.map(lead => ({ value: lead.id, label: `${lead.firstName} ${lead.lastName}${lead.email ? ` · ${lead.email}` : ''}` }))}
                placeholder={`Seleccionar prospecto (${filteredLeads.length})`}
                required
                value={form.leadId}
              />
              <SearchInput aria-label="Buscar prospecto" onChange={e => setSearchLead(e.target.value)} onClear={() => setSearchLead('')} placeholder="Filtrar por nombre o email..." value={searchLead} />
            </div>

            <div className="grid gap-2">
              <Select
                helperText={searchProperty && filteredProperties.length === 0 ? `No se encontraron propiedades con "${searchProperty}"` : selectedProperty ? formatApiPrice(selectedProperty) : undefined}
                label="Propiedad"
                onChange={e => { setForm({ ...form, propertyId: e.target.value }); setSearchProperty(''); }}
                options={filteredProperties.map(property => ({ value: property.id, label: `${property.code} · ${property.title} · ${property.city}` }))}
                placeholder={`Seleccionar propiedad (${filteredProperties.length})`}
                required
                value={form.propertyId}
              />
              <SearchInput aria-label="Buscar propiedad" onChange={e => setSearchProperty(e.target.value)} onClear={() => setSearchProperty('')} placeholder="Filtrar por código, título o ciudad..." value={searchProperty} />
            </div>
          </div>

          <Textarea
            containerClassName="mt-5"
            helperText={`${form.notes.length}/3000 caracteres`}
            label="Nota de la recomendación (opcional)"
            maxLength={3000}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Ej: Propiedad ideal para su presupuesto, excelente ubicación cerca de escuelas..."
            rows={3}
            value={form.notes}
          />

          <div className="mt-5 flex justify-end">
            <Button disabled={!form.leadId || !form.propertyId || !restrictions.canCreate} icon={!restrictions.canCreate ? <Icon className="size-4" name="lock" /> : undefined} type="submit">
              Asignar propiedad
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map(item => (
          <Card className="p-5" key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Badge variant="primary">{item.propertyCode}</Badge>
                <h2 className="mt-2 truncate text-base font-semibold text-fg">{item.propertyTitle}</h2>
                <p className="mt-0.5 truncate text-sm text-fg-subtle">Para {item.leadName}</p>
              </div>
              <Button onClick={() => remove(item.id)} size="sm" variant="danger-ghost">Quitar</Button>
            </div>

            {item.notes && <p className="mt-4 rounded-xl bg-surface-muted p-3 text-sm text-fg-muted">{item.notes}</p>}

            <Select
              containerClassName="mt-4"
              label="Estado de la recomendación"
              onChange={e => changeStatus(item, e.target.value as PropertyMatch['status'])}
              options={matchStatusOptions}
              value={item.status}
            />
          </Card>
        ))}

        {matches.length === 0 && (
          <Card className="border-dashed lg:col-span-2">
            <EmptyState
              description="Comienza seleccionando un prospecto y una propiedad arriba."
              icon={<Icon name="properties" />}
              title="Todavía no hay propiedades asignadas"
            />
          </Card>
        )}
      </div>
    </>
  );
}
