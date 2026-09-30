import { Link } from 'react-router-dom';
import { Avatar, Badge, BadgeVariant, Button, Card, cn, EmptyState, SearchInput } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';
import { LeadItem, leadStatusLabels } from '../api/leadsApi';

export const leadStatusVariants: Record<LeadItem['status'], BadgeVariant> = {
  NEW: 'info',
  CONTACTED: 'warning',
  QUALIFIED: 'purple',
  TOUR_SCHEDULED: 'primary',
  TOUR_COMPLETED: 'success',
  OFFER_MADE: 'purple',
  UNDER_CONTRACT: 'info',
  CLOSED: 'success',
  LOST: 'neutral'
};

const priorityOptions: Array<{ value: LeadItem['priority'] | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'LOW', label: 'Baja' }
];

export function formatBudget(min?: number, max?: number, currency?: string): string {
  const curr = currency || 'MXN';
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${curr}`;
  if (max) return `Hasta ${max.toLocaleString()} ${curr}`;
  if (min) return `Desde ${min.toLocaleString()} ${curr}`;
  return '';
}

export function formatPhone(phone?: string): string {
  if (!phone) return '';
  // +52 442 111 2233 -> (442) 111-2233
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('52')) {
    return `(${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  return phone;
}

type Props = {
  leads: LeadItem[];
  filteredLeads: LeadItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: LeadItem['status'] | 'ALL';
  setStatusFilter: (status: LeadItem['status'] | 'ALL') => void;
  priorityFilter: LeadItem['priority'] | 'ALL';
  setPriorityFilter: (priority: LeadItem['priority'] | 'ALL') => void;
  onCreate?: () => void;
};

/** Filtros y tarjetas de prospectos. El estado vive en la página que lo usa. */
export function LeadList({
  leads,
  filteredLeads,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onCreate
}: Props) {
  const hasFilters = Boolean(searchQuery) || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  function clearFilters() {
    setSearchQuery('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  }

  return (
    <section className="min-w-0">
      {leads.length > 0 && (
        <Card className="mb-6 space-y-4 p-4 sm:p-5">
          <SearchInput
            aria-label="Buscar prospectos"
            onChange={e => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchQuery}
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <FilterChips
              label="Etapa"
              onChange={value => setStatusFilter(value as LeadItem['status'] | 'ALL')}
              options={[{ value: 'ALL', label: 'Todas' }, ...(Object.keys(leadStatusLabels) as LeadItem['status'][]).map(status => ({ value: status, label: leadStatusLabels[status] }))]}
              value={statusFilter}
            />
            <FilterChips
              label="Prioridad"
              onChange={value => setPriorityFilter(value as LeadItem['priority'] | 'ALL')}
              options={priorityOptions}
              value={priorityFilter}
            />
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
              <span className="text-fg-subtle">
                <strong className="font-semibold text-fg">{filteredLeads.length}</strong> {filteredLeads.length === 1 ? 'prospecto encontrado' : 'prospectos encontrados'}
              </span>
              <Button onClick={clearFilters} size="sm" variant="ghost">Limpiar filtros</Button>
            </div>
          )}
        </Card>
      )}

      {leads.length === 0 && (
        <Card className="border-dashed">
          <EmptyState
            actionLabel={onCreate ? 'Registrar prospecto' : undefined}
            description="Registra a las personas interesadas en tus propiedades para darles seguimiento."
            icon={<Icon name="leads" />}
            onAction={onCreate}
            title="Aún no hay prospectos"
          />
        </Card>
      )}

      {leads.length > 0 && filteredLeads.length === 0 && (
        <EmptyState
          actions={<Button onClick={clearFilters} variant="tertiary">Limpiar filtros</Button>}
          description="Intenta ajustar los filtros de búsqueda."
          title="No se encontraron prospectos"
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredLeads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
      </div>
    </section>
  );
}

function FilterChips({ label, options, value, onChange }: {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-semibold text-fg-subtle">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(option => {
          const active = option.value === value;
          return (
            <button
              aria-pressed={active}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                active ? 'bg-primary text-white ring-primary' : 'bg-surface text-fg-muted ring-border hover:bg-surface-muted hover:text-fg'
              )}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function LeadCard({ lead }: { lead: LeadItem }) {
  const budget = formatBudget(lead.budgetMin, lead.budgetMax, lead.currencyCode);
  const phone = formatPhone(lead.phoneE164);
  const name = `${lead.firstName} ${lead.lastName}`;

  return (
    <Card className="relative flex flex-col transition hover:border-primary-line hover:shadow-md" noPadding>
      <div className="flex items-start gap-3 p-5">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-fg">
            <Link className="after:absolute after:inset-0 after:rounded-2xl hover:text-primary-fg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary" to={`/app/prospectos/${lead.id}`}>{name}</Link>
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={leadStatusVariants[lead.status]}>{leadStatusLabels[lead.status]}</Badge>
            {lead.priority === 'HIGH' && <Badge dot variant="error">Prioridad alta</Badge>}
            {lead.score !== undefined && lead.score > 0 && (
              <Badge variant={lead.score >= 70 ? 'success' : lead.score >= 40 ? 'warning' : 'neutral'}>{lead.score} pts</Badge>
            )}
          </div>
        </div>
      </div>

      <dl className="space-y-2 px-5 pb-4 text-sm">
        {phone && <ContactRow icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" label="Teléfono" value={phone} />}
        {lead.email && <ContactRow icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" label="Correo" value={lead.email} />}
        {budget && <ContactRow icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" label="Presupuesto" strong value={budget} />}
        {lead.city && <ContactRow icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" label="Ciudad" value={lead.city} />}
      </dl>

      {lead.nextFollowUpAt && (
        <div className="flex items-center gap-2 border-t border-warning-line bg-warning-soft px-5 py-2.5 text-xs font-medium text-warning-fg">
          <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Seguimiento: {new Date(lead.nextFollowUpAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </Card>
  );
}

function ContactRow({ icon, label, value, strong = false }: { icon: string; label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-fg-muted">
      <dt className="sr-only">{label}</dt>
      <svg aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      <dd className={cn('truncate', strong && 'font-semibold text-fg')}>{value}</dd>
    </div>
  );
}
