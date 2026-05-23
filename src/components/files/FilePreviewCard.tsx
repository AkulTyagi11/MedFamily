import { Download, Eye, FileText, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface FilePreviewCardProps {
  title: string;
  subtitle?: string;
  type?: string;
  onPreview?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function FilePreviewCard({
  title,
  subtitle,
  type = 'Document',
  onPreview,
  onDownload,
  onDelete,
  className,
}: FilePreviewCardProps) {
  return (
    <div className={cn('panel flex items-center gap-4 rounded-2xl p-4', className)}>
      <div className="theme-icon-badge flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text-primary">{title}</p>
        <p className="mt-1 truncate text-sm text-text-secondary">{subtitle ?? type}</p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">{type}</p>
      </div>
      <div className="flex items-center gap-1">
        {onPreview ? (
          <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} onClick={onPreview}>
            <span className="sr-only">Preview</span>
          </Button>
        ) : null}
        {onDownload ? (
          <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />} onClick={onDownload}>
            <span className="sr-only">Download</span>
          </Button>
        ) : null}
        {onDelete ? (
          <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={onDelete}>
            <span className="sr-only">Delete</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
