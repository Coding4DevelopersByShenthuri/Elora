import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, CheckCheck, Loader2, RefreshCw, Trash2, Undo2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import UserNotificationsService, { type UserNotification } from '@/services/UserNotificationsService';
import { cn } from '@/lib/utils';

const formatTimeAgo = (timestamp?: number): string => {
  if (!timestamp) return '';
  const delta = Date.now() - timestamp;
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

const typeBadgeStyles: Record<UserNotification['type'], string> = {
  system: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  certificate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  trophy: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  achievement: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
};

const typeEmoji: Record<UserNotification['type'], string> = {
  system: '🔔',
  certificate: '📜',
  badge: '🎖️',
  trophy: '🏆',
  achievement: '🌟',
};

const DEFAULT_LIMIT = 12;

const UserNotificationBell = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const loadNotifications = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!user?.id) return;
      setLoading((prev) => prev || options.force === true);
      try {
        const data = await UserNotificationsService.getAll(user.id, { forceRefresh: options.force });
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id || !isAuthenticated) {
      setNotifications([]);
      return;
    }

    let isMounted = true;
    const initialize = async () => {
      setLoading(true);
      try {
        const data = await UserNotificationsService.getAll(user.id, { forceRefresh: true });
        if (!isMounted) return;
        setNotifications(data);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();
    // Removed polling interval to reduce server load - rely on initial load and manual refresh
    // const interval = setInterval(() => {
    //   initialize();
    // }, 60_000);

    return () => {
      isMounted = false;
      // clearInterval(interval);
    };
  }, [isAuthenticated, user?.id]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setSyncing(true);
    try {
      const updated = await UserNotificationsService.markAllRead(user.id);
      setNotifications(updated);
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkRead = async (notification: UserNotification, nextState: boolean) => {
    if (!user?.id) return;
    const updated = await UserNotificationsService.markRead(user.id, notification.id, nextState);
    setNotifications(updated);
  };

  const handleDelete = async (notification: UserNotification) => {
    if (!user?.id) return;
    const updated = await UserNotificationsService.delete(user.id, notification.id);
    setNotifications(updated);
  };

  const handleRefresh = async () => {
    if (!user?.id) return;
    setSyncing(true);
    try {
      const updated = await UserNotificationsService.sync(user.id);
      setNotifications(updated);
    } finally {
      setSyncing(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayedNotifications = notifications.slice(0, DEFAULT_LIMIT);
  const hasMore = notifications.length > DEFAULT_LIMIT;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative rounded-lg h-9 w-9 transition-all',
            unreadCount > 0 && 'text-primary hover:text-primary'
          )}
          aria-label="Notifications"
        >
          {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 min-w-[1.2rem] rounded-full px-1 text-[10px] leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Stay on top of your learning milestones
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={syncing}
              aria-label="Refresh notifications"
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || syncing}
              aria-label="Mark all notifications as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading notifications...
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
            <Bell className="h-6 w-6 opacity-60" />
            <div>No notifications yet</div>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Unlock stories, certificates, and badges to see them here instantly.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <div className="space-y-2 px-4 py-3">
              {displayedNotifications.map((notification) => {
                const badgeClass = typeBadgeStyles[notification.type] ?? typeBadgeStyles.system;
                const emoji = notification.icon || typeEmoji[notification.type] || typeEmoji.system;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'rounded-xl border p-3 shadow-sm transition hover:border-primary/40 hover:shadow-md',
                      notification.isRead
                        ? 'bg-background'
                        : 'border-primary/40 bg-primary/5 dark:border-primary/30 dark:bg-primary/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xl leading-none">{emoji}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {notification.title}
                          </p>
                          <Badge className={cn('h-5 text-[10px] uppercase tracking-wide', badgeClass)}>
                            {notification.type}
                          </Badge>
                          {!notification.isRead && (
                            <span className="text-[10px] font-semibold uppercase text-primary">
                              New
                            </span>
                          )}
                          {notification.pendingSync && (
                            <Badge variant="outline" className="h-5 text-[10px]">
                              Syncing…
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                          {notification.actionUrl && (
                            <button
                              type="button"
                              className="font-medium text-primary hover:underline"
                              onClick={() => {
                                window.open(notification.actionUrl, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              View details
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMarkRead(notification, !notification.isRead)}
                          aria-label={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                        >
                          {notification.isRead ? (
                            <Undo2 className="h-4 w-4" />
                          ) : (
                            <CheckCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(notification)}
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-xs text-muted-foreground">
            {notifications.length === 0
              ? 'Earn achievements to unlock more notifications.'
              : hasMore
              ? `Showing ${DEFAULT_LIMIT} of ${notifications.length}`
              : `${notifications.length} notification${notifications.length === 1 ? '' : 's'}`}
          </div>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-sm font-medium text-primary focus:bg-primary/10 focus:text-primary"
            onSelect={(event) => {
              event.preventDefault();
              setOpen(false);
              navigate('/profile#notifications');
            }}
          >
            View profile
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNotificationBell;

