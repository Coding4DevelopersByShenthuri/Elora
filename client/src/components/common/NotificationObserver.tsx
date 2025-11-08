import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserNotificationsService, { type UserNotification } from '@/services/UserNotificationsService';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

const POLL_INTERVAL_MS = 45_000;

const NotificationObserver = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const lastSeenAtRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const currentUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      lastSeenAtRef.current = 0;
      initializedRef.current = false;
      seenIdsRef.current.clear();
      currentUserRef.current = null;
      return;
    }

    if (currentUserRef.current !== String(user.id)) {
      // Reset tracking when user changes
      lastSeenAtRef.current = 0;
      initializedRef.current = false;
      seenIdsRef.current.clear();
      currentUserRef.current = String(user.id);
    }

    let cancelled = false;

    const processNotifications = (items: UserNotification[]) => {
      if (cancelled) return;

      if (!initializedRef.current) {
        items.forEach((item) => {
          if (item.id) {
            seenIdsRef.current.add(item.id);
          }
        });
        const maxTimestamp = items.reduce((max, item) => Math.max(max, item.createdAt ?? 0), 0);
        if (maxTimestamp) {
          lastSeenAtRef.current = maxTimestamp;
        }
        initializedRef.current = true;
        return;
      }

      let latestTimestamp = lastSeenAtRef.current;

      items.forEach((item) => {
        if (item.createdAt && item.createdAt > latestTimestamp) {
          latestTimestamp = item.createdAt;
        }

        if (!item.id || seenIdsRef.current.has(item.id)) {
          return;
        }

        if (!item.isRead && item.createdAt && item.createdAt > lastSeenAtRef.current) {
          seenIdsRef.current.add(item.id);

          toast({
            title: item.title || 'New notification',
            description: item.message,
            duration: 6000,
            action: item.actionUrl ? (
              <ToastAction
                altText="View details"
                onClick={() => window.open(item.actionUrl as string, '_blank', 'noopener,noreferrer')}
              >
                View
              </ToastAction>
            ) : undefined,
          });
        }
      });

      lastSeenAtRef.current = latestTimestamp;
    };

    const hydrate = async () => {
      try {
        const notifications = await UserNotificationsService.getAll(String(user.id), { forceRefresh: true });
        processNotifications(notifications);
      } catch {
        // Ignore fetch errors; offline mode or auth issues will retry on next interval.
      }
    };

    hydrate();
    const intervalId = window.setInterval(hydrate, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, toast, user?.id]);

  return null;
};

export default NotificationObserver;


