import { StoredDocument, storedDocumentDownloadUrl as documentDownloadUrl, storedDocumentViewUrl as documentViewUrl } from '../api/storedDocumentsApi';
import { Modal } from '../../../shared/ui/Modal';

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
              className="w-full h-full min-h-[600px]"
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

          {isWordDoc && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-primary-muted p-6 mb-4">
                <svg className="size-12 text-primary-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-fg mb-2">Vista previa no disponible</h3>
              <p className="text-sm text-fg-muted mb-6 max-w-md">
                Los documentos de Word no se pueden previsualizar en el navegador. Descarga el archivo para verlo.
              </p>
              <a
                href={downloadUrl}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
              >
                Descargar documento
              </a>
            </div>
          )}

          {!isPdf && !isImage && !isWordDoc && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-surface-sunken p-6 mb-4">
                <svg className="size-12 text-fg-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-fg mb-2">Vista previa no disponible</h3>
              <p className="text-sm text-fg-muted mb-6">
                Este tipo de archivo no se puede previsualizar en el navegador.
              </p>
              <a
                href={downloadUrl}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
              >
                Descargar archivo
              </a>
            </div>
          )}
        </div>

        {/* Footer with notes if any */}
        {doc.notes && (
          <div className="border-t border-border px-6 py-4 bg-surface-muted">
            <p className="text-xs font-semibold text-fg-subtle mb-1">Notas:</p>
            <p className="text-sm text-fg-muted">{doc.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
