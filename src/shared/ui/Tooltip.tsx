import { ReactNode, useId, useState } from 'react';
import { cn } from './cn';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: ReactNode;
  className?: string;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, position = 'top', children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const id = useId();

  return (
    <span
      aria-describedby={isVisible ? id : undefined}
      className={cn('relative inline-flex', className)}
      onBlur={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-inverse px-2.5 py-1.5 text-xs font-medium text-white shadow-lg',
            positionStyles[position],
          )}
          id={id}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}
