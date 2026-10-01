import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from './cn';
import { FieldMessage, RequiredMark } from './FieldMessage';
import { fieldClass, fieldLabelClass } from './fieldStyles';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, resize = true, className, containerClassName, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = props.id ?? generatedId;
    const messageId = `${textareaId}-message`;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className={fieldLabelClass} htmlFor={textareaId}>
            {label}
            {props.required && <RequiredMark />}
          </label>
        )}

        <textarea
          aria-describedby={error || helperText ? messageId : undefined}
          aria-invalid={error ? true : undefined}
          id={textareaId}
          ref={ref}
          className={fieldClass(Boolean(error), cn(resize ? 'resize-y' : 'resize-none', className))}
          {...props}
        />

        <FieldMessage error={error} helperText={helperText} id={messageId} />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
