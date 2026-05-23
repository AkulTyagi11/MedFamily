import { cn } from '@/utils/cn';

interface ChatBubbleProps {
  sender?: string | null;
  message: string;
  timestamp?: string | Date;
  mine?: boolean;
}

export default function ChatBubble({ sender, message, timestamp, mine = false }: ChatBubbleProps) {
  const time =
    timestamp instanceof Date
      ? timestamp
      : timestamp
        ? new Date(timestamp)
        : null;

  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm', mine ? 'theme-brand-solid' : 'theme-surface-soft text-text-primary')}>
        {sender ? <p className={cn('text-[11px] font-semibold', mine ? 'opacity-80' : 'text-text-secondary')}>{sender}</p> : null}
        <p className="mt-1 whitespace-pre-wrap">{message}</p>
        {time ? (
          <p className={cn('mt-1 font-mono text-[11px]', mine ? 'opacity-70' : 'text-text-tertiary')}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
