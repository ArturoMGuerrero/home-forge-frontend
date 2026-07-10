import { ThemeMode, useTheme } from '../shared/contexts/ThemeContext';
import { Icon } from '../shared/Icon';

const themes: Array<{
  id: ThemeMode;
  name: string;
  description: string;
  icon: 'sun' | 'moon';
}> = [
  {
    id: 'light',
    name: 'Light',
    description: 'Bright & clear',
    icon: 'sun'
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on eyes',
    icon: 'moon'
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Deep black',
    icon: 'moon'
  }
];

export function ThemeSelector() {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div>
      <h3 className="text-base font-bold text-slate-900 mb-1">Theme Mode</h3>
      <p className="text-sm text-slate-500 mb-5">Customize the look and feel of your interface</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`
              relative rounded-2xl border-2 p-5 text-left transition-all
              ${currentTheme === theme.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
              }
            `}
            type="button"
          >
            {currentTheme === theme.id && (
              <div className="absolute top-4 right-4 grid size-6 place-items-center rounded-full bg-indigo-500">
                <Icon className="size-4 text-white" name="check" />
              </div>
            )}

            <div className={`
              inline-grid size-12 place-items-center rounded-full mb-4
              ${theme.id === 'light' ? 'bg-amber-100' : 'bg-indigo-100'}
            `}>
              <Icon
                className={`size-6 ${theme.id === 'light' ? 'text-amber-600' : 'text-indigo-600'}`}
                name={theme.icon}
              />
            </div>

            <h4 className={`
              text-lg font-bold mb-1
              ${currentTheme === theme.id ? 'text-indigo-700' : 'text-slate-900'}
            `}>
              {theme.name}
            </h4>
            <p className="text-sm text-slate-500">{theme.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <Icon className="size-5 text-amber-600 shrink-0 mt-0.5" name="alert" />
        <p className="text-sm text-amber-800">
          Your theme preference will be saved and applied across all pages. Changes take effect immediately.
        </p>
      </div>
    </div>
  );
}
