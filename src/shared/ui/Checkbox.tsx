import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import { cn } from './cn';
import { FieldMessage, RequiredMark } from './FieldMessage';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  error?: string;
}

export const choiceControlClass =
  'mt-0.5 size-4.5 shrink-0 cursor-pointer rounded border-border-strong transition ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = props.id ?? generatedId;
    const messageId = `${checkboxId}-message`;

    return (
      <div className="flex items-start gap-3">
        <input
          aria-describedby={description || error ? messageId : undefined}
          aria-invalid={error ? true : undefined}
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={cn(choiceControlClass, className)}
          {...props}
        />

        {(label || description || error) && (
          <div className={cn('min-w-0 flex-1', props.disabled && 'opacity-50')}>
            {label && (
              <label className="block cursor-pointer text-sm font-medium text-fg" htmlFor={checkboxId}>
                {label}
                {props.required && <RequiredMark />}
              </label>
            )}
            {description && !error && (
              <p className="mt-0.5 text-xs text-fg-subtle" id={messageId}>{description}</p>
            )}
            {error && <FieldMessage error={error} id={messageId} />}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface ChoiceGroupProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function ChoiceGroup({ label, error, required, children, className }: ChoiceGroupProps) {
  const id = useId();
  return (
    <fieldset aria-describedby={error ? `${id}-message` : undefined} className={className}>
      {label && (
        <legend className="mb-3 text-sm font-semibold text-fg-muted">
          {label}
          {required && <RequiredMark />}
        </legend>
      )}
      <div className="space-y-3">{children}</div>
      <FieldMessage error={error} id={`${id}-message`} />
    </fieldset>
  );
}

/** Agrupa checkboxes relacionados bajo una etiqueta común. */
export const CheckboxGroup = ChoiceGroup;
