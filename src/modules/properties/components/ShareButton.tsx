import toast from 'react-hot-toast';
import { cn } from '../../../shared/ui';

/** navigator.clipboard solo existe en https/localhost; si falla se usa el método clásico. */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

interface ShareButtonProps {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

/**
 * Comparte la propiedad. En el celular abre el menú del sistema (WhatsApp, Messenger...); en la
 * computadora copia el enlace. Al pegarlo en WhatsApp aparece la vista previa con foto y precio.
 */
export function ShareButton({ propertyId, propertyTitle, className }: ShareButtonProps) {
  async function share() {
    const url = `${window.location.origin}/propiedades/${propertyId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: propertyTitle, url });
        return;
      } catch (error) {
        // El usuario cerró el menú: no hacer nada más.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    if (await copyToClipboard(url)) {
      toast.success('Enlace copiado. Pégalo en WhatsApp o donde quieras compartirlo.');
    } else {
      // Sin permiso de portapapeles: que lo copie a mano.
      window.prompt('Copia este enlace para compartir la propiedad:', url);
    }
  }

  return (
    <button
      aria-label={`Compartir ${propertyTitle}`}
      className={cn(
        'grid size-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:scale-110 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
      onClick={share}
      title="Compartir"
      type="button"
    >
      <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      </svg>
    </button>
  );
}
