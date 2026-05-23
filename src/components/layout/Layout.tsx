import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="page-backdrop min-h-[100dvh]">
      <a
        href="#main-content"
        className="skip-link focus-visible:outline-none focus-visible:ring-soft"
      >
        Skip to main content
      </a>
      <Header pageTitle={pageTitle} />
      <motion.main
        id="main-content"
        className="page-shell-content relative z-10 mx-auto w-full max-w-[1380px] px-4 pt-5 sm:px-6 lg:pt-8 xl:px-8 2xl:px-10"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.22 }}
      >
        {children}
      </motion.main>
      <MobileNav />
    </div>
  );
}
