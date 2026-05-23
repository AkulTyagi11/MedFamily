import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'bottom';
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
}: DrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  const isBottom = side === 'bottom';

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            className="absolute inset-0 bg-[var(--overlay-backdrop)] backdrop-blur-[2px]"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
            aria-label="Close drawer"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className={cn(
              'panel absolute flex max-h-[100dvh] flex-col overflow-hidden',
              isBottom
                ? 'inset-x-0 bottom-0 rounded-t-[30px]'
                : 'bottom-0 right-0 top-0 w-full max-w-md rounded-l-[30px]'
            )}
            initial={prefersReducedMotion ? false : isBottom ? { y: '100%' } : { x: '100%' }}
            animate={prefersReducedMotion ? undefined : { x: 0, y: 0 }}
            exit={prefersReducedMotion ? undefined : isBottom ? { y: '100%' } : { x: '100%' }}
            transition={prefersReducedMotion ? undefined : { type: 'spring', stiffness: 360, damping: 34 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/80 p-5">
              <div>
                <h2 id="drawer-title" className="text-xl font-bold text-text-primary">
                  {title}
                </h2>
                {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
              </div>
              <button
                type="button"
                className="theme-chip flex h-10 w-10 items-center justify-center rounded-2xl text-text-secondary focus-visible:outline-none focus-visible:ring-soft"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer ? <div className="border-t border-border/80 p-5">{footer}</div> : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
