import { useState, useEffect } from 'react';
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
} from '../shared/notifications';
import { Modal } from '../shared/ui/Modal';
import { listLeads, LeadItem } from '../shared/leads';

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
      setLeads(data.filter(lead => lead.status === 'ACTIVE'));
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

  function handleChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleTemplateSelect(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      handleChange('notificationType', template.templateType);
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
      .replace(/\{telefono\}/g, lead.phone || '')
      .replace(/\{empresa\}/g, lead.company || '')
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
              if (!lead.phone) continue;
              payload.recipientPhone = lead.phone;
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
      lead.phone?.includes(query)
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Notificación"
      subtitle={isBulkMode ? `Envío masivo a ${bulkRecipientType === 'LEAD' ? selectedLeadIds.length + ' prospectos' : selectedOwnerIds.length + ' propietarios'}` : "Envía emails, WhatsApp, notificaciones push o SMS"}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle Individual / Masivo */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg bg-white border border-slate-200">
                <svg className="size-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Envío Masivo</p>
                <p className="text-xs text-slate-500">Enviar a múltiples destinatarios a la vez</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isBulkMode ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isBulkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Tipo de destinatario (solo en modo masivo) */}
          {isBulkMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Destinatario</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBulkRecipientType('LEAD');
                    setSelectedOwnerIds([]);
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    bulkRecipientType === 'LEAD'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  👥 Prospectos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkRecipientType('PROPERTY_OWNER');
                    setSelectedLeadIds([]);
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    bulkRecipientType === 'PROPERTY_OWNER'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  🏠 Propietarios
                </button>
              </div>
            </div>
          )}

          {/* Tipo de notificación */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo *</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(notificationTypeLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    handleChange('notificationType', key as NotificationType);
                    setSelectedTemplate(null);
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.notificationType === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Plantilla */}
          {filteredTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plantilla (opcional)</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={e => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">Sin plantilla</option>
                {filteredTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Destinatarios */}
          {isBulkMode ? (
            <div>
              {bulkRecipientType === 'LEAD' ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Prospectos ({selectedLeadIds.length} seleccionados)
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllLeads}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {selectedLeadIds.length === filteredLeads.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={searchLead}
                    onChange={e => setSearchLead(e.target.value)}
                    placeholder="Buscar por nombre, email o teléfono..."
                    className="w-full px-3 py-2 mb-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />

                  <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-200">
                    {filteredLeads.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No hay prospectos disponibles
                      </div>
                    ) : (
                      filteredLeads.map(lead => {
                        const canReceive = formData.notificationType === 'EMAIL' ? lead.email : lead.phone;
                        return (
                          <label
                            key={lead.id}
                            className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer ${
                              !canReceive ? 'opacity-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={() => toggleLeadSelection(lead.id)}
                              disabled={!canReceive}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {lead.firstName} {lead.lastName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {formData.notificationType === 'EMAIL' ? lead.email : lead.phone || 'Sin contacto'}
                              </p>
                            </div>
                            {!canReceive && (
                              <span className="text-xs text-amber-600 font-medium">
                                Sin {formData.notificationType === 'EMAIL' ? 'email' : 'teléfono'}
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Propietarios ({selectedOwnerIds.length} seleccionados)
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllOwners}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {selectedOwnerIds.length === filteredOwners.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={searchOwner}
                    onChange={e => setSearchOwner(e.target.value)}
                    placeholder="Buscar por nombre, propiedad, email o teléfono..."
                    className="w-full px-3 py-2 mb-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />

                  <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-200">
                    {filteredOwners.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No hay propietarios con información de contacto
                      </div>
                    ) : (
                      filteredOwners.map(owner => {
                        const canReceive = formData.notificationType === 'EMAIL' ? owner.ownerEmail : owner.ownerPhone;
                        return (
                          <label
                            key={owner.propertyId}
                            className={`flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer ${
                              !canReceive ? 'opacity-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedOwnerIds.includes(owner.propertyId)}
                              onChange={() => toggleOwnerSelection(owner.propertyId)}
                              disabled={!canReceive}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {owner.ownerName || 'Sin nombre'}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {formData.notificationType === 'EMAIL' ? owner.ownerEmail : owner.ownerPhone || 'Sin contacto'} • {owner.propertyCode}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {owner.propertyTitle}
                              </p>
                            </div>
                            {!canReceive && (
                              <span className="text-xs text-amber-600 font-medium">
                                Sin {formData.notificationType === 'EMAIL' ? 'email' : 'teléfono'}
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* Variables disponibles */}
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-indigo-900 mb-1">💡 Variables disponibles:</p>
                <p className="text-xs text-indigo-700">
                  {'{nombre}'}, {'{apellido}'}, {'{email}'}, {'{telefono}'}, {'{empresa}'}, {'{origen}'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={e => handleChange('recipientName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="Juan Pérez"
                />
              </div>

              {formData.notificationType === 'EMAIL' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.recipientEmail}
                    onChange={e => handleChange('recipientEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="ejemplo@email.com"
                  />
                </div>
              )}

              {(formData.notificationType === 'WHATSAPP' || formData.notificationType === 'SMS') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={formData.recipientPhone}
                    onChange={e => handleChange('recipientPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="+52 614 123 4567"
                  />
                </div>
              )}
            </div>
          )}

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(notificationPriorityLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('priority', key as NotificationPriority)}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all text-xs font-medium ${
                    formData.priority === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Asunto (emails) */}
          {formData.notificationType === 'EMAIL' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Asunto *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Información sobre tu propiedad"
              />
            </div>
          )}

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje *</label>
            <textarea
              required
              value={formData.content}
              onChange={e => handleChange('content', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          {/* Programar */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Programar envío (opcional)</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={e => handleChange('scheduledFor', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || (isBulkMode && selectedLeadIds.length === 0)}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Enviando...'
                : isBulkMode
                  ? `Enviar a ${selectedLeadIds.length} prospectos`
                  : formData.scheduledFor
                    ? 'Programar'
                    : 'Enviar'
              }
            </button>
          </div>
        </form>
    </Modal>
  );
}
