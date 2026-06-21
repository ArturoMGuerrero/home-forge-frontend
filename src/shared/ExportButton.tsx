import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  onExport: () => void | Promise<void>;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export function ExportButton({ onExport, variant = 'primary', className = '' }: Props) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  async function handleClick() {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  }

  const baseClasses = 'inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
  const variantClasses = variant === 'primary'
    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={exporting}
      onClick={handleClick}
      type="button"
    >
      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {exporting ? t('export.exporting') : t('export.button')}
    </button>
  );
}
