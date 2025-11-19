import { NotificationsAPI } from './ApiService';
import { userDataService, type StoredNotification } from './UserDataService';

type NotificationInput = {
  type?: StoredNotification['type'];
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  eventKey?: string;
  metadata?: Record<string, unknown>;
};

type GetOptions = {
  forceRefresh?: boolean;
};

const MAX_NOTIFICATIONS = 120;

const createLocalId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
};

const toTimestamp = (value: string | Date | undefined): number | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const sortNotifications = (items: StoredNotification[]): StoredNotification[] =>
  [...items].sort((a, b) => b.createdAt - a.createdAt);

const clampNotifications = (items: StoredNotification[]): StoredNotification[] =>
  sortNotifications(items).slice(0, MAX_NOTIFICATIONS);

const mapServerNotification = (raw: any): StoredNotification => ({
  id: `server-${raw.id}`,
  serverId: Number(raw.id),
  eventKey: raw.event_key || undefined,
  type: (raw.notification_type || 'system') as StoredNotification['type'],
  title: raw.title ?? '',
  message: raw.message ?? '',
  icon: raw.icon || undefined,
  actionUrl: raw.action_url || undefined,
  metadata: raw.metadata || {},
  isRead: Boolean(raw.is_read),
  createdAt: toTimestamp(raw.created_at) ?? Date.now(),
  readAt: toTimestamp(raw.read_at),
  source: 'server',
  pendingSync: false,
  lastSyncedAt: Date.now(),
});

const mergeNotifications = (
  current: StoredNotification[],
  incoming: StoredNotification[]
): StoredNotification[] => {
  const merged = [...current];
  const byServerId = new Map<number, StoredNotification>();
  const byEventKey = new Map<string, StoredNotification>();

  merged.forEach((item) => {
    if (item.serverId) {
      byServerId.set(item.serverId, item);
    }
    if (item.eventKey) {
      byEventKey.set(item.eventKey, item);
    }
  });

  incoming.forEach((incomingItem) => {
    const existing =
      (incomingItem.serverId ? byServerId.get(incomingItem.serverId) : undefined) ||
      (incomingItem.eventKey ? byEventKey.get(incomingItem.eventKey) : undefined);

    if (existing) {
      existing.id = incomingItem.id;
      existing.serverId = incomingItem.serverId;
      existing.eventKey = incomingItem.eventKey;
      existing.type = incomingItem.type;
      existing.title = incomingItem.title;
      existing.message = incomingItem.message;
      existing.icon = incomingItem.icon;
      existing.actionUrl = incomingItem.actionUrl;
      existing.metadata = incomingItem.metadata;
      existing.isRead = incomingItem.isRead;
      existing.createdAt = incomingItem.createdAt;
      existing.readAt = incomingItem.readAt;
      existing.source = 'server';
      existing.pendingSync = false;
      existing.lastSyncedAt = Date.now();
    } else {
      merged.push(incomingItem);
    }
  });

  return clampNotifications(merged);
};

const ensureLocalNotifications = async (userId: string): Promise<StoredNotification[]> => {
  await userDataService.initDB();
  const data = await userDataService.getUserLearningData(userId);
  if (!data?.notifications) {
    await userDataService.saveUserLearningData(userId, { notifications: [] });
    return [];
  }
  return [...data.notifications];
};

const persistNotifications = async (userId: string, notifications: StoredNotification[]) => {
  await userDataService.saveUserLearningData(userId, { notifications: clampNotifications(notifications) });
};

const fetchServerNotifications = async () => {
  const token = localStorage.getItem('speakbee_auth_token');
  if (!token || token === 'local-token') {
    return null;
  }
  const response = await NotificationsAPI.list();
  if (!response.success || !('data' in response) || !response.data) {
    return null;
  }
  const data: any = response.data;
  const serverItems = Array.isArray(data.notifications) ? data.notifications : [];
  return serverItems.map(mapServerNotification);
};

export type UserNotification = StoredNotification;

export const UserNotificationsService = {
  async getAll(userId: string, options: GetOptions = {}): Promise<StoredNotification[]> {
    const localNotifications = await ensureLocalNotifications(userId);
    let notifications = [...localNotifications];

    if (navigator.onLine) {
      try {
        const serverNotifications = await fetchServerNotifications();
        if (serverNotifications) {
          notifications = mergeNotifications(notifications, serverNotifications);
          await persistNotifications(userId, notifications);
        }
      } catch {
        // Ignore sync errors, rely on local cache
      }
    }

    return clampNotifications(notifications);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await ensureLocalNotifications(userId);
    return notifications.filter((item) => !item.isRead).length;
  },

  async create(userId: string, payload: NotificationInput): Promise<{
    notifications: StoredNotification[];
    notification: StoredNotification;
  }> {
    const notifications = await ensureLocalNotifications(userId);
    const now = Date.now();
    const notification: StoredNotification = {
      id: createLocalId(),
      type: payload.type ?? 'system',
      title: payload.title,
      message: payload.message,
      icon: payload.icon,
      actionUrl: payload.actionUrl,
      metadata: payload.metadata ?? {},
      eventKey: payload.eventKey,
      isRead: false,
      createdAt: now,
      source: navigator.onLine ? 'server' : 'local',
      pendingSync: navigator.onLine ? false : true,
    };
    const updatedNotifications = clampNotifications([notification, ...notifications]);
    await persistNotifications(userId, updatedNotifications);

    if (navigator.onLine) {
      try {
        const response = await NotificationsAPI.create({
          notification_type: notification.type,
          title: notification.title,
          message: notification.message,
          icon: notification.icon,
          action_url: notification.actionUrl,
          event_key: notification.eventKey,
          metadata: notification.metadata,
        });

        if (response.success && 'data' in response && response.data) {
          const serverNotification = mapServerNotification((response as any).data);
          const merged = mergeNotifications(updatedNotifications, [serverNotification]);
          await persistNotifications(userId, merged);
          return { notifications: merged, notification: serverNotification };
        }
      } catch {
        // Fallback to local record
      }
    }

    return { notifications: updatedNotifications, notification };
  },

  async markRead(userId: string, notificationId: string, isRead: boolean = true): Promise<StoredNotification[]> {
    const notifications = await ensureLocalNotifications(userId);
    const updated = notifications.map((item) =>
      item.id === notificationId
        ? {
            ...item,
            isRead,
            readAt: isRead ? Date.now() : undefined,
            pendingSync: item.serverId ? item.pendingSync : !navigator.onLine,
          }
        : item
    );
    await persistNotifications(userId, updated);

    const target = updated.find((item) => item.id === notificationId);
    if (navigator.onLine && target?.serverId) {
      try {
        await NotificationsAPI.markRead(target.serverId, isRead);
        target.pendingSync = false;
        target.readAt = isRead ? Date.now() : undefined;
        await persistNotifications(userId, updated);
      } catch {
        target.pendingSync = true;
        await persistNotifications(userId, updated);
      }
    }

    return clampNotifications(updated);
  },

  async markAllRead(userId: string): Promise<StoredNotification[]> {
    const notifications = await ensureLocalNotifications(userId);
    const now = Date.now();
    const updated = notifications.map((item) => ({
      ...item,
      isRead: true,
      readAt: now,
      pendingSync: item.serverId ? item.pendingSync : !navigator.onLine,
    }));
    await persistNotifications(userId, updated);

    if (navigator.onLine) {
      try {
        await NotificationsAPI.markAllRead();
        const synced = updated.map((item) => ({ ...item, pendingSync: false }));
        await persistNotifications(userId, synced);
        return clampNotifications(synced);
      } catch {
        // Ignore, will retry later
      }
    }

    return clampNotifications(updated);
  },

  async delete(userId: string, notificationId: string): Promise<StoredNotification[]> {
    const notifications = await ensureLocalNotifications(userId);
    const target = notifications.find((item) => item.id === notificationId);
    const remaining = notifications.filter((item) => item.id !== notificationId);
    await persistNotifications(userId, remaining);

    if (navigator.onLine && target?.serverId) {
      try {
        await NotificationsAPI.delete(target.serverId);
      } catch {
        const restored = clampNotifications([...remaining, target]);
        await persistNotifications(userId, restored);
        return restored;
      }
    }

    return clampNotifications(remaining);
  },

  async sync(userId: string): Promise<StoredNotification[]> {
    return this.getAll(userId, { forceRefresh: true });
  },
};

export default UserNotificationsService;

