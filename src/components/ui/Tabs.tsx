import { cn } from '@/utils/cn';

interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

export default function Tabs<T extends string>({
  options,
  value,
  onChange,
  label = 'Tabs',
  className,
}: TabsProps<T>) {
  return (
    <div className={cn('theme-surface-soft flex gap-1 overflow-x-auto rounded-2xl p-1', className)} role="tablist" aria-label={label}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-soft',
              active ? 'theme-active-surface text-primary-700' : 'text-text-secondary hover:text-text-primary'
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {typeof option.count === 'number' ? (
              <span className="rounded-full bg-background-strong px-2 py-0.5 font-mono text-[11px]">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
