import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface NotificationContextValue {
  permission: NotificationPermission | 'default';
  unreadCount: number;
  requestPermission: () => Promise<void>;
  sendBrowserNotification: (title: string, body: string) => void;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | 'default'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }

    return 'default';
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      return;
    }

    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setUnreadCount(count ?? 0);
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isActive = true;

    void supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .then(({ count }) => {
        if (isActive) {
          setUnreadCount(count ?? 0);
        }
      });

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase
      .channel(`notifications-unread-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        void refreshUnreadCount();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshUnreadCount, user]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const sendBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (permission !== 'granted') {
        return;
      }

      new Notification(title, {
        body,
        tag: `medfamily-${Date.now()}`,
      });
    },
    [permission]
  );

  const value = useMemo(
    () => ({
      permission,
      unreadCount: user ? unreadCount : 0,
      requestPermission,
      sendBrowserNotification,
      refreshUnreadCount,
      setUnreadCount,
    }),
    [permission, refreshUnreadCount, requestPermission, sendBrowserNotification, unreadCount, user]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}
