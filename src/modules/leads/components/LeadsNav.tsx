import { NavLink } from 'react-router-dom';
import { cn } from '../../../shared/ui';

const links = [
  { to: '/app/prospectos', label: 'Lista', end: true },
  { to: '/app/prospectos/pipeline', label: 'Pipeline' },
  { to: '/app/prospectos/tareas', label: 'Tareas de seguimiento' },
  { to: '/app/asignaciones', label: 'Asignaciones' }
];

/** Pestañas compartidas por las vistas del módulo de prospectos. */
export function LeadsNav() {
  return (
    <nav aria-label="Vistas de prospectos" className="overflow-x-auto border-b border-border">
      <div className="flex gap-1">
        {links.map(link => (
          <NavLink
            className={({ isActive }) => cn(
              '-mb-px mx-2 shrink-0 whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors first:ml-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive ? 'border-primary text-primary-fg' : 'border-transparent text-fg-subtle hover:border-border-strong hover:text-fg'
            )}
            end={link.end}
            key={link.to}
            to={link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
