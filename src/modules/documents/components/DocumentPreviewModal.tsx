import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { downloadStoredDocument, fetchStoredDocument, StoredDocument } from '../api/storedDocumentsApi';
import { Icon } from '../../../shared/Icon';
import { Button, EmptyState, LoadingState, Modal } from '../../../shared/ui';

type Props = {
  document: StoredDocument;
  onClose: () => void;
};

export function DocumentPreviewModal({ document: doc, onClose }: Props) {
  const isPdf = doc.contentType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
  const isImage = doc.contentType?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(doc.fileName);
  const isWordDoc = doc.contentType?.includes('word') || /\.(doc|docx)$/i.test(doc.fileName);
  const canPreview = isPdf || isImage;

  // El archivo requiere sesión: se descarga con el token y se muestra desde una URL local.
  const [viewUrl, setViewUrl] = useState<string>();
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!canPreview) return;
    let objectUrl: string | undefined;
    let cancelled = false;
    fetchStoredDocument(doc.id, 'view')
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setViewUrl(objectUrl);
      })
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id, canPreview]);

  const download = () => downloadStoredDocument(doc).catch(() => toast.error('No se pudo descargar el documento'));

  const subtitle = [
    doc.documentType,
    new Date(doc.createdAt).toLocaleDateString('es-MX'),
    doc.leadName,
    doc.propertyTitle
  ].filter(Boolean).join(' • ');

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={doc.fileName}
      subtitle={subtitle}
      maxWidth="5xl"
      noPadding={true}
    >
      <div className="flex flex-col">
        <div className="flex-1 overflow-auto">
          {canPreview && !viewUrl && !loadFailed && <LoadingState className="h-[40dvh]" message="Cargando documento..." />}

          {canPreview && loadFailed && (
            <EmptyState
              actions={<Button onClick={download}>Descargar archivo</Button>}
              description="No se pudo cargar la vista previa. Intenta descargar el archivo."
              icon={<Icon name="document" />}
              title="Vista previa no disponible"
            />
          )}

          {isPdf && viewUrl && (
            <iframe
              src={viewUrl}
              className="h-[70dvh] w-full"
              title={doc.fileName}
            />
          )}

          {isImage && viewUrl && (
            <div className="flex items-center justify-center p-6 bg-surface-muted">
              <img
                src={viewUrl}
                alt={doc.fileName}
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              />
            </div>
          )}

          {!canPreview && (
            <EmptyState
              actions={<Button onClick={download}>{isWordDoc ? 'Descargar documento' : 'Descargar archivo'}</Button>}
              description={isWordDoc ? 'Los documentos de Word no se pueden previsualizar en el navegador. Descarga el archivo para verlo.' : 'Este tipo de archivo no se puede previsualizar en el navegador.'}
              icon={<Icon name="document" />}
              title="Vista previa no disponible"
            />
          )}
        </div>

        {doc.notes && (
          <div className="border-t border-border bg-surface-muted px-6 py-4">
            <p className="mb-1 text-xs font-semibold text-fg-subtle">Notas</p>
            <p className="text-sm text-fg-muted">{doc.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
