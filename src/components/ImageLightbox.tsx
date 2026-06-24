import { useEffect, useState } from 'react';

type ImageLightboxProps = {
  images: string[];
  initialIndex: number;
  onClose: () => void;
};

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') goToPrevious();
      if (event.key === 'ArrowRight') goToNext();
    }

    document.addEventListener('keydown', handleKeyPress);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'auto';
    };
  }, [currentIndex]);

  function goToPrevious() {
    setCurrentIndex(current => (current === 0 ? images.length - 1 : current - 1));
    setIsZoomed(false);
  }

  function goToNext() {
    setCurrentIndex(current => (current === images.length - 1 ? 0 : current + 1));
    setIsZoomed(false);
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `imagen-${currentIndex + 1}.jpg`;
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-slate-950/80 to-transparent p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? 'Alejar' : 'Acercar'}
            type="button"
          >
            {isZoomed ? (
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            ) : (
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            )}
          </button>
          <button
            className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={downloadImage}
            title="Descargar imagen"
            type="button"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={onClose}
            title="Cerrar (Esc)"
            type="button"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="relative flex size-full items-center justify-center p-20">
        <img
          alt={`Imagen ${currentIndex + 1}`}
          className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          src={images[currentIndex]}
        />
      </div>

      {/* Navegación */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={goToPrevious}
            title="Anterior (←)"
            type="button"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={goToNext}
            title="Siguiente (→)"
            type="button"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
          <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                className={`shrink-0 overflow-hidden rounded-lg transition ${
                  index === currentIndex
                    ? 'ring-4 ring-indigo-500 ring-offset-2 ring-offset-slate-950'
                    : 'opacity-60 hover:opacity-100'
                }`}
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                }}
                type="button"
              >
                <img
                  alt={`Miniatura ${index + 1}`}
                  className="size-16 object-cover"
                  src={image}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
