import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LEADS_CHANGED_EVENT, LeadItem, leadStatusLabels, listLeads } from '../api/leadsApi';
import { CreateLeadModal } from './CreateLeadModal';
import { ExportButton } from '../../../shared/ExportButton';
import { exportToExcel, formatCurrency, formatDate } from '../../../shared/excelExport';
import { UpgradeModal } from '../../../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';

const statusClass: Record<string, string> = {
  QUALIFIED: 'bg-accent-muted text-accent-fg',
  CONTACTED: 'bg-warning-muted text-warning-fg',
  NEW: 'bg-info-muted text-info-fg',
  TOUR_SCHEDULED: 'bg-primary-muted text-primary-fg',
  TOUR_COMPLETED: 'bg-success-muted text-success-fg',
  OFFER_MADE: 'bg-accent-muted text-accent-fg',
  UNDER_CONTRACT: 'bg-info-muted text-info-fg',
  CLOSED: 'bg-success-muted text-success-fg',
  LOST: 'bg-surface-sunken text-fg-muted'
};

const priorityClass: Record<string, string> = {
  HIGH: 'bg-danger-muted text-danger-fg',
  MEDIUM: 'bg-warning-muted text-warning-fg',
  LOW: 'bg-surface-sunken text-fg-muted'
};

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja'
};

function formatBudget(min?: number, max?: number, currency?: string): string {
  const curr = currency || 'MXN';
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${curr}`;
  if (max) return `Hasta ${max.toLocaleString()} ${curr}`;
  if (min) return `Desde ${min.toLocaleString()} ${curr}`;
  return '';
}

function formatPhone(phone?: string): string {
  if (!phone) return '';
  // +52 442 111 2233 -> (442) 111-2233
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('52')) {
    const area = cleaned.slice(2, 5);
    const first = cleaned.slice(5, 8);
    const last = cleaned.slice(8);
    return `(${area}) ${first}-${last}`;
  }
  return phone;
}

type Props = {
  expanded?: boolean;
  leads?: LeadItem[];
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  statusFilter?: LeadItem['status'] | 'ALL';
  setStatusFilter?: (status: LeadItem['status'] | 'ALL') => void;
  priorityFilter?: LeadItem['priority'] | 'ALL';
  setPriorityFilter?: (priority: LeadItem['priority'] | 'ALL') => void;
  filteredLeads?: LeadItem[];
};

export function LeadList({
  expanded = false,
  leads: leadsFromProps,
  searchQuery: searchQueryFromProps,
  setSearchQuery: setSearchQueryFromProps,
  statusFilter: statusFilterFromProps,
  setStatusFilter: setStatusFilterFromProps,
  priorityFilter: priorityFilterFromProps,
  setPriorityFilter: setPriorityFilterFromProps,
  filteredLeads: filteredLeadsFromProps
}: Props) {
  const { t } = useTranslation();
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [leadsState, setLeadsState] = useState<LeadItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [searchQueryState, setSearchQueryState] = useState('');
  const [statusFilterState, setStatusFilterState] = useState<LeadItem['status'] | 'ALL'>('ALL');
  const [priorityFilterState, setPriorityFilterState] = useState<LeadItem['priority'] | 'ALL'>('ALL');

  // Use props if provided, otherwise use internal state
  const leads = leadsFromProps ?? leadsState;
  const searchQuery = searchQueryFromProps ?? searchQueryState;
  const setSearchQuery = setSearchQueryFromProps ?? setSearchQueryState;
  const statusFilter = statusFilterFromProps ?? statusFilterState;
  const setStatusFilter = setStatusFilterFromProps ?? setStatusFilterState;
  const priorityFilter = priorityFilterFromProps ?? priorityFilterState;
  const setPriorityFilter = setPriorityFilterFromProps ?? setPriorityFilterState;

  function load() {
    if (!leadsFromProps) {
      listLeads()
        .then(setLeadsState)
        .catch(() => toast.error('No fue posible consultar los prospectos. Verifica que el backend esté activo.'));
    }
  }

  useEffect(() => {
    if (!leadsFromProps) {
      load();
      window.addEventListener(LEADS_CHANGED_EVENT, load);
      return () => window.removeEventListener(LEADS_CHANGED_EVENT, load);
    }
  }, [leadsFromProps]);

  const filteredLeads = filteredLeadsFromProps ?? leads.filter(lead => {
    // Búsqueda por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(query);
      const matchesEmail = lead.email?.toLowerCase().includes(query);
      const matchesPhone = lead.phoneE164?.includes(query.replace(/\D/g, ''));
      if (!matchesName && !matchesEmail && !matchesPhone) return false;
    }

    // Filtro por estado
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;

    // Filtro por prioridad
    if (priorityFilter !== 'ALL' && lead.priority !== priorityFilter) return false;

    return true;
  });

  function handleCreateLead() {
    if (!restrictions.canCreate) {
      setUpgradeModalOpen(true);
      return;
    }
    setModalOpen(true);
  }

  function handleExport() {
    if (!restrictions.canExport) {
      setUpgradeModalOpen(true);
      return;
    }
    exportToExcel(
      filteredLeads,
      [
        { header: 'Nombre', key: item => `${item.firstName} ${item.lastName}`, width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: item => formatPhone(item.phoneE164), width: 18 },
        { header: 'Estado', key: item => leadStatusLabels[item.status] || item.status, width: 18 },
        { header: 'Prioridad', key: item => priorityLabels[item.priority] || item.priority, width: 12 },
        { header: 'Presupuesto', key: item => formatBudget(item.budgetMin, item.budgetMax, item.currencyCode), width: 25 },
        { header: 'Origen', key: 'source', width: 20 },
        { header: 'Notas', key: 'notes', width: 40 }
      ],
      'prospectos-homeforge',
      'Prospectos'
    );
  }

  return (
    <section className="min-w-0 p-4 lg:p-6">
      {!expanded && (
        <div className="mb-5 flex items-center justify-between gap-4">
          <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">{t('crm')}</p><h2 className="text-xl font-bold">{t('recentLeads')}</h2></div>
          <div className="flex gap-3">
            <button
              className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                restrictions.canCreate
                  ? 'bg-primary text-white hover:bg-primary-hover focus:ring-primary'
                  : 'bg-surface-strong text-fg-subtle cursor-not-allowed'
              }`}
              onClick={handleCreateLead}
              type="button"
            >
              {restrictions.canCreate ? `+ ${t('newLead')}` : `🔒 ${t('newLead')}`}
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mb-5 space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-xl border border-border py-2.5 pl-11 pr-4 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-fg-subtle transition hover:bg-surface-sunken hover:text-fg-muted"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtros de Estado */}
          <div>
            <p className="mb-2 text-xs font-semibold text-fg-muted">Estado</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === 'ALL' ? 'bg-primary text-white' : 'bg-surface-sunken text-fg-muted hover:bg-surface-strong'}`}
                onClick={() => setStatusFilter('ALL')}
                type="button"
              >
                Todos
              </button>
              {(Object.keys(leadStatusLabels) as LeadItem['status'][]).map(status => (
                <button
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === status ? statusClass[status] : 'bg-surface-sunken text-fg-muted hover:bg-surface-strong'}`}
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  type="button"
                >
                  {leadStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de Prioridad */}
          <div>
            <p className="mb-2 text-xs font-semibold text-fg-muted">Prioridad</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'ALL' ? 'bg-primary text-white' : 'bg-surface-sunken text-fg-muted hover:bg-surface-strong'}`}
                onClick={() => setPriorityFilter('ALL')}
                type="button"
              >
                Todas
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'HIGH' ? priorityClass.HIGH : 'bg-surface-sunken text-fg-muted hover:bg-surface-strong'}`}
                onClick={() => setPriorityFilter('HIGH')}
                type="button"
              >
                ⚡ Alta
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'MEDIUM' ? priorityClass.MEDIUM : 'bg-surface-sunken text-fg-muted hover:bg-surface-strong'}`}
                onClick={() => setPriorityFilter('MEDIUM')}
                type="button"
              >
                🎯 Media
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'LOW' ? priorityClass.LOW : 'bg-surface-sunken text-fg-muted hover:bg-surface-strong'}`}
                onClick={() => setPriorityFilter('LOW')}
                type="button"
              >
                📋 Baja
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <div className="flex items-center justify-between rounded-lg bg-primary-soft px-4 py-2.5 text-xs">
              <span className="font-medium text-primary-fg">
                {filteredLeads.length} {filteredLeads.length === 1 ? 'prospecto encontrado' : 'prospectos encontrados'}
              </span>
              <button
                className="font-semibold text-primary-fg transition hover:text-primary-fg"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                }}
                type="button"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {leads.length === 0 && <p className="py-10 text-center text-sm text-fg-subtle col-span-full">{t('noLeads')}</p>}
        {filteredLeads.length === 0 && leads.length > 0 && (
          <div className="py-12 text-center col-span-full">
            <svg className="mx-auto mb-3 size-12 text-border-strong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-medium text-fg-muted">No se encontraron prospectos</p>
            <p className="mt-1 text-xs text-fg-subtle">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
        {filteredLeads.slice(0, expanded ? undefined : 5).map(lead => {
          const budget = formatBudget(lead.budgetMin, lead.budgetMax, lead.currencyCode);
          const phone = formatPhone(lead.phoneE164);

          return (
            <article
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:border-primary hover:shadow-xl hover:shadow-indigo-500/10"
              key={lead.id}
            >
              {/* Header compacto */}
              <div className="flex items-start gap-3 p-5">
                <div className="relative flex-shrink-0">
                  <div className="grid size-14 place-items-center rounded-xl bg-primary-soft text-sm font-bold text-primary-fg">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  {lead.priority === 'HIGH' && (
                    <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-danger ring-2 ring-surface">
                      <span aria-label="Prioridad alta" className="text-xs" role="img">⚡</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-fg group-hover:text-primary-fg transition mb-1.5 truncate">
                    {lead.firstName} {lead.lastName}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      lead.status === 'QUALIFIED' ? 'bg-accent-muted border border-accent-line text-accent-fg' :
                      lead.status === 'CONTACTED' ? 'bg-warning-muted border border-warning-line text-warning-fg' :
                      lead.status === 'NEW' ? 'bg-info-muted border border-info-line text-info-fg' :
                      lead.status === 'TOUR_SCHEDULED' ? 'bg-primary-muted border border-primary-line text-primary-fg' :
                      lead.status === 'TOUR_COMPLETED' ? 'bg-success-muted border border-success-line text-success-fg' :
                      lead.status === 'OFFER_MADE' ? 'bg-accent-muted border border-accent-line text-accent-fg' :
                      lead.status === 'UNDER_CONTRACT' ? 'bg-info-muted border border-info-line text-info-fg' :
                      lead.status === 'CLOSED' ? 'bg-success-muted border border-success-line text-success-fg' :
                      'bg-surface-sunken border border-border text-fg-muted'
                    }`}>
                      {leadStatusLabels[lead.status]}
                    </span>
                    {lead.score !== undefined && lead.score > 0 && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        lead.score >= 70 ? 'bg-success-muted text-success-fg' :
                        lead.score >= 40 ? 'bg-warning-muted text-warning-fg' :
                        'bg-surface-sunken text-fg-subtle'
                      }`}>
                        {lead.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Información compacta */}
              <div className="px-5 pb-4 space-y-2.5 text-sm">
                {phone && (
                  <div className="flex items-center gap-2 text-fg-muted">
                    <svg className="size-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate font-medium">{phone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2 text-fg-muted">
                    <svg className="size-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate font-medium text-xs">{lead.email}</span>
                  </div>
                )}
                {budget && (
                  <div className="flex items-center gap-2 text-success-fg font-bold">
                    <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{budget}</span>
                  </div>
                )}
                {lead.city && (
                  <div className="flex items-center gap-2 text-fg-muted">
                    <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{lead.city}</span>
                  </div>
                )}
              </div>

              {/* Próximo seguimiento compacto */}
              {lead.nextFollowUpAt && (
                <div className="flex items-center gap-2 bg-warning-soft px-5 py-2.5 border-t border-warning-line">
                  <svg className="size-4 text-warning-fg flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-warning-fg font-medium truncate">
                      {new Date(lead.nextFollowUpAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Botón de acción */}
              <div className="p-5 pt-3 mt-auto">
                <Link to={`/app/prospectos/${lead.id}`}>
                  <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all hover:bg-primary-hover hover:shadow-md hover:shadow-indigo-600/40">
                    <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver detalles
                  </button>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {!leadsFromProps && (
        <CreateLeadModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={created => setLeadsState(current => [created, ...current])} />
      )}
      <UpgradeModal
        feature="crear nuevos prospectos"
        isOpen={upgradeModalOpen}
        level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </section>
  );
}
