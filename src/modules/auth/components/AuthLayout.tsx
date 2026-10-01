import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../shared/ui';

interface AuthLayoutProps {
  /** Texto pequeño sobre el titular del panel de marca. */
  eyebrow: string;
  headline: string;
  description?: string;
  highlights?: string[];
  footnote?: string;
  /** Ancho del formulario: 'md' para login, 'xl' para registro. */
  width?: 'md' | 'xl';
  children: ReactNode;
}

/**
 * Plantilla de las pantallas de acceso: panel de marca (siempre oscuro) a la izquierda
 * y el formulario sobre el fondo del tema a la derecha.
 */
export function AuthLayout({ eyebrow, headline, description, highlights, footnote, width = 'md', children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-app lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(79_70_229/0.55),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(6_182_212/0.25),transparent_50%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <Link className="relative w-fit" to="/">
          <img alt="HomeForge" className="w-48 rounded-2xl object-contain" src="/homeforge-logo.png" />
        </Link>

        <div className="relative max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">{headline}</h1>
          {description && <p className="mt-5 text-lg text-slate-300">{description}</p>}
          {highlights && (
            <ul className="mt-8 grid gap-3.5 text-sm text-slate-200">
              {highlights.map(item => (
                <li className="flex items-center gap-3" key={item}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <svg aria-hidden="true" className="size-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="relative text-xs text-slate-500">{footnote ?? `© ${new Date().getFullYear()} HomeForge`}</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0 lg:py-14">
        <div className={cn('w-full', width === 'md' ? 'max-w-md' : 'max-w-2xl')}>
          <Link className="mb-8 flex w-fit items-center gap-3 lg:hidden" to="/">
            <img alt="" className="size-10 rounded-xl object-cover" src="/favicon.png" />
            <strong className="text-lg font-semibold text-fg">HomeForge</strong>
          </Link>
          {children}
        </div>
      </section>
    </div>
  );
}

interface AuthHeadingProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
}

export function AuthHeading({ eyebrow, title, description }: AuthHeadingProps) {
  return (
    <div>
      {eyebrow && <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-fg">{eyebrow}</p>}
      <h2 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 text-sm text-fg-subtle">{description}</p>}
    </div>
  );
}
