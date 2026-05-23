import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Grid2x2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NAV_BY_ROLE, getPrimaryNavItems, getSecondaryNavItems } from '@/components/layout/navConfig';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/utils/cn';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isActivePath = (path: string) =>
    location.pathname === path || (path !== ROUTES.DASHBOARD && location.pathname.startsWith(path));

  const allNavItems = useMemo(() => (role ? NAV_BY_ROLE[role] : []), [role]);
  const primaryItems = useMemo(() => (role ? getPrimaryNavItems(role) : []), [role]);
  const secondaryItems = useMemo(() => (role ? getSecondaryNavItems(role) : []), [role]);

  if (!role) return null;

  const moreActive =
    allNavItems.some((item) => isActivePath(item.path)) && !primaryItems.some((item) => isActivePath(item.path));

  return (
    <>
      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-text-primary/32 backdrop-blur-[2px] lg:hidden"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
            />
            <motion.div
              id="mobile-nav-more-menu"
              role="dialog"
              aria-modal="true"
              aria-label="More navigation routes"
              className="glass nav-sheet-offset fixed inset-x-3 z-50 rounded-3xl p-4 shadow-[0_24px_50px_rgba(4,23,16,0.24)] lg:hidden"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 14, scale: 0.98 }}
              transition={prefersReducedMotion ? undefined : { duration: 0.18 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-tertiary">More</p>
                  <p className="text-lg font-bold text-text-primary">MedFamily routes</p>
                </div>
                <button
                  type="button"
                  className="theme-chip flex h-10 w-10 items-center justify-center rounded-2xl text-text-secondary focus-visible:outline-none focus-visible:ring-soft"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close more menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {secondaryItems.map(({ path, label, mobileLabel, icon: Icon }) => {
                  const active = isActivePath(path);

                  return (
                    <button
                      key={path}
                      type="button"
                      className={cn(
                        'flex min-h-16 items-center gap-3 rounded-2xl border px-3 text-left transition focus-visible:outline-none focus-visible:ring-soft',
                        active
                          ? 'theme-active-surface text-primary-700'
                          : 'theme-surface text-text-secondary hover:text-text-primary'
                      )}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(path);
                      }}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>
                        <span className="block text-sm font-semibold">{mobileLabel ?? label}</span>
                        <span className="block text-[11px] text-text-tertiary">{label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden" aria-label="Primary navigation">
        <div className="mobile-nav-shell">
          <div className="mx-3 rounded-t-3xl border border-border/80 bg-surface-elevated px-2 py-2 shadow-[0_-10px_32px_rgba(4,23,16,0.12)] backdrop-blur-xl">
            <div className="grid grid-cols-5 gap-1">
              {primaryItems.map(({ path, label, mobileLabel, icon: Icon }) => {
                const active = isActivePath(path);

                return (
                  <motion.button
                    key={path}
                    type="button"
                    className={cn(
                      'relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-soft',
                      active ? 'text-primary-700' : 'text-text-secondary'
                    )}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => navigate(path)}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                  >
                    {active ? <motion.span layoutId="mobile-nav-active" className="theme-active-surface absolute inset-0 rounded-2xl" /> : null}
                    <Icon className="relative z-10 h-5 w-5" />
                    <span className="relative z-10 max-w-full truncate">{mobileLabel ?? label}</span>
                  </motion.button>
                );
              })}

              <motion.button
                type="button"
                className={cn(
                  'relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-soft',
                  moreActive || menuOpen ? 'text-primary-700' : 'text-text-secondary'
                )}
                aria-controls="mobile-nav-more-menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              >
                {moreActive || menuOpen ? <motion.span layoutId="mobile-nav-more-active" className="theme-active-surface absolute inset-0 rounded-2xl" /> : null}
                {menuOpen ? <X className="relative z-10 h-5 w-5" /> : <Grid2x2 className="relative z-10 h-5 w-5" />}
                <span className="relative z-10">More</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
