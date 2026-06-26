import { ReactNode } from 'react';

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
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default', size = 'md' }: TabsProps) {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3'
  };

  const variantClasses = {
    default: {
      container: 'border-b border-slate-200 overflow-x-auto',
      wrapper: 'flex gap-1',
      tab: 'border-b-2 border-transparent hover:border-slate-300',
      active: 'border-indigo-600 text-indigo-600 font-semibold',
      inactive: 'text-slate-600 hover:text-slate-900'
    },
    pills: {
      container: 'bg-slate-100 rounded-xl p-1 overflow-x-auto',
      wrapper: 'flex gap-1',
      tab: 'rounded-lg transition-all',
      active: 'bg-white shadow-sm text-slate-900 font-semibold',
      inactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    },
    underline: {
      container: 'border-b border-slate-200 overflow-x-auto',
      wrapper: 'flex gap-6',
      tab: 'border-b-2 border-transparent pb-3 transition-colors',
      active: 'border-indigo-600 text-indigo-600 font-semibold',
      inactive: 'text-slate-500 hover:text-slate-700 hover:border-slate-300'
    },
    cards: {
      container: 'overflow-x-auto pb-1',
      wrapper: 'flex gap-2',
      tab: 'rounded-xl border-2 transition-all shadow-sm',
      active: 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold shadow-md',
      inactive: 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
    }
  };

  const classes = variantClasses[variant];

  return (
    <div className={classes.container}>
      <div className={classes.wrapper}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`${sizeClasses[size]} ${classes.tab} ${
              activeTab === tab.id ? classes.active : classes.inactive
            } flex items-center gap-2 transition-all whitespace-nowrap shrink-0`}
            type="button"
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`${
                  activeTab === tab.id
                    ? variant === 'cards'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-600'
                } rounded-full px-2 py-0.5 text-xs font-semibold min-w-[1.5rem] text-center`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
