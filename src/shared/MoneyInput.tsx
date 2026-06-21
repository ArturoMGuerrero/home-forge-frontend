import { InputHTMLAttributes, useEffect, useState } from 'react';

type MoneyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> & {
  currency?: string;
  onChange: (value: string) => void;
  value: string | number | undefined;
};

export function normalizeMoneyInput(value: string): string {
  const cleaned = value.replace(/[^\d.,]/g, '');
  const decimalIndex = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  const hasDecimal = decimalIndex >= 0 && cleaned.length - decimalIndex - 1 <= 2;
  const integerPart = (hasDecimal ? cleaned.slice(0, decimalIndex) : cleaned)
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '');
  const decimals = hasDecimal ? cleaned.slice(decimalIndex + 1).replace(/\D/g, '').slice(0, 2) : '';

  if (!integerPart && !hasDecimal) return '';
  return `${integerPart || '0'}${hasDecimal ? `.${decimals}` : ''}`;
}

export function formatMoneyInput(value: string | number | undefined): string {
  if (value === undefined || value === '') return '';
  const normalized = normalizeMoneyInput(String(value));
  if (!normalized) return '';
  const [integerPart, decimals] = normalized.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
}

export function MoneyInput({ className = '', currency, onBlur, onChange, value, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatMoneyInput(value));

  useEffect(() => setDisplayValue(formatMoneyInput(value)), [value]);

  return (
    <div className="relative">
      <input
        {...props}
        className={`${className} pr-16`}
        inputMode="decimal"
        onBlur={event => {
          setDisplayValue(formatMoneyInput(value));
          onBlur?.(event);
        }}
        onChange={event => {
          const normalized = normalizeMoneyInput(event.target.value);
          setDisplayValue(formatMoneyInput(normalized));
          onChange(normalized);
        }}
        pattern="[0-9,]+(\.[0-9]{0,2})?"
        type="text"
        value={displayValue}
      />
      {currency && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-500">{currency}</span>}
    </div>
  );
}
