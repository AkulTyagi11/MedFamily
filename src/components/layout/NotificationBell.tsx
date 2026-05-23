import { Bell } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/context/NotificationContext';
import { ROUTES } from '@/lib/constants';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className="theme-chip relative flex h-11 w-11 items-center justify-center rounded-2xl text-text-secondary transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-soft"
      onClick={() => navigate(ROUTES.NOTIFICATIONS)}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
      title="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </motion.button>
  );
}
