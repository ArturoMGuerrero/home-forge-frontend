import { ReactNode, useId } from 'react';
import { cn } from './cn';
import { fieldLabelClass } from './fieldStyles';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  size?: 'sm' | 'md';
  /** Ocupa todo el ancho y reparte las opciones en partes iguales. */
  fullWidth?: boolean;
  className?: string;
}

/** Grupo de opciones excluyentes (radio) con aspecto de botones segmentados. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, size = 'md', fullWidth = false, className }: SegmentedControlProps<T>) {
  const labelId = useId();

  return (
    <div className={className}>
      {label && <p className={fieldLabelClass} id={labelId}>{label}</p>}
      <div
        aria-labelledby={label ? labelId : undefined}
        className={cn('inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-surface-sunken p-1', fullWidth && 'flex w-full')}
        role="radiogroup"
      >
        {options.map(option => {
          const selected = option.value === value;
          return (
            <button
              aria-checked={selected}
              className={cn(
                'rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
                fullWidth && 'flex-1',
                selected ? 'bg-surface text-fg shadow-sm' : 'text-fg-subtle hover:text-fg'
              )}
              key={option.value}
              onClick={() => onChange(option.value)}
              role="radio"
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
