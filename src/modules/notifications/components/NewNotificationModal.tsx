import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  NotificationType,
  NotificationPriority,
  RecipientType,
  MessageTemplate,
  PropertyOwner,
  createNotification,
  listMessageTemplates,
  listPropertyOwners,
  notificationTypeLabels,
  notificationPriorityLabels
} from '../api/notificationsApi';
import { Alert, Badge, Button, cn, Input, Modal, SearchInput, SegmentedControl, Select, Switch, Textarea } from '../../../shared/ui';
import { listLeads, LeadItem } from '../../leads';

const FORM_ID = 'new-notification-form';

type NewNotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function NewNotificationModal({ isOpen, onClose, onSuccess }: NewNotificationModalProps) {
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkRecipientType, setBulkRecipientType] = useState<'LEAD' | 'PROPERTY_OWNER'>('LEAD');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [propertyOwners, setPropertyOwners] = useState<PropertyOwner[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
  const [searchLead, setSearchLead] = useState('');
  const [searchOwner, setSearchOwner] = useState('');

  const [formData, setFormData] = useState({
    notificationType: 'EMAIL' as NotificationType,
    priority: 'MEDIUM' as NotificationPriority,
    recipientType: 'CUSTOM' as RecipientType,
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    subject: '',
    content: '',
    scheduledFor: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      if (isBulkMode) {
        if (bulkRecipientType === 'LEAD') {
          loadLeads();
        } else {
          loadPropertyOwners();
        }
      }
    }
  }, [isOpen, isBulkMode, bulkRecipientType]);

  async function loadTemplates() {
    try {
      const data = await listMessageTemplates();
      setTemplates(data.filter(t => t.active));
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  async function loadLeads() {
    try {
      const data = await listLeads();
      setLeads(data.filter(lead => lead.status !== 'CLOSED' && lead.status !== 'LOST'));
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  }

  async function loadPropertyOwners() {
    try {
      const data = await listPropertyOwners();
      setPropertyOwners(data);
    } catch (error) {
      console.error('Error loading property owners:', error);
    }
  }

  function handleChange<K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleTemplateSelect(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      handleChange('notificationType', template.templateType as NotificationType);
      handleChange('subject', template.subject || '');
      handleChange('content', template.content);
    } else {
      setSelectedTemplate(null);
    }
  }

  function replaceVariables(text: string, lead: LeadItem): string {
    return text
      .replace(/\{nombre\}/g, lead.firstName)
      .replace(/\{apellido\}/g, lead.lastName)
      .replace(/\{email\}/g, lead.email || '')
      .replace(/\{telefono\}/g, lead.phoneE164 || '')
      .replace(/\{empresa\}/g, '')
      .replace(/\{origen\}/g, lead.source || '');
  }

  function replaceOwnerVariables(text: string, owner: PropertyOwner): string {
    return text
      .replace(/\{nombreDueno\}/g, owner.ownerName || '')
      .replace(/\{emailDueno\}/g, owner.ownerEmail || '')
      .replace(/\{telefonoDueno\}/g, owner.ownerPhone || '')
      .replace(/\{propiedad\}/g, owner.propertyTitle || '')
      .replace(/\{codigoPropiedad\}/g, owner.propertyCode || '');
  }

  function toggleLeadSelection(leadId: string) {
    setSelectedLeadIds(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  }

  function toggleAllLeads() {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  }

  function toggleOwnerSelection(ownerId: string) {
    setSelectedOwnerIds(prev =>
      prev.includes(ownerId)
        ? prev.filter(id => id !== ownerId)
        : [...prev, ownerId]
    );
  }

  function toggleAllOwners() {
    if (selectedOwnerIds.length === filteredOwners.length) {
      setSelectedOwnerIds([]);
    } else {
      setSelectedOwnerIds(filteredOwners.map(o => o.propertyId));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isBulkMode) {
      return handleBulkSubmit();
    }

    setSaving(true);

    try {
      const payload: any = {
        notificationType: formData.notificationType,
        priority: formData.priority,
        recipientType: formData.recipientType,
        recipientName: formData.recipientName,
        content: formData.content
      };

      if (formData.recipientEmail) payload.recipientEmail = formData.recipientEmail;
      if (formData.recipientPhone) payload.recipientPhone = formData.recipientPhone;
      if (formData.subject) payload.subject = formData.subject;
      if (formData.scheduledFor) payload.scheduledFor = new Date(formData.scheduledFor).toISOString();

      await createNotification(payload);
      toast.success('Notificación enviada exitosamente');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error al crear la notificación');
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkSubmit() {
    if (bulkRecipientType === 'LEAD' && selectedLeadIds.length === 0) {
      toast.error('Selecciona al menos un prospecto');
      return;
    }

    if (bulkRecipientType === 'PROPERTY_OWNER' && selectedOwnerIds.length === 0) {
      toast.error('Selecciona al menos un propietario');
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      if (bulkRecipientType === 'LEAD') {
        const selectedLeadsData = leads.filter(l => selectedLeadIds.includes(l.id));

        for (const lead of selectedLeadsData) {
          try {
            const payload: any = {
              notificationType: formData.notificationType,
              priority: formData.priority,
              recipientType: 'LEAD',
              recipientName: `${lead.firstName} ${lead.lastName}`,
              content: replaceVariables(formData.content, lead),
              leadId: lead.id
            };

            if (formData.notificationType === 'EMAIL') {
              if (!lead.email) continue;
              payload.recipientEmail = lead.email;
              payload.subject = replaceVariables(formData.subject, lead);
            }

            if (formData.notificationType === 'WHATSAPP' || formData.notificationType === 'SMS') {
              if (!lead.phoneE164) continue;
              payload.recipientPhone = lead.phoneE164;
            }

            if (formData.scheduledFor) {
              payload.scheduledFor = new Date(formData.scheduledFor).toISOString();
            }

            await createNotification(payload);
            successCount++;
          } catch (error) {
            console.error(`Error sending to ${lead.firstName}:`, error);
            errorCount++;
          }
        }
      } else {
        // PROPERTY_OWNER
        const selectedOwnersData = propertyOwners.filter(o => selectedOwnerIds.includes(o.propertyId));

        for (const owner of selectedOwnersData) {
          try {
            const payload: any = {
              notificationType: formData.notificationType,
              priority: formData.priority,
              recipientType: 'PROPERTY_OWNER',
              recipientName: owner.ownerName,
              content: replaceOwnerVariables(formData.content, owner),
              propertyId: owner.propertyId
            };

            if (formData.notificationType === 'EMAIL') {
              if (!owner.ownerEmail) continue;
              payload.recipientEmail = owner.ownerEmail;
              payload.subject = replaceOwnerVariables(formData.subject, owner);
            }

            if (formData.notificationType === 'WHATSAPP' || formData.notificationType === 'SMS') {
              if (!owner.ownerPhone) continue;
              payload.recipientPhone = owner.ownerPhone;
            }

            if (formData.scheduledFor) {
              payload.scheduledFor = new Date(formData.scheduledFor).toISOString();
            }

            await createNotification(payload);
            successCount++;
          } catch (error) {
            console.error(`Error sending to ${owner.ownerName}:`, error);
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} notificaciones enviadas exitosamente`);
        onSuccess();
        handleClose();
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} notificaciones fallaron`);
      }
    } catch (error) {
      console.error('Error in bulk send:', error);
      toast.error('Error al enviar notificaciones');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setFormData({
      notificationType: 'EMAIL',
      priority: 'MEDIUM',
      recipientType: 'CUSTOM',
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      subject: '',
      content: '',
      scheduledFor: ''
    });
    setSelectedTemplate(null);
    setIsBulkMode(false);
    setBulkRecipientType('LEAD');
    setSelectedLeadIds([]);
    setSelectedOwnerIds([]);
    setSearchLead('');
    setSearchOwner('');
    onClose();
  }

  const filteredTemplates = templates.filter(t => t.templateType === formData.notificationType);

  const filteredLeads = leads.filter(lead => {
    if (!searchLead) return true;
    const query = searchLead.toLowerCase();
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phoneE164?.includes(query)
    );
  });

  const filteredOwners = propertyOwners.filter(owner => {
    if (!searchOwner) return true;
    const query = searchOwner.toLowerCase();
    return (
      owner.ownerName?.toLowerCase().includes(query) ||
      owner.ownerEmail?.toLowerCase().includes(query) ||
      owner.ownerPhone?.includes(query) ||
      owner.propertyTitle?.toLowerCase().includes(query) ||
      owner.propertyCode?.toLowerCase().includes(query)
    );
  });

  const isEmail = formData.notificationType === 'EMAIL';
  const usesPhone = formData.notificationType === 'WHATSAPP' || formData.notificationType === 'SMS';
  const bulkCount = bulkRecipientType === 'LEAD' ? selectedLeadIds.length : selectedOwnerIds.length;
  const bulkNoun = bulkRecipientType === 'LEAD' ? (bulkCount === 1 ? 'prospecto' : 'prospectos') : (bulkCount === 1 ? 'propietario' : 'propietarios');
  const contactKind = isEmail ? 'email' : 'teléfono';

  return (
    <Modal
      footer={
        <>
          <Button onClick={handleClose} variant="tertiary">Cancelar</Button>
          <Button disabled={isBulkMode && bulkCount === 0} form={FORM_ID} loading={saving} type="submit">
            {saving
              ? 'Enviando...'
              : isBulkMode
                ? `Enviar a ${bulkCount} ${bulkNoun}`
                : formData.scheduledFor
                  ? 'Programar'
                  : 'Enviar'}
          </Button>
        </>
      }
      isOpen={isOpen}
      maxWidth="3xl"
      onClose={handleClose}
      subtitle={isBulkMode ? `Envío masivo a ${bulkCount} ${bulkNoun}` : 'Envía emails, WhatsApp, notificaciones push o SMS'}
      title="Nueva notificación"
    >
      <form className="space-y-6" id={FORM_ID} onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-surface-muted p-4">
          <Switch
            checked={isBulkMode}
            description="Enviar a múltiples destinatarios a la vez"
            label="Envío masivo"
            onChange={setIsBulkMode}
          />
        </div>

        {isBulkMode && (
          <SegmentedControl
            fullWidth
            label="Tipo de destinatario"
            onChange={value => {
              setBulkRecipientType(value);
              if (value === 'LEAD') setSelectedOwnerIds([]);
              else setSelectedLeadIds([]);
            }}
            options={[{ value: 'LEAD', label: 'Prospectos' }, { value: 'PROPERTY_OWNER', label: 'Propietarios' }]}
            value={bulkRecipientType}
          />
        )}

        <SegmentedControl
          fullWidth
          label="Canal"
          onChange={value => {
            handleChange('notificationType', value);
            setSelectedTemplate(null);
          }}
          options={(Object.entries(notificationTypeLabels) as Array<[NotificationType, string]>).map(([value, label]) => ({ value, label }))}
          value={formData.notificationType}
        />

        {filteredTemplates.length > 0 && (
          <Select
            label="Plantilla (opcional)"
            onChange={e => handleTemplateSelect(e.target.value)}
            options={filteredTemplates.map(template => ({ value: template.id, label: template.name }))}
            placeholder="Sin plantilla"
            value={selectedTemplate?.id || ''}
          />
        )}

        {isBulkMode ? (
          <div>
            {bulkRecipientType === 'LEAD' ? (
              <RecipientPicker
                allSelected={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                emptyLabel="No hay prospectos disponibles"
                label={`Prospectos (${selectedLeadIds.length} seleccionados)`}
                onSearch={setSearchLead}
                onToggleAll={toggleAllLeads}
                search={searchLead}
                searchPlaceholder="Buscar por nombre, email o teléfono..."
              >
                {filteredLeads.map(lead => {
                  const contact = isEmail ? lead.email : lead.phoneE164;
                  return (
                    <RecipientRow
                      checked={selectedLeadIds.includes(lead.id)}
                      detail={contact || 'Sin contacto'}
                      disabledReason={contact ? undefined : `Sin ${contactKind}`}
                      key={lead.id}
                      name={`${lead.firstName} ${lead.lastName}`}
                      onToggle={() => toggleLeadSelection(lead.id)}
                    />
                  );
                })}
              </RecipientPicker>
            ) : (
              <RecipientPicker
                allSelected={filteredOwners.length > 0 && selectedOwnerIds.length === filteredOwners.length}
                emptyLabel="No hay propietarios con información de contacto"
                label={`Propietarios (${selectedOwnerIds.length} seleccionados)`}
                onSearch={setSearchOwner}
                onToggleAll={toggleAllOwners}
                search={searchOwner}
                searchPlaceholder="Buscar por nombre, propiedad, email o teléfono..."
              >
                {filteredOwners.map(owner => {
                  const contact = isEmail ? owner.ownerEmail : owner.ownerPhone;
                  return (
                    <RecipientRow
                      checked={selectedOwnerIds.includes(owner.propertyId)}
                      detail={`${contact || 'Sin contacto'} · ${owner.propertyCode} · ${owner.propertyTitle}`}
                      disabledReason={contact ? undefined : `Sin ${contactKind}`}
                      key={owner.propertyId}
                      name={owner.ownerName || 'Sin nombre'}
                      onToggle={() => toggleOwnerSelection(owner.propertyId)}
                    />
                  );
                })}
              </RecipientPicker>
            )}

            <Alert className="mt-3" title="Variables disponibles">
              <code className="text-xs">
                {bulkRecipientType === 'LEAD'
                  ? '{nombre}, {apellido}, {email}, {telefono}, {empresa}, {origen}'
                  : '{nombreDueno}, {emailDueno}, {telefonoDueno}, {propiedad}, {codigoPropiedad}'}
              </code>
            </Alert>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nombre" onChange={e => handleChange('recipientName', e.target.value)} placeholder="Juan Pérez" required value={formData.recipientName} />
            {isEmail && (
              <Input label="Email" onChange={e => handleChange('recipientEmail', e.target.value)} placeholder="ejemplo@email.com" required type="email" value={formData.recipientEmail} />
            )}
            {usesPhone && (
              <Input label="Teléfono" onChange={e => handleChange('recipientPhone', e.target.value)} placeholder="+52 614 123 4567" required type="tel" value={formData.recipientPhone} />
            )}
          </div>
        )}

        <SegmentedControl
          label="Prioridad"
          onChange={value => handleChange('priority', value)}
          options={(Object.entries(notificationPriorityLabels) as Array<[NotificationPriority, string]>).map(([value, label]) => ({ value, label }))}
          size="sm"
          value={formData.priority}
        />

        {isEmail && (
          <Input label="Asunto" onChange={e => handleChange('subject', e.target.value)} placeholder="Información sobre tu propiedad" required value={formData.subject} />
        )}

        <Textarea label="Mensaje" onChange={e => handleChange('content', e.target.value)} placeholder="Escribe tu mensaje aquí..." required rows={6} value={formData.content} />

        <Input containerClassName="sm:max-w-xs" label="Programar envío (opcional)" onChange={e => handleChange('scheduledFor', e.target.value)} type="datetime-local" value={formData.scheduledFor} />
      </form>
    </Modal>
  );
}

function RecipientPicker({ label, allSelected, onToggleAll, search, onSearch, searchPlaceholder, emptyLabel, children }: {
  label: string;
  allSelected: boolean;
  onToggleAll: () => void;
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder: string;
  emptyLabel: string;
  children: ReactNode[];
}) {
  return (
    <fieldset>
      <div className="mb-2 flex items-center justify-between gap-3">
        <legend className="text-sm font-semibold text-fg-muted">{label}</legend>
        <Button onClick={onToggleAll} size="sm" variant="ghost">{allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}</Button>
      </div>
      <SearchInput aria-label={searchPlaceholder} containerClassName="mb-2" onChange={e => onSearch(e.target.value)} onClear={() => onSearch('')} placeholder={searchPlaceholder} value={search} />
      <div className="max-h-64 divide-y divide-border overflow-y-auto rounded-xl border border-border">
        {children.length === 0 ? <p className="p-4 text-center text-sm text-fg-subtle">{emptyLabel}</p> : children}
      </div>
    </fieldset>
  );
}

function RecipientRow({ name, detail, checked, disabledReason, onToggle }: {
  name: string;
  detail: string;
  checked: boolean;
  disabledReason?: string;
  onToggle: () => void;
}) {
  return (
    <label className={cn('flex items-center gap-3 px-3 py-2.5', disabledReason ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-muted')}>
      <input checked={checked} className="size-4" disabled={Boolean(disabledReason)} onChange={onToggle} type="checkbox" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{name}</span>
        <span className="block truncate text-xs text-fg-subtle">{detail}</span>
      </span>
      {disabledReason && <Badge variant="warning">{disabledReason}</Badge>}
    </label>
  );
}
