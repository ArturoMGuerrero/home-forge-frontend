import { InputHTMLAttributes } from 'react';
import { cn } from './cn';
import { fieldClass } from './fieldStyles';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  containerClassName?: string;
}

export function SearchInput({ onClear, value, className, containerClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative w-full', containerClassName)}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-fg-subtle"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <input
        type="search"
        value={value}
        className={fieldClass(false, cn('pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden', className))}
        {...props}
      />

      {value && onClear && (
        <button
          aria-label="Limpiar búsqueda"
          type="button"
          onClick={onClear}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
