import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from './cn';
import { FieldMessage, RequiredMark } from './FieldMessage';
import { fieldClass, fieldLabelClass } from './fieldStyles';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  /** Opción vacía inicial, p. ej. "Selecciona una opción". */
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className, containerClassName, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = props.id ?? generatedId;
    const messageId = `${selectId}-message`;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className={fieldLabelClass} htmlFor={selectId}>
            {label}
            {props.required && <RequiredMark />}
          </label>
        )}

        <div className="relative">
          <select
            aria-describedby={error || helperText ? messageId : undefined}
            aria-invalid={error ? true : undefined}
            id={selectId}
            ref={ref}
            className={fieldClass(Boolean(error), cn('cursor-pointer appearance-none pr-10', className))}
            {...props}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options
              ? options.map(opt => (
                  <option disabled={opt.disabled} key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <FieldMessage error={error} helperText={helperText} id={messageId} />
      </div>
    );
  }
);

Select.displayName = 'Select';
