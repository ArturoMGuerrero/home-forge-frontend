import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LeadItem, leadStatusLabels, listLeads } from '../../shared/leads';
import { CreateLeadModal } from './CreateLeadModal';
import { ExportButton } from '../../shared/ExportButton';
import { exportToExcel, formatCurrency, formatDate } from '../../shared/excelExport';
import { UpgradeModal } from '../../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../../shared/subscriptionRestrictions';

const statusClass: Record<string, string> = {
  QUALIFIED: 'bg-violet-100 text-violet-800',
  CONTACTED: 'bg-amber-100 text-amber-800',
  NEW: 'bg-cyan-100 text-cyan-800',
  TOUR_SCHEDULED: 'bg-indigo-100 text-indigo-800',
  TOUR_COMPLETED: 'bg-emerald-100 text-emerald-800',
  OFFER_MADE: 'bg-purple-100 text-purple-800',
  UNDER_CONTRACT: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-green-100 text-green-800',
  LOST: 'bg-slate-100 text-slate-600'
};

const priorityClass: Record<string, string> = {
  HIGH: 'bg-rose-100 text-rose-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-slate-100 text-slate-600'
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
      window.addEventListener('casaflow:leads', load);
      return () => window.removeEventListener('casaflow:leads', load);
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
          <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">{t('crm')}</p><h2 className="text-xl font-bold">{t('recentLeads')}</h2></div>
          <div className="flex gap-3">
            <button
              className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                restrictions.canCreate
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
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
            <svg className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              type="text"
              value={searchQuery}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
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
            <p className="mb-2 text-xs font-semibold text-slate-600">Estado</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                onClick={() => setStatusFilter('ALL')}
                type="button"
              >
                Todos
              </button>
              {(Object.keys(leadStatusLabels) as LeadItem['status'][]).map(status => (
                <button
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === status ? statusClass[status] : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
            <p className="mb-2 text-xs font-semibold text-slate-600">Prioridad</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                onClick={() => setPriorityFilter('ALL')}
                type="button"
              >
                Todas
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'HIGH' ? priorityClass.HIGH : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                onClick={() => setPriorityFilter('HIGH')}
                type="button"
              >
                ⚡ Alta
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'MEDIUM' ? priorityClass.MEDIUM : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                onClick={() => setPriorityFilter('MEDIUM')}
                type="button"
              >
                🎯 Media
              </button>
              <button
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${priorityFilter === 'LOW' ? priorityClass.LOW : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                onClick={() => setPriorityFilter('LOW')}
                type="button"
              >
                📋 Baja
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-2.5 text-xs">
              <span className="font-medium text-indigo-900">
                {filteredLeads.length} {filteredLeads.length === 1 ? 'prospecto encontrado' : 'prospectos encontrados'}
              </span>
              <button
                className="font-semibold text-indigo-600 transition hover:text-indigo-700"
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
        {leads.length === 0 && <p className="py-10 text-center text-sm text-slate-500 col-span-full">{t('noLeads')}</p>}
        {filteredLeads.length === 0 && leads.length > 0 && (
          <div className="py-12 text-center col-span-full">
            <svg className="mx-auto mb-3 size-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-600">No se encontraron prospectos</p>
            <p className="mt-1 text-xs text-slate-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
        {filteredLeads.slice(0, expanded ? undefined : 5).map(lead => {
          const budget = formatBudget(lead.budgetMin, lead.budgetMax, lead.currencyCode);
          const phone = formatPhone(lead.phoneE164);

          return (
            <Link
              className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-400 hover:shadow-lg"
              key={lead.id}
              to={`/app/prospectos/${lead.id}`}
            >
              {/* Header compacto */}
              <div className="flex items-start gap-3 p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
                <div className="relative flex-shrink-0">
                  <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  {lead.priority === 'HIGH' && (
                    <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white">
                      <span className="text-[10px]">⚡</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {lead.firstName} {lead.lastName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${statusClass[lead.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      <span className="size-1 rounded-full bg-current"></span>
                      {leadStatusLabels[lead.status]}
                    </span>
                    {lead.score !== undefined && lead.score > 0 && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        lead.score >= 70 ? 'text-emerald-600' :
                        lead.score >= 40 ? 'text-amber-600' :
                        'text-slate-400'
                      }`}>
                        {lead.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Información compacta */}
              <div className="p-4 space-y-2 text-sm">
                {phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="size-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate font-medium">{phone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="size-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate font-medium">{lead.email}</span>
                  </div>
                )}
                {budget && (
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <svg className="size-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{budget}</span>
                  </div>
                )}
                {lead.city && (
                  <div className="flex items-center gap-2 text-slate-600">
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
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2.5 border-t border-amber-100">
                  <svg className="size-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-amber-600 font-medium truncate">
                      {new Date(lead.nextFollowUpAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
            </Link>
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
