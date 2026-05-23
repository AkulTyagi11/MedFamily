import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TimelineItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  time?: ReactNode;
  meta?: ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'neutral';
}

interface TimelineProps {
  items: TimelineItem[];
  empty?: ReactNode;
  className?: string;
}

const dotClasses = {
  success: 'bg-secondary-500 ring-secondary-100',
  warning: 'bg-warning-500 ring-warning-100',
  danger: 'bg-danger-500 ring-danger-100',
  neutral: 'bg-border-strong ring-background-strong',
};

export default function Timeline({ items, empty, className }: TimelineProps) {
  if (!items.length) {
    return <>{empty ?? null}</>;
  }

  return (
    <div className={cn('relative space-y-4 pl-6', className)}>
      <div className="absolute bottom-5 left-2 top-5 w-px bg-border" aria-hidden="true" />
      {items.map((item) => (
        <div key={item.id} className="relative">
          <span
            className={cn(
              'absolute -left-[21px] top-5 h-3 w-3 rounded-full ring-4',
              dotClasses[item.tone ?? 'success']
            )}
            aria-hidden="true"
          />
          <div className="panel rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-text-primary">{item.title}</p>
                {item.description ? <div className="mt-1 text-sm text-text-secondary">{item.description}</div> : null}
              </div>
              {item.time ? <div className="font-mono text-xs text-text-tertiary">{item.time}</div> : null}
            </div>
            {item.meta ? <div className="mt-3">{item.meta}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
