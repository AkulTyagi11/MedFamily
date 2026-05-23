import { cn } from '@/utils/cn';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export default function LoadingSkeleton({ className, lines = 1 }: LoadingSkeletonProps) {
  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 rounded-full bg-[linear-gradient(90deg,var(--surface-soft),var(--surface-accent),var(--surface-soft))] bg-[length:200%_100%] motion-safe:animate-pulse"
            style={{ width: `${100 - index * 12}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-24 rounded-3xl bg-[linear-gradient(90deg,var(--surface-soft),var(--surface-accent),var(--surface-soft))] bg-[length:200%_100%] motion-safe:animate-pulse',
        className
      )}
      aria-hidden="true"
    />
  );
}
