import type { ReactNode } from 'react';
import AppShell from '@/components/layout/AppShell';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  return <AppShell pageTitle={pageTitle}>{children}</AppShell>;
}
