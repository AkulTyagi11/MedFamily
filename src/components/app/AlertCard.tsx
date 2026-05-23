import type { ReactNode } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AlertCardProps {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'warning' | 'danger' | 'success';
  className?: string;
}

const toneClasses = {
  info: 'theme-surface-accent text-primary-700',
  warning: 'theme-status-warning',
  danger: 'theme-status-danger',
  success: 'theme-status-success',
};

export default function AlertCard({ title, children, tone = 'info', className }: AlertCardProps) {
  const Icon = tone === 'info' || tone === 'success' ? Info : AlertCircle;

  return (
    <div className={cn('rounded-2xl border p-4', toneClasses[tone], className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{title}</p>
          <div className="mt-1 text-sm opacity-90">{children}</div>
        </div>
      </div>
    </div>
  );
}
