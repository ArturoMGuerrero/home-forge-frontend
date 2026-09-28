import { ThemeMode, useTheme } from '../../../shared/contexts/ThemeContext';
import { Icon } from '../../../shared/Icon';

const themes: Array<{
  id: ThemeMode;
  name: string;
  description: string;
  icon: 'sun' | 'moon';
}> = [
  {
    id: 'light',
    name: 'Claro',
    description: 'Luminoso y limpio',
    icon: 'sun'
  },
  {
    id: 'dark',
    name: 'Oscuro',
    description: 'Azul pizarra suave',
    icon: 'moon'
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Negro profundo',
    icon: 'moon'
  }
];

export function ThemeSelector() {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div>
      <h3 className="mb-1 text-base font-bold text-slate-900">Apariencia</h3>
      <p className="mb-5 text-sm text-slate-500">Elige el contraste que prefieras para trabajar.</p>

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

            <div className={`mb-4 inline-grid size-12 place-items-center rounded-full ${
              theme.id === 'light' ? 'bg-amber-100' : theme.id === 'dark' ? 'bg-indigo-100' : 'bg-slate-900'
            }`}>
              <Icon
                className={`size-6 ${theme.id === 'light' ? 'text-amber-600' : theme.id === 'dark' ? 'text-indigo-600' : 'text-violet-300'}`}
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
          Tu preferencia se guarda en este dispositivo y se aplica inmediatamente en toda la plataforma.
        </p>
      </div>
    </div>
  );
}
