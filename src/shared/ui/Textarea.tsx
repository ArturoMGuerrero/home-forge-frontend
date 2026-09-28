import { TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { FieldMessage } from './FieldMessage';
import { fieldControlClass, fieldLabelClass, fieldStateClass } from './fieldStyles';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, resize = true, className = '', ...props }, ref) => {
    const generatedId = useId();
    const textareaId = props.id ?? generatedId;
    const messageId = `${textareaId}-message`;

    return (
      <div className="w-full">
        {label && (
          <label className={fieldLabelClass} htmlFor={textareaId}>
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          aria-describedby={error || helperText ? messageId : undefined}
          aria-invalid={Boolean(error)}
          id={textareaId}
          ref={ref}
          className={`
            ${fieldControlClass}
            ${!resize ? 'resize-none' : 'resize-y'}
            ${fieldStateClass(Boolean(error))}
            ${className}
          `}
          {...props}
        />

        <FieldMessage error={error} helperText={helperText} id={messageId} />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
