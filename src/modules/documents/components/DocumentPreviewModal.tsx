import { StoredDocument, storedDocumentDownloadUrl as documentDownloadUrl, storedDocumentViewUrl as documentViewUrl } from '../api/storedDocumentsApi';
import { Icon } from '../../../shared/Icon';
import { buttonClasses, EmptyState, Modal } from '../../../shared/ui';

type Props = {
  document: StoredDocument;
  onClose: () => void;
};

export function DocumentPreviewModal({ document: doc, onClose }: Props) {

  const downloadUrl = documentDownloadUrl(doc.id);
  const viewUrl = documentViewUrl(doc.id);
  const isPdf = doc.contentType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
  const isImage = doc.contentType?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(doc.fileName);
  const isWordDoc = doc.contentType?.includes('word') || /\.(doc|docx)$/i.test(doc.fileName);

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
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isPdf && (
            <iframe
              src={viewUrl}
              className="h-[70dvh] w-full"
              title={doc.fileName}
            />
          )}

          {isImage && (
            <div className="flex items-center justify-center p-6 bg-surface-muted">
              <img
                src={viewUrl}
                alt={doc.fileName}
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              />
            </div>
          )}

          {!isPdf && !isImage && (
            <EmptyState
              actions={<a className={buttonClasses()} href={downloadUrl}>{isWordDoc ? 'Descargar documento' : 'Descargar archivo'}</a>}
              description={isWordDoc ? 'Los documentos de Word no se pueden previsualizar en el navegador. Descarga el archivo para verlo.' : 'Este tipo de archivo no se puede previsualizar en el navegador.'}
              icon={<Icon name="document" />}
              title="Vista previa no disponible"
            />
          )}
        </div>

        {/* Footer with notes if any */}
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
