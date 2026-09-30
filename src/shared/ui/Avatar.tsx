import { ImgHTMLAttributes } from 'react';
import { cn } from './cn';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'size'> {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'size-6', text: 'text-[10px]', status: 'size-2' },
  sm: { container: 'size-8', text: 'text-xs', status: 'size-2.5' },
  md: { container: 'size-10', text: 'text-sm', status: 'size-3' },
  lg: { container: 'size-12', text: 'text-base', status: 'size-3.5' },
  xl: { container: 'size-16', text: 'text-xl', status: 'size-4' },
  '2xl': { container: 'size-24', text: 'text-3xl', status: 'size-5' },
};

const statusColors = {
  online: 'bg-success',
  offline: 'bg-fg-subtle',
  away: 'bg-warning',
};

const avatarColors = [
  'bg-primary-muted text-primary-fg',
  'bg-accent-muted text-accent-fg',
  'bg-info-muted text-info-fg',
  'bg-success-muted text-success-fg',
  'bg-warning-muted text-warning-fg',
  'bg-danger-muted text-danger-fg',
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.trim().substring(0, 2).toUpperCase() || '?';
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return avatarColors[hash % avatarColors.length];
}

export function Avatar({ src, name = 'Usuario', size = 'md', status, className, ...props }: AvatarProps) {
  const sizes = sizeClasses[size];

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full font-semibold',
          sizes.container,
          !src && cn(getColorFromName(name), sizes.text),
        )}
      >
        {src ? (
          <img alt={name} className="size-full object-cover" src={src} {...props} />
        ) : (
          <span aria-label={name} role="img">{getInitials(name)}</span>
        )}
      </span>

      {status && (
        <span className={cn('absolute bottom-0 right-0 rounded-full ring-2 ring-surface', sizes.status, statusColors[status])} />
      )}
    </span>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string; name: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {displayed.map((avatar, index) => (
        <Avatar className="rounded-full ring-2 ring-surface" key={index} name={avatar.name} size={size} src={avatar.src} />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            'flex items-center justify-center rounded-full bg-surface-strong font-semibold text-fg-muted ring-2 ring-surface',
            sizeClasses[size].container,
            sizeClasses[size].text,
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}
