interface FieldMessageProps {
  id: string;
  error?: string;
  helperText?: string;
}

export function FieldMessage({ id, error, helperText }: FieldMessageProps) {
  if (error) {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger-fg" id={id} role="alert">
        <svg aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    );
  }

  if (helperText) {
    return <p className="mt-1.5 text-xs text-fg-subtle" id={id}>{helperText}</p>;
  }

  return null;
}

export function RequiredMark() {
  return <span aria-hidden="true" className="ml-0.5 text-danger">*</span>;
}
