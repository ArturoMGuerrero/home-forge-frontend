import { useEffect, useRef } from 'react';
import { StoredDocument, documentDownloadUrl } from '../shared/operationsApi';

type Props = {
  document: StoredDocument;
  onClose: () => void;
};

export function DocumentPreviewModal({ document: doc, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.document.addEventListener('keydown', handleEscape);
    return () => window.document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    window.document.addEventListener('mousedown', handleClickOutside);
    return () => window.document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const downloadUrl = documentDownloadUrl(doc.id);
  const isPdf = doc.contentType === 'application/pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
  const isImage = doc.contentType?.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(doc.fileName);
  const isWordDoc = doc.contentType?.includes('word') || /\.(doc|docx)$/i.test(doc.fileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div ref={modalRef} className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-lg font-bold text-slate-900 truncate">{doc.fileName}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span>{doc.documentType}</span>
              <span>•</span>
              <span>{new Date(doc.createdAt).toLocaleDateString('es-MX')}</span>
              {doc.leadName && (
                <>
                  <span>•</span>
                  <span>{doc.leadName}</span>
                </>
              )}
              {doc.propertyTitle && (
                <>
                  <span>•</span>
                  <span>{doc.propertyTitle}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Cerrar"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isPdf && (
            <iframe
              src={downloadUrl}
              className="w-full h-full min-h-[600px]"
              title={doc.fileName}
            />
          )}

          {isImage && (
            <div className="flex items-center justify-center p-6 bg-slate-50">
              <img
                src={downloadUrl}
                alt={doc.fileName}
                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              />
            </div>
          )}

          {isWordDoc && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-indigo-100 p-6 mb-4">
                <svg className="size-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Vista previa no disponible</h3>
              <p className="text-sm text-slate-600 mb-6 max-w-md">
                Los documentos de Word no se pueden previsualizar en el navegador. Descarga el archivo para verlo.
              </p>
              <a
                href={downloadUrl}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
              >
                Descargar documento
              </a>
            </div>
          )}

          {!isPdf && !isImage && !isWordDoc && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <svg className="size-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Vista previa no disponible</h3>
              <p className="text-sm text-slate-600 mb-6">
                Este tipo de archivo no se puede previsualizar en el navegador.
              </p>
              <a
                href={downloadUrl}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
              >
                Descargar archivo
              </a>
            </div>
          )}
        </div>

        {/* Footer with notes if any */}
        {doc.notes && (
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500 mb-1">Notas:</p>
            <p className="text-sm text-slate-700">{doc.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
