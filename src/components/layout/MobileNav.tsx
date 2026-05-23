import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Grid2x2, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { NAV_BY_ROLE, getPrimaryNavItems, getSecondaryNavItems } from '@/components/layout/navConfig';
import { cn } from '@/utils/cn';

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isActivePath = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  const allNavItems = useMemo(() => (role ? NAV_BY_ROLE[role] : []), [role]);
  const primaryItems = useMemo(() => (role ? getPrimaryNavItems(role) : []), [role]);
  const secondaryItems = useMemo(() => (role ? getSecondaryNavItems(role) : []), [role]);

  if (!role) {
    return null;
  }

  const moreActive =
    allNavItems.some((item) => isActivePath(item.path)) && !primaryItems.some((item) => isActivePath(item.path));

  return (
    <>
      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-text-primary/28 backdrop-blur-[2px] sm:hidden"
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
              className="glass nav-sheet-offset fixed inset-x-3 z-50 rounded-[30px] p-4 shadow-[0_24px_50px_rgba(16,63,95,0.18)] sm:hidden"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: 14, scale: 0.98 }}
              transition={prefersReducedMotion ? undefined : { duration: 0.18 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">More routes</p>
                  <p className="mt-1 text-lg font-bold text-text-primary">Navigate MedFamily</p>
                </div>
                <button
                  type="button"
                  className="theme-chip rounded-full p-2 text-text-secondary focus-visible:outline-none focus-visible:ring-soft"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close more menu"
                >
                  <X className="h-4 w-4" />
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
                        'flex items-center gap-3 rounded-[22px] border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-soft',
                        active
                          ? 'border-primary-300 theme-surface-accent text-primary-700'
                          : 'border-border theme-surface text-text-secondary'
                      )}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(path);
                      }}
                    >
                      <div className="theme-chip-strong flex h-10 w-10 items-center justify-center rounded-[18px] soft-shadow">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-current">{mobileLabel ?? label}</p>
                        <p className="text-[11px] text-text-tertiary">{label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-40 sm:hidden" aria-label="Primary navigation">
        <div className="mobile-nav-shell">
          <div className="glass mx-3 rounded-[28px] px-2 py-2 shadow-[0_18px_40px_rgba(16,63,95,0.14)]">
            <div className="grid grid-cols-5 gap-1">
              {primaryItems.map(({ path, label, mobileLabel, icon: Icon }) => {
                const active = isActivePath(path);

                return (
                  <motion.button
                    key={path}
                    type="button"
                    className={cn(
                      'relative flex flex-col items-center gap-1 rounded-[20px] px-2 py-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-soft',
                      active ? 'text-primary-700' : 'text-text-tertiary'
                    )}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => navigate(path)}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                  >
                    {active ? (
                      <motion.div
                        layoutId="mobile-nav-active"
                        className="theme-active-surface absolute inset-0 rounded-[20px]"
                        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                      />
                    ) : null}
                    <Icon className="relative z-10 h-4.5 w-4.5" />
                    <span className="relative z-10">{mobileLabel ?? label}</span>
                  </motion.button>
                );
              })}

              <motion.button
                type="button"
                className={cn(
                  'relative flex flex-col items-center gap-1 rounded-[20px] px-2 py-2.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-soft',
                  moreActive || menuOpen ? 'text-primary-700' : 'text-text-tertiary'
                )}
                aria-controls="mobile-nav-more-menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              >
                {moreActive || menuOpen ? (
                  <motion.div
                    layoutId="mobile-nav-more-active"
                    className="theme-active-surface absolute inset-0 rounded-[20px]"
                    transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                  />
                ) : null}
                {menuOpen ? (
                  <X className="relative z-10 h-4.5 w-4.5" />
                ) : (
                  <Grid2x2 className="relative z-10 h-4.5 w-4.5" />
                )}
                <span className="relative z-10">More</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
