import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { FieldMessage } from './FieldMessage';
import { fieldControlClass, fieldLabelClass, fieldStateClass } from './fieldStyles';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = props.id ?? generatedId;
    const messageId = `${selectId}-message`;

    return (
      <div className="w-full">
        {label && (
          <label className={fieldLabelClass} htmlFor={selectId}>
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <select
          aria-describedby={error || helperText ? messageId : undefined}
          aria-invalid={Boolean(error)}
          id={selectId}
          ref={ref}
          className={`
            ${fieldControlClass}
            cursor-pointer
            ${fieldStateClass(Boolean(error))}
            ${className}
          `}
          {...props}
        >
          {options
            ? options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children
          }
        </select>

        <FieldMessage error={error} helperText={helperText} id={messageId} />
      </div>
    );
  }
);

Select.displayName = 'Select';
