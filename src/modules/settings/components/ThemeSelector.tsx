import { ThemeMode, useTheme } from '../../../shared/contexts/ThemeContext';
import { Icon } from '../../../shared/Icon';
import { cn } from '../../../shared/ui';

// Las vistas previas usan colores fijos a propósito: muestran cómo luce cada tema sin importar el activo.
const themes: Array<{
  id: ThemeMode;
  name: string;
  description: string;
  preview: { app: string; surface: string; line: string; accent: string };
}> = [
  { id: 'light', name: 'Claro', description: 'Luminoso y limpio', preview: { app: 'bg-slate-100', surface: 'bg-white', line: 'bg-slate-200', accent: 'bg-indigo-600' } },
  { id: 'dark', name: 'Oscuro', description: 'Azul pizarra suave', preview: { app: 'bg-[#0b1220]', surface: 'bg-[#131c2e]', line: 'bg-[#2a3850]', accent: 'bg-indigo-500' } },
  { id: 'obsidian', name: 'Obsidian', description: 'Negro profundo', preview: { app: 'bg-[#09090b]', surface: 'bg-[#121216]', line: 'bg-[#2c2c35]', accent: 'bg-violet-500' } },
];

export function ThemeSelector() {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div>
      <h3 className="text-base font-semibold text-fg">Apariencia</h3>
      <p className="mb-5 mt-1 text-sm text-fg-subtle">Elige el contraste que prefieras. Se guarda en este dispositivo y se aplica de inmediato.</p>

      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Tema de la interfaz">
        {themes.map(theme => {
          const selected = currentTheme === theme.id;
          return (
            <button
              aria-checked={selected}
              className={cn(
                'group rounded-xl border bg-surface p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-border-strong',
              )}
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              role="radio"
              type="button"
            >
              <div className={cn('flex h-20 gap-1.5 rounded-lg p-2', theme.preview.app)} aria-hidden="true">
                <div className={cn('w-1/4 rounded-md', theme.id === 'light' ? 'bg-slate-900' : theme.preview.surface)} />
                <div className={cn('flex flex-1 flex-col gap-1.5 rounded-md p-2', theme.preview.surface)}>
                  <div className={cn('h-1.5 w-2/3 rounded-full', theme.preview.line)} />
                  <div className={cn('h-1.5 w-1/2 rounded-full', theme.preview.line)} />
                  <div className={cn('mt-auto h-3 w-10 rounded', theme.preview.accent)} />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-3">
                <div>
                  <p className="text-sm font-semibold text-fg">{theme.name}</p>
                  <p className="text-xs text-fg-subtle">{theme.description}</p>
                </div>
                <span className={cn('grid size-5 place-items-center rounded-full border transition', selected ? 'border-primary bg-primary text-white' : 'border-border-strong')}>
                  {selected && <Icon className="size-3" name="check" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
