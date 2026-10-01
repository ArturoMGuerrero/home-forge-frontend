import { ReactNode } from 'react';
import { cn } from './cn';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  badge?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-3.5 py-2',
  lg: 'text-base px-5 py-2.5',
};

// 'default' y 'underline' comparten estilo; 'cards' se conserva por compatibilidad como pills.
const variantClasses = {
  underline: {
    container: 'border-b border-border',
    wrapper: 'flex gap-1',
    tab: 'rounded-none border-b-2 px-1 mx-2 first:ml-0',
    active: 'border-primary text-primary-fg',
    inactive: 'border-transparent text-fg-subtle hover:border-border-strong hover:text-fg',
  },
  pills: {
    container: 'inline-flex max-w-full rounded-xl bg-surface-sunken p-1',
    wrapper: 'flex gap-1',
    tab: 'rounded-lg',
    active: 'bg-surface text-fg shadow-sm',
    inactive: 'text-fg-subtle hover:text-fg',
  },
};

export function Tabs({ tabs, activeTab, onChange, variant = 'default', size = 'md', className }: TabsProps) {
  const styles = variant === 'pills' || variant === 'cards' ? variantClasses.pills : variantClasses.underline;

  return (
    <div className={cn('overflow-x-auto overflow-y-hidden overscroll-x-contain', styles.container, className)}>
      <div className={styles.wrapper} role="tablist">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              aria-selected={isActive}
              className={cn(
                'flex shrink-0 items-center gap-2 whitespace-nowrap font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                sizeClasses[size],
                styles.tab,
                isActive ? styles.active : styles.inactive,
              )}
              key={tab.id}
              onClick={() => onChange(tab.id)}
              role="tab"
              type="button"
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold',
                    isActive ? 'bg-primary-soft text-primary-fg' : 'bg-surface-sunken text-fg-subtle',
                  )}
                >
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="rounded-full bg-danger px-1.5 py-0.5 text-xs font-bold text-white">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
