import { ReactNode, useId } from 'react';
import { cn } from './cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** Interruptor on/off accesible (role="switch"). */
export function Switch({ checked, onChange, label, description, disabled = false, id, className }: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <div className={cn('flex items-start justify-between gap-4', disabled && 'opacity-50', className)}>
      {(label || description) && (
        <div className="min-w-0">
          {label && <label className="block cursor-pointer text-sm font-medium text-fg" htmlFor={switchId}>{label}</label>}
          {description && <p className="mt-0.5 text-xs text-fg-subtle">{description}</p>}
        </div>
      )}
      <button
        aria-checked={checked}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'disabled:cursor-not-allowed',
          checked ? 'bg-primary' : 'bg-surface-strong',
        )}
        disabled={disabled}
        id={switchId}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
