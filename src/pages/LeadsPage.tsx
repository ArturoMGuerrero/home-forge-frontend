import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LeadList } from '../modules/leads/LeadList';
import { PageHeader } from '../shared/ui/PageHeader';
import { ExportButton } from '../shared/ExportButton';
import { LeadItem, leadStatusLabels, listLeads } from '../shared/leads';
import { CreateLeadModal } from '../modules/leads/CreateLeadModal';
import { UpgradeModal } from '../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { exportToExcel, formatDate } from '../shared/excelExport';
import { Button } from '../shared/ui';

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
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('52')) {
    const area = cleaned.slice(2, 5);
    const first = cleaned.slice(5, 8);
    const last = cleaned.slice(8);
    return `(${area}) ${first}-${last}`;
  }
  return phone;
}

export function LeadsPage() {
  const { t } = useTranslation();
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadItem['status'] | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<LeadItem['priority'] | 'ALL'>('ALL');

  function load() {
    listLeads()
      .then(setLeads)
      .catch(() => toast.error('No fue posible consultar los prospectos. Verifica que el backend esté activo.'));
  }

  useEffect(() => {
    load();
    window.addEventListener('casaflow:leads', load);
    return () => window.removeEventListener('casaflow:leads', load);
  }, []);

  const filteredLeads = leads.filter(lead => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(query);
      const matchesEmail = lead.email?.toLowerCase().includes(query);
      const matchesPhone = lead.phoneE164?.includes(query.replace(/\D/g, ''));
      if (!matchesName && !matchesEmail && !matchesPhone) return false;
    }
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
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
    <>
      <PageHeader
        title="Prospectos"
        subtitle="Consulta y registra personas interesadas en tus propiedades"
        actions={
          <div className="flex gap-3">
            <ExportButton onExport={handleExport} variant="secondary" />
            <Button
              variant="primary"
              onClick={handleCreateLead}
              disabled={!restrictions.canCreate}
            >
              {restrictions.canCreate ? `+ ${t('newLead')}` : `🔒 ${t('newLead')}`}
            </Button>
            <Link to="/app/prospectos/tareas">
              <Button variant="tertiary">
                Ver Tareas
              </Button>
            </Link>
            <Link to="/app/prospectos/pipeline">
              <Button variant="primary">
                Ver Pipeline
              </Button>
            </Link>
          </div>
        }
      />
      <LeadList
        expanded
        leads={leads}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        filteredLeads={filteredLeads}
      />
      <CreateLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={created => setLeads(current => [created, ...current])}
      />
      <UpgradeModal
        feature="crear nuevos prospectos"
        isOpen={upgradeModalOpen}
        level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </>
  );
}
