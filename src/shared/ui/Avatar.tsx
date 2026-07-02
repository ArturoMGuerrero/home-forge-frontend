import { ImgHTMLAttributes } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'size'> {
  src?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'away';
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'size-6', text: 'text-xs', status: 'size-2' },
  sm: { container: 'size-8', text: 'text-sm', status: 'size-2.5' },
  md: { container: 'size-10', text: 'text-base', status: 'size-3' },
  lg: { container: 'size-12', text: 'text-lg', status: 'size-3.5' },
  xl: { container: 'size-16', text: 'text-2xl', status: 'size-4' },
  '2xl': { container: 'size-24', text: 'text-4xl', status: 'size-5' },
};

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  away: 'bg-amber-500',
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({ src, name = 'User', size = 'md', status, className = '', ...props }: AvatarProps) {
  const sizes = sizeClasses[size];
  const bgColor = getColorFromName(name);

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizes.container}
          flex items-center justify-center rounded-full
          overflow-hidden border-2 border-white shadow-sm
          ${!src ? `${bgColor} text-white font-semibold ${sizes.text}` : ''}
        `}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="size-full object-cover"
            {...props}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <div
          className={`
            absolute bottom-0 right-0 rounded-full border-2 border-white
            ${sizes.status} ${statusColors[status]}
          `}
        />
      )}
    </div>
  );
}

// Avatar Group para mostrar múltiples avatares
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
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeClasses[size].container}
            flex items-center justify-center rounded-full
            bg-slate-200 text-slate-700 font-semibold ${sizeClasses[size].text}
            ring-2 ring-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
