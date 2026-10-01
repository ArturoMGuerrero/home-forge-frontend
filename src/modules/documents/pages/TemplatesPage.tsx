import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DocumentTemplate,
  documentTypeLabels,
  listDocumentTemplates,
  toggleTemplateActive
} from '../api/documentsApi';
import { Icon } from '../../../shared/Icon';
import { Badge, Button, buttonClasses, Card, cn, EmptyState, LoadingState, PageHeader, Switch } from '../../../shared/ui';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    listDocumentTemplates()
      .then(setTemplates)
      .catch(error => toast.error(error instanceof Error ? error.message : 'No fue posible cargar las plantillas.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleActive(templateId: string) {
    try {
      const updated = await toggleTemplateActive(templateId);
      setTemplates(prev => prev.map(t => t.id === templateId ? updated : t));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar estado de la plantilla');
    }
  }

  const filteredTemplates = showInactive ? templates : templates.filter(t => t.active);

  return (
    <>
      <PageHeader
        actions={
          <Link className={buttonClasses()} to="/app/contratos/plantillas/nueva">
            <Icon className="size-4" name="plus" />
            Nueva plantilla
          </Link>
        }
        backLink={{ to: '/app/contratos', label: 'Contratos' }}
        badge={{ value: templates.filter(t => t.active).length, label: 'activas' }}
        subtitle="Crea y gestiona plantillas reutilizables con variables dinámicas."
        title="Plantillas de documentos"
      />

      {loading ? (
        <Card><LoadingState message="Cargando plantillas..." /></Card>
      ) : (
        <>
          <Switch checked={showInactive} className="mb-5 justify-start" label="Mostrar inactivas" onChange={setShowInactive} />

          {filteredTemplates.length === 0 ? (
            <Card className="border-dashed">
              <EmptyState
                description="Crea tu primera plantilla con variables dinámicas."
                icon={<Icon name="document" />}
                title={showInactive ? 'No hay plantillas' : 'No hay plantillas activas'}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredTemplates.map(template => (
                <Card className={cn('flex flex-col', !template.active && 'opacity-70')} key={template.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-fg">{template.name}</h3>
                    {template.isDefault && <Badge variant="info">Por defecto</Badge>}
                    {!template.active && <Badge>Inactiva</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-fg-subtle">{documentTypeLabels[template.documentType]} · v{template.version}</p>
                  {template.description && <p className="mt-2 text-sm text-fg-muted">{template.description}</p>}

                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <Link className={buttonClasses({ variant: 'secondary', size: 'sm' })} to={`/app/contratos/plantillas/${template.id}`}>Ver / editar</Link>
                    <Button onClick={() => handleToggleActive(template.id)} size="sm" variant="ghost">
                      {template.active ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
