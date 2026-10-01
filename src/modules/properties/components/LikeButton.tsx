import { MouseEvent } from 'react';
import { cn } from '../../../shared/ui';

interface LikeButtonProps {
  liked: boolean;
  onToggle: () => void;
  propertyTitle: string;
  className?: string;
}

/** Corazón para marcar una propiedad que le gustó al visitante. */
export function LikeButton({ liked, onToggle, propertyTitle, className }: LikeButtonProps) {
  function handleClick(event: MouseEvent) {
    // La tarjeta completa es un enlace: el corazón no debe navegar.
    event.preventDefault();
    event.stopPropagation();
    onToggle();
  }

  return (
    <button
      aria-label={liked ? `Quitar ${propertyTitle} de me gusta` : `Me gusta ${propertyTitle}`}
      aria-pressed={liked}
      className={cn(
        'grid size-9 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-110',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        liked ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600',
        className,
      )}
      onClick={handleClick}
      title={liked ? 'Te gusta' : 'Me gusta'}
      type="button"
    >
      <svg aria-hidden="true" className="size-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
      </svg>
    </button>
  );
}
