import { HeartPulse, LogOut } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import RoleBadge from '@/components/app/RoleBadge';
import UserAvatar from '@/components/layout/UserAvatar';
import { NAV_BY_ROLE } from '@/components/layout/navConfig';
import { MESSAGES, ROUTES } from '@/lib/constants';
import { cn } from '@/utils/cn';
import { showSuccessToast } from '@/utils/errorHandler';

export default function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const navItems = role ? NAV_BY_ROLE[role] : [];
  const isActivePath = (path: string) =>
    location.pathname === path || (path !== ROUTES.DASHBOARD && location.pathname.startsWith(path));

  const handleLogout = async () => {
    await signOut();
    showSuccessToast(MESSAGES.LOGGED_OUT);
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-border/70 bg-background px-5 py-6 lg:flex lg:flex-col">
      <button
        type="button"
        className="mb-8 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-soft"
        onClick={() => navigate(ROUTES.DASHBOARD)}
        aria-label="Open MedFamily dashboard"
      >
        <span className="theme-brand-solid flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm">
          <HeartPulse className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-serif text-3xl font-extrabold leading-none text-text-primary">MedFamily</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
            Care workspace
          </span>
        </span>
      </button>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Primary navigation">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActivePath(path);

          return (
            <motion.button
              key={path}
              type="button"
              className={cn(
                'group relative flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold transition focus-visible:outline-none focus-visible:ring-soft',
                active ? 'text-primary-700' : 'text-text-secondary hover:text-text-primary'
              )}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(path)}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-nav-active"
                  className="theme-active-surface absolute inset-0 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                />
              ) : (
                <span className="absolute inset-0 rounded-2xl opacity-0 transition group-hover:bg-[var(--surface-soft)] group-hover:opacity-100" />
              )}
              <Icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10">{label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="panel mt-5 rounded-2xl p-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={profile?.full_name} className="h-10 w-10 rounded-xl text-xs" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text-primary">{profile?.full_name ?? 'MedFamily user'}</p>
            {role ? <RoleBadge role={role} /> : null}
          </div>
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-[var(--surface-soft)] hover:text-danger-600 focus-visible:outline-none focus-visible:ring-soft"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
