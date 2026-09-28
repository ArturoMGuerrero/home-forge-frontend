import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { FieldMessage } from './FieldMessage';
import { fieldControlClass, fieldLabelClass, fieldStateClass } from './fieldStyles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const messageId = `${inputId}-message`;

    return (
      <div className="w-full">
        {label && (
          <label className={fieldLabelClass} htmlFor={inputId}>
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}

          <input
            aria-describedby={error || helperText ? messageId : undefined}
            aria-invalid={Boolean(error)}
            id={inputId}
            ref={ref}
            className={`
              ${fieldControlClass}
              ${icon ? 'pl-11' : ''}
              ${fieldStateClass(Boolean(error))}
              ${className}
            `}
            {...props}
          />
        </div>

        <FieldMessage error={error} helperText={helperText} id={messageId} />
      </div>
    );
  }
);

Input.displayName = 'Input';
