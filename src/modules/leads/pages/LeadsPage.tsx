import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { formatBudget, formatPhone, LeadList } from '../components/LeadList';
import { LeadsNav } from '../components/LeadsNav';
import { ExportButton } from '../../../shared/ExportButton';
import { LEADS_CHANGED_EVENT, LeadItem, leadStatusLabels, listLeads } from '../api/leadsApi';
import { CreateLeadModal } from '../components/CreateLeadModal';
import { ImportLeadsModal } from '../components/ImportLeadsModal';
import { UpgradeModal } from '../../../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { exportToExcel } from '../../../shared/excelExport';
import { Icon } from '../../../shared/Icon';
import { Button, PageHeader } from '../../../shared/ui';

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja'
};

export function LeadsPage() {
  const { t } = useTranslation();
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
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
    window.addEventListener(LEADS_CHANGED_EVENT, load);
    return () => window.removeEventListener(LEADS_CHANGED_EVENT, load);
  }, []);

  const filteredLeads = leads.filter(lead => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(query);
      const matchesEmail = lead.email?.toLowerCase().includes(query);
      const digits = query.replace(/\D/g, '');
      const matchesPhone = digits !== '' && lead.phoneE164?.includes(digits);
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

  function handleImport() {
    if (!restrictions.canCreate) {
      setUpgradeModalOpen(true);
      return;
    }
    setImportModalOpen(true);
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
        actions={
          <>
            <ExportButton onExport={handleExport} variant="secondary" />
            <Button icon={<Icon className="size-4" name="upload" />} onClick={handleImport} variant="tertiary">Importar</Button>
            <Button icon={<Icon className="size-4" name={restrictions.canCreate ? 'plus' : 'lock'} />} onClick={handleCreateLead}>
              {t('newLead')}
            </Button>
          </>
        }
        badge={{ value: leads.length, label: 'prospectos' }}
        subtitle="Consulta y registra personas interesadas en tus propiedades."
        title="Prospectos"
      >
        <LeadsNav />
      </PageHeader>

      <LeadList
        filteredLeads={filteredLeads}
        leads={leads}
        onCreate={restrictions.canCreate ? handleCreateLead : undefined}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        setPriorityFilter={setPriorityFilter}
        setSearchQuery={setSearchQuery}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
      />
      <CreateLeadModal
        onClose={() => setModalOpen(false)}
        onCreated={created => setLeads(current => [created, ...current])}
        open={modalOpen}
      />
      <ImportLeadsModal
        existingLeads={leads}
        onClose={() => setImportModalOpen(false)}
        onImported={created => setLeads(current => [...created, ...current])}
        open={importModalOpen}
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
