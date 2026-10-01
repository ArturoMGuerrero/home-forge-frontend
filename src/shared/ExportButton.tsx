import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui';

type Props = {
  onExport: () => void | Promise<void>;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export function ExportButton({ onExport, variant = 'primary', className }: Props) {
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

  return (
    <Button
      className={className}
      icon={
        <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      loading={exporting}
      onClick={handleClick}
      variant={variant === 'primary' ? 'primary' : 'tertiary'}
    >
      {exporting ? t('export.exporting') : t('export.button')}
    </Button>
  );
}
