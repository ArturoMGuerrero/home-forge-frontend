import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              size-5 rounded border-slate-300 text-indigo-600
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
                className={`
                  block text-sm font-semibold cursor-pointer
                  ${error ? 'text-rose-600' : 'text-slate-700'}
                  ${props.disabled ? 'opacity-50' : ''}
                `}
                onClick={(e) => {
                  if (!props.disabled) {
                    const input = (e.currentTarget.previousElementSibling?.firstChild as HTMLInputElement);
                    input?.click();
                  }
                }}
              >
                {label}
                {props.required && <span className="text-rose-500 ml-1">*</span>}
              </label>
            )}
            {description && (
              <p className={`mt-0.5 text-xs ${error ? 'text-rose-600' : 'text-slate-500'}`}>
                {description}
              </p>
            )}
            {error && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Checkbox Group para múltiples checkboxes relacionados
interface CheckboxGroupProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckboxGroup({ label, error, children, className = '' }: CheckboxGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          {label}
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
