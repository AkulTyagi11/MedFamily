import { LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/layout/NotificationBell';
import ThemeToggle from '@/components/layout/ThemeToggle';
import UserAvatar from '@/components/layout/UserAvatar';
import { MESSAGES, ROUTES } from '@/lib/constants';
import { showSuccessToast } from '@/utils/errorHandler';

interface TopBarProps {
  pageTitle?: string;
}

export default function TopBar({ pageTitle }: TopBarProps) {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    showSuccessToast(MESSAGES.LOGGED_OUT);
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="top-safe sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <div className="lg:hidden">
          <p className="font-serif text-xl font-extrabold leading-none text-text-primary">MedFamily</p>
          <p className="text-xs text-text-tertiary">{pageTitle ?? 'Care workspace'}</p>
        </div>

        <label className="relative ml-auto hidden w-full max-w-xl md:block lg:ml-0">
          <span className="sr-only">Search care workspace</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="search"
            className="field-surface h-12 w-full rounded-full border-border bg-[var(--surface-soft)] pl-12 pr-4 text-sm focus:outline-none"
            placeholder="Search records, reminders, orders..."
          />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
          <div className="hidden items-center gap-3 border-l border-border/70 pl-4 sm:flex">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-bold text-text-primary">{profile?.full_name ?? 'MedFamily user'}</p>
              <p className="text-xs capitalize text-text-tertiary">{role?.replace('_', ' ') ?? 'workspace'}</p>
            </div>
            <UserAvatar name={profile?.full_name} />
          </div>
          <button
            type="button"
            className="theme-chip hidden h-11 w-11 items-center justify-center rounded-2xl text-text-secondary transition hover:text-danger-600 focus-visible:outline-none focus-visible:ring-soft md:flex lg:hidden xl:flex"
            onClick={handleLogout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
