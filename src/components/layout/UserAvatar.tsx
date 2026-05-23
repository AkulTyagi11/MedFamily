import { UserRound } from 'lucide-react';
import { cn } from '@/utils/cn';

interface UserAvatarProps {
  name?: string | null;
  label?: string;
  className?: string;
}

function initialsFor(name?: string | null) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function UserAvatar({ name, label, className }: UserAvatarProps) {
  const initials = initialsFor(name);

  return (
    <div
      className={cn(
        'theme-brand-solid flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm',
        className
      )}
      aria-label={label ?? name ?? 'Current user'}
      title={name ?? 'Current user'}
    >
      {initials ? initials : <UserRound className="h-5 w-5" aria-hidden="true" />}
    </div>
  );
}
