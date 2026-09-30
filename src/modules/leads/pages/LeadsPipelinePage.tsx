import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { changeLeadStatus, LeadItem, LeadStatus, leadStatusLabels, listLeads } from '../api/leadsApi';
import { leadStatusVariants } from '../components/LeadList';
import { LeadsNav } from '../components/LeadsNav';
import { Avatar, Badge, Card, cn, LoadingState, PageHeader } from '../../../shared/ui';

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

const priorityLabels: Record<LeadItem['priority'], string> = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' };

function LeadCardContent({ lead }: { lead: LeadItem }) {
  const name = `${lead.firstName} ${lead.lastName}`;
  return (
    <>
      <div className="flex items-start gap-2.5">
        <Avatar name={name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">{name}</p>
          {(lead.email || lead.city) && <p className="truncate text-xs text-fg-subtle">{lead.city || lead.email}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {lead.budgetMax && <span className="text-xs font-semibold tabular-nums text-fg">${lead.budgetMax.toLocaleString()}</span>}
        {lead.priority === 'HIGH' && <Badge dot variant="error">{priorityLabels.HIGH}</Badge>}
        {lead.score !== undefined && lead.score > 0 && (
          <Badge variant={lead.score >= 70 ? 'success' : lead.score >= 40 ? 'warning' : 'neutral'}>{lead.score} pts</Badge>
        )}
      </div>
    </>
  );
}

function DraggableLeadCard({ lead }: { lead: LeadItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

  return (
    <Link
      ref={setNodeRef}
      to={`/app/prospectos/${lead.id}`}
      {...attributes}
      {...listeners}
      className={cn(
        'block cursor-grab touch-none rounded-xl border border-border bg-surface p-3 shadow-card transition-[border-color,box-shadow,opacity]',
        'hover:border-primary-line hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing',
        isDragging && 'opacity-40'
      )}
    >
      <LeadCardContent lead={lead} />
    </Link>
  );
}

function PipelineColumn({ status, leads }: { status: LeadStatus; leads: LeadItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const total = leads.reduce((sum, lead) => sum + (lead.budgetMax ?? 0), 0);

  return (
    <section
      aria-label={leadStatusLabels[status]}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-2xl border bg-surface-muted transition-colors',
        isOver ? 'border-primary bg-primary-soft' : 'border-border'
      )}
      ref={setNodeRef}
    >
      <header className="flex items-center justify-between gap-2 px-3.5 pb-2 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <Badge dot variant={leadStatusVariants[status]}>{leadStatusLabels[status]}</Badge>
          <span className="text-xs font-semibold tabular-nums text-fg-subtle">{leads.length}</span>
        </div>
        {total > 0 && <span className="truncate text-xs tabular-nums text-fg-subtle">${total.toLocaleString()}</span>}
      </header>
      <div className="flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {leads.map(lead => <DraggableLeadCard key={lead.id} lead={lead} />)}
        {leads.length === 0 && (
          <p className="m-1 grid flex-1 place-items-center rounded-xl border border-dashed border-border-strong px-3 py-6 text-center text-xs text-fg-subtle">
            Suelta aquí un prospecto
          </p>
        )}
      </div>
    </section>
  );
}

export default function LeadsPipelinePage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    listLeads()
      .then(setLeads)
      .catch(error => toast.error(error instanceof Error ? error.message : 'No fue posible cargar el pipeline.'))
      .finally(() => setLoading(false));
  }, []);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const leadId = String(event.active.id);
    const target = event.over?.id as LeadStatus | undefined;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !target || lead.status === target) return;

    const previousStatus = lead.status;
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: target } : l)));
    try {
      await changeLeadStatus(leadId, target);
      toast.success(`${lead.firstName} pasó a ${leadStatusLabels[target]}`);
    } catch (error) {
      setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: previousStatus } : l)));
      toast.error(error instanceof Error ? error.message : 'Error al cambiar la etapa del prospecto');
    }
  }

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;
  const pipelineLeads = leads.filter(lead => PIPELINE_COLUMNS.includes(lead.status));

  return (
    <>
      <PageHeader
        badge={{ value: pipelineLeads.length, label: 'en el pipeline' }}
        subtitle="Arrastra cada prospecto a la columna de su nueva etapa."
        title="Pipeline de ventas"
      >
        <LeadsNav />
      </PageHeader>

      {loading ? (
        <Card><LoadingState message="Cargando pipeline..." /></Card>
      ) : (
        <DndContext onDragCancel={() => setActiveId(null)} onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
          <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            <div className="flex h-[calc(100dvh-16rem)] min-h-[28rem] gap-3">
              {PIPELINE_COLUMNS.map(status => (
                <PipelineColumn key={status} leads={leads.filter(lead => lead.status === status)} status={status} />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeLead ? (
              <div className="w-68 rotate-2 cursor-grabbing rounded-xl border border-primary bg-surface p-3 shadow-pop">
                <LeadCardContent lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </>
  );
}
