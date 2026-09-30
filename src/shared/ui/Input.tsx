import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import { cn } from './cn';
import { FieldMessage, RequiredMark } from './FieldMessage';
import { fieldClass, fieldLabelClass } from './fieldStyles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  /** Contenido al final del campo (unidad, botón, etc.). */
  suffix?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, suffix, className, containerClassName, ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const messageId = `${inputId}-message`;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className={fieldLabelClass} htmlFor={inputId}>
            {label}
            {props.required && <RequiredMark />}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle [&_svg]:size-4.5">
              {icon}
            </div>
          )}

          <input
            aria-describedby={error || helperText ? messageId : undefined}
            aria-invalid={error ? true : undefined}
            id={inputId}
            ref={ref}
            className={fieldClass(Boolean(error), cn(icon && 'pl-10', suffix && 'pr-12', className))}
            {...props}
          />

          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fg-subtle">
              {suffix}
            </div>
          )}
        </div>

        <FieldMessage error={error} helperText={helperText} id={messageId} />
      </div>
    );
  }
);

Input.displayName = 'Input';
