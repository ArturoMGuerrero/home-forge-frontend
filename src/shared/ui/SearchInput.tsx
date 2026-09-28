import { InputHTMLAttributes } from 'react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export function SearchInput({ onClear, value, className = '', ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <input
        type="search"
        value={value}
        className={`
          w-full pl-11 pr-10 py-2.5 border border-[rgb(var(--border-color))] bg-[rgb(var(--input-bg))] rounded-xl text-sm
          text-[rgb(var(--text-primary))] transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20
          placeholder:text-[rgb(var(--text-tertiary))]
          ${className}
        `}
        {...props}
      />

      {value && onClear && (
        <button
          aria-label="Limpiar búsqueda"
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
