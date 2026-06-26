import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { changeLeadStatus, LeadItem, LeadStatus, leadStatusLabels, listLeads } from '../shared/leads';
import { Tabs, Tab } from '../shared/ui/Tabs';
import { PageHeader } from '../shared/ui/PageHeader';
import { InfoBanner } from '../shared/ui/InfoBanner';

const PIPELINE_COLUMNS: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'TOUR_SCHEDULED',
  'TOUR_COMPLETED',
  'OFFER_MADE',
  'UNDER_CONTRACT',
  'CLOSED'
];

interface LeadCardProps {
  lead: LeadItem;
  isDragging?: boolean;
}

function LeadCard({ lead, isDragging }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <Link
      to={`/app/prospectos/${lead.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing"
    >
      {/* Avatar/Initials */}
      <div className="size-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
        {lead.firstName[0]}{lead.lastName[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 truncate">
            {lead.firstName} {lead.lastName}
          </h3>
          {lead.score !== undefined && lead.score > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              lead.score >= 70 ? 'bg-green-100 text-green-700' :
              lead.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {lead.score} pts
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {lead.email && <span className="truncate">{lead.email}</span>}
          {lead.phoneE164 && <span>{lead.phoneE164}</span>}
          {lead.city && <span>• {lead.city}</span>}
        </div>
      </div>

      {/* Budget & Priority */}
      <div className="text-right shrink-0">
        {lead.budgetMax && (
          <div className="text-sm font-bold text-slate-900 mb-1">
            ${lead.budgetMax.toLocaleString()}
          </div>
        )}
        {lead.priority && (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            lead.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
            lead.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {lead.priority === 'HIGH' ? 'Alta' : lead.priority === 'MEDIUM' ? 'Media' : 'Baja'}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [activeTab, setActiveTab] = useState<LeadStatus>('NEW');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      const data = await listLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    setActiveId(null);

    const leadId = active.id as string;
    const lead = leads.find(l => l.id === leadId);

    if (!lead || lead.status === activeTab) return;

    try {
      await changeLeadStatus(leadId, activeTab);
      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: activeTab } : l
      ));
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error al cambiar el estado del lead');
    }
  }

  function getLeadsByStatus(status: LeadStatus): LeadItem[] {
    return leads.filter(l => l.status === status);
  }

  const tabs: Tab[] = PIPELINE_COLUMNS.map(status => ({
    id: status,
    label: leadStatusLabels[status],
    count: getLeadsByStatus(status).length
  }));

  const currentLeads = getLeadsByStatus(activeTab);
  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Cargando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Pipeline de Ventas"
        subtitle="Gestiona el estado de tus prospectos"
        backLink={{ to: '/app/prospectos', label: 'Volver' }}
        badge={{ value: leads.length, label: 'leads' }}
      >
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as LeadStatus)} variant="cards" size="md" />
      </PageHeader>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="mb-5">
            <InfoBanner
              title="Arrastra los leads para cambiar su estado"
              description={`Los leads en esta pestaña se moverán a: ${leadStatusLabels[activeTab]}`}
              variant="info"
            />
          </div>

          <SortableContext
            items={currentLeads.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 max-w-6xl">
              {currentLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </SortableContext>

          {currentLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <svg className="size-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No hay leads en {leadStatusLabels[activeTab]}</h3>
              <p className="text-sm text-slate-500">Arrastra leads desde otras etapas o crea uno nuevo</p>
            </div>
          )}

          <DragOverlay>
            {activeLead ? (
              <div className="rotate-2 max-w-2xl">
                <LeadCard lead={activeLead} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
