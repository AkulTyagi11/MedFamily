import type { ReactNode } from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}

const toneClasses = {
  brand: 'theme-icon-badge text-primary-700',
  success: 'theme-status-success',
  warning: 'theme-status-warning',
  danger: 'theme-status-danger',
};

export default function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'brand',
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('rounded-2xl', className)} hoverable>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-text-tertiary">{label}</p>
          <p className="mt-3 font-serif text-4xl font-extrabold leading-none text-text-primary">{value}</p>
          {helper ? <p className="mt-2 text-sm text-text-secondary">{helper}</p> : null}
        </div>
        {icon ? <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', toneClasses[tone])}>{icon}</div> : null}
      </div>
    </Card>
  );
}
