import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import SidebarNav from '@/components/layout/SidebarNav';
import TopBar from '@/components/layout/TopBar';

interface AppShellProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="page-backdrop min-h-[100dvh] bg-background text-text-primary">
      <a href="#main-content" className="skip-link focus-visible:outline-none focus-visible:ring-soft">
        Skip to main content
      </a>
      <SidebarNav />
      <div className="relative z-10 min-h-[100dvh] lg:pl-[280px]">
        <TopBar pageTitle={pageTitle} />
        <motion.main
          id="main-content"
          className="page-shell-content mx-auto w-full max-w-[1440px] px-4 pt-5 sm:px-6 lg:px-10 lg:pt-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.22 }}
        >
          {children}
        </motion.main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
