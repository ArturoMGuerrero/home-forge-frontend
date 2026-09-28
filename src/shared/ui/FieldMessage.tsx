interface FieldMessageProps {
  id: string;
  error?: string;
  helperText?: string;
}

export function FieldMessage({ id, error, helperText }: FieldMessageProps) {
  if (error) {
    return (
      <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" id={id} role="alert">
        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    );
  }

  if (helperText) {
    return <p className="mt-1.5 text-xs text-slate-500" id={id}>{helperText}</p>;
  }

  return null;
}
