import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    const generatedId = useId();
    const radioId = props.id ?? generatedId;
    const messageId = `${radioId}-message`;

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            aria-describedby={description ? messageId : undefined}
            aria-invalid={Boolean(error)}
            id={radioId}
            ref={ref}
            type="radio"
            className={`
              size-5 border-slate-300 text-indigo-600
              focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              transition cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-rose-300' : ''}
              ${className}
            `}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={radioId}
                className={`
                  block text-sm font-semibold cursor-pointer
                  ${error ? 'text-rose-600' : 'text-slate-700'}
                  ${props.disabled ? 'opacity-50' : ''}
                `}
              >
                {label}
                {props.required && <span className="text-rose-500 ml-1">*</span>}
              </label>
            )}
            {description && (
              <p className={`mt-0.5 text-xs ${error ? 'text-rose-600' : 'text-slate-500'}`} id={messageId}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// Radio Group para múltiples opciones
interface RadioGroupProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ label, error, required, children, className = '' }: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-3">
        {children}
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
