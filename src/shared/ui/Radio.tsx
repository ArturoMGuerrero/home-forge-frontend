import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react';
import { choiceControlClass, ChoiceGroup } from './Checkbox';
import { cn } from './cn';
import { RequiredMark } from './FieldMessage';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, error, className, ...props }, ref) => {
    const generatedId = useId();
    const radioId = props.id ?? generatedId;
    const messageId = `${radioId}-message`;

    return (
      <div className="flex items-start gap-3">
        <input
          aria-describedby={description ? messageId : undefined}
          aria-invalid={error ? true : undefined}
          id={radioId}
          ref={ref}
          type="radio"
          className={cn(choiceControlClass, 'rounded-full', className)}
          {...props}
        />

        {(label || description) && (
          <div className={cn('min-w-0 flex-1', props.disabled && 'opacity-50')}>
            {label && (
              <label className={cn('block cursor-pointer text-sm font-medium', error ? 'text-danger-fg' : 'text-fg')} htmlFor={radioId}>
                {label}
                {props.required && <RequiredMark />}
              </label>
            )}
            {description && <p className="mt-0.5 text-xs text-fg-subtle" id={messageId}>{description}</p>}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/** Agrupa radios de una misma pregunta bajo una etiqueta común. */
export const RadioGroup = ChoiceGroup;
