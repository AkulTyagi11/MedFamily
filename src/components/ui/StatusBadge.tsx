import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type StatusBadgeTone = 'default' | 'active' | 'success' | 'warning' | 'danger';
type StatusBadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  children: ReactNode;
  tone?: StatusBadgeTone;
  size?: StatusBadgeSize;
  className?: string;
}

const toneClasses: Record<StatusBadgeTone, string> = {
  default: 'theme-chip',
  active: 'theme-active-surface',
  success: 'theme-status-success',
  warning: 'theme-status-warning',
  danger: 'theme-status-danger',
};

const sizeClasses: Record<StatusBadgeSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function StatusBadge({
  children,
  tone = 'default',
  size = 'sm',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-semibold',
        toneClasses[tone],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
