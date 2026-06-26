import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { changeLeadStatus, LeadItem, LeadStatus, leadStatusLabels, listLeads } from '../shared/leads';

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

const COLUMN_COLORS: Record<LeadStatus, { bg: string; border: string; badge: string }> = {
  NEW: { bg: 'bg-slate-50', border: 'border-slate-300', badge: 'bg-slate-100 text-slate-700' },
  CONTACTED: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-700' },
  QUALIFIED: { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-100 text-green-700' },
  TOUR_SCHEDULED: { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700' },
  TOUR_COMPLETED: { bg: 'bg-indigo-50', border: 'border-indigo-300', badge: 'bg-indigo-100 text-indigo-700' },
  OFFER_MADE: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-700' },
  UNDER_CONTRACT: { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-100 text-orange-700' },
  CLOSED: { bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-100 text-emerald-700' },
  LOST: { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-100 text-red-700' }
};

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
      className="block bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm text-slate-900 truncate">
            {lead.firstName} {lead.lastName}
          </div>
        </div>
        {lead.score !== undefined && lead.score > 0 && (
          <div className="flex items-center gap-0.5 shrink-0">
            <span className={`text-xs font-bold ${
              lead.score >= 70 ? 'text-green-600' :
              lead.score >= 40 ? 'text-yellow-600' :
              'text-slate-500'
            }`}>
              {lead.score}
            </span>
            <span className="text-[10px] text-slate-400">pts</span>
          </div>
        )}
      </div>

      {lead.email && (
        <div className="text-xs text-slate-600 truncate mb-1">{lead.email}</div>
      )}
      {lead.phoneE164 && (
        <div className="text-xs text-slate-600 mb-2">{lead.phoneE164}</div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {lead.budgetMax && (
          <div className="text-xs font-semibold text-slate-900">
            ${lead.budgetMax.toLocaleString()} {lead.currencyCode || 'MXN'}
          </div>
        )}
        {lead.city && (
          <div className="text-xs text-slate-500">{lead.city}</div>
        )}
      </div>

      {lead.priority && (
        <div className="mt-2">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            lead.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
            lead.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
            'bg-slate-100 text-slate-600'
          }`}>
            {lead.priority === 'HIGH' ? 'Alta' : lead.priority === 'MEDIUM' ? 'Media' : 'Baja'}
          </span>
        </div>
      )}
    </Link>
  );
}

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
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
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    try {
      await changeLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: newStatus } : l
      ));
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error al cambiar el estado del lead');
    }
  }

  function getLeadsByStatus(status: LeadStatus): LeadItem[] {
    return leads.filter(l => l.status === status);
  }

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Cargando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Link to="/app/prospectos" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline de Ventas</h1>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600">Arrastra los leads entre columnas para cambiar su estado</p>
          <div className="rounded-xl bg-white border border-slate-200 px-4 py-2 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">{leads.length}</span>
            <span className="text-sm text-slate-500 ml-1">leads totales</span>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="inline-flex gap-4 min-w-full">
            {PIPELINE_COLUMNS.map(status => {
              const columnLeads = getLeadsByStatus(status);
              const colors = COLUMN_COLORS[status];
              return (
                <SortableContext
                  key={status}
                  id={status}
                  items={columnLeads.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="w-72 shrink-0">
                    <div className={`rounded-2xl border-2 ${colors.border} ${colors.bg} p-4 min-h-[600px] shadow-sm`}>
                      {/* Column Header */}
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-800">{leadStatusLabels[status]}</h3>
                        <span className={`${colors.badge} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                          {columnLeads.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="space-y-3">
                        {columnLeads.map(lead => (
                          <LeadCard key={lead.id} lead={lead} />
                        ))}
                      </div>

                      {/* Empty State */}
                      {columnLeads.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="rounded-full bg-white/50 p-3 mb-2">
                            <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <p className="text-xs text-slate-500">Sin leads</p>
                        </div>
                      )}
                    </div>
                  </div>
                </SortableContext>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="rotate-2 w-72">
              <LeadCard lead={activeLead} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
