import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, Check, CheckCheck, Loader2, X, Trash2, Filter, Settings,
  User, AlertTriangle, BarChart3, Info, Mail, Shield, Volume2, VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import AdminAPI from '@/services/AdminApiService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Export AdminAPI for console testing (development only)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).AdminAPI = AdminAPI;
}

interface Notification {
  id: number;
  notification_type: string;
  type_display: string;
  priority: string;
  priority_display: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

interface NotificationPreferences {
  soundEnabled: boolean;
  toastEnabled: boolean;
  filterType: string;
  filterPriority: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  toastEnabled: true,
  filterType: 'all',
  filterPriority: 'all',
};

const PREFERENCES_KEY = 'admin_notification_preferences';

// Notification sound (using Web Audio API for a simple beep)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    // Fallback: silent failure if audio context is not available
    console.warn('Could not play notification sound:', error);
  }
};

// Get notification type icon
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'user_registered':
    case 'user_updated':
      return User;
    case 'system_alert':
    case 'system_update':
      return AlertTriangle;
    case 'analytics':
    case 'report':
      return BarChart3;
    case 'security':
      return Shield;
    case 'email':
    case 'message':
      return Mail;
    default:
      return Info;
  }
};

// Get notification priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'normal':
      return 'bg-blue-500';
    case 'low':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const pollIntervalRef = useRef<number | null>(null);
  const countCheckIntervalRef = useRef<number | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        setFilterType(parsed.filterType || 'all');
        setFilterPriority(parsed.filterPriority || 'all');
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: NotificationPreferences) => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }, []);

  // Check for new notifications and show toast/sound
  const checkForNewNotifications = useCallback((newNotifications: Notification[], newUnreadCount: number, currentNotifications: Notification[], currentUnreadCount: number) => {
    // Check if unread count increased
    if (newUnreadCount > currentUnreadCount) {
      const currentIds = new Set(currentNotifications.map(n => n.id));
      const newlyArrived = newNotifications.filter(n => !n.is_read && !currentIds.has(n.id));
      
      if (newlyArrived.length > 0 && preferences.toastEnabled) {
        // Show toast for the most recent new notification
        const latest = newlyArrived[0];
        toast({
          title: latest.title,
          description: latest.message,
          duration: 5000,
        });
      }

      // Play sound if enabled
      if (preferences.soundEnabled) {
        playNotificationSound();
      }
    }
  }, [preferences, toast]);

  const loadNotifications = async (showNewToasts = true) => {
    try {
      setLoading(true);
      const response = await AdminAPI.getNotifications({
        limit: 50,
        unread_only: false,
        type: filterType !== 'all' ? filterType : undefined,
      });

      if (response.success && response.data) {
        const newNotifications = response.data.notifications || [];
        const newUnreadCount = response.data.unread_count || 0;
        
        // Apply priority filter on client side
        const filteredNotifications = filterPriority !== 'all'
          ? newNotifications.filter((n: Notification) => n.priority === filterPriority)
          : newNotifications;
        
        // Log for debugging
        if (import.meta.env.DEV) {
          console.log('[Notifications] Loaded:', {
            total: filteredNotifications.length,
            unread: newUnreadCount,
            timestamp: new Date().toISOString()
          });
        }
        
        // Check for new notifications before updating state
        if (showNewToasts) {
          checkForNewNotifications(filteredNotifications, newUnreadCount, notifications, unreadCount);
        }
        
        setNotifications(filteredNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('[Notifications] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lightweight polling: check unread count first
  const checkUnreadCount = async () => {
    try {
      const response = await AdminAPI.getUnreadCount();
      if (response.success && response.data) {
        const newCount = response.data.unread_count || 0;
        
        // Only reload full notifications if count changed
        if (newCount !== unreadCount) {
          await loadNotifications(true);
        } else {
          setUnreadCount(newCount);
        }
      }
    } catch (error) {
      console.error('[Notifications] Failed to check unread count:', error);
    }
  };

  useEffect(() => {
    // Load notifications on mount
    loadNotifications(false);

    // Poll unread count every 15 seconds (lightweight)
    countCheckIntervalRef.current = window.setInterval(() => {
      if (import.meta.env.DEV) {
        console.log('[Notifications] Checking unread count...', new Date().toLocaleTimeString());
      }
      checkUnreadCount();
    }, 15000); // 15 seconds for count check

    // Full reload every 60 seconds (less frequent)
    pollIntervalRef.current = window.setInterval(() => {
      if (import.meta.env.DEV) {
        console.log('[Notifications] Full reload...', new Date().toLocaleTimeString());
      }
      loadNotifications(true);
    }, 60000); // 60 seconds for full reload

    return () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
      if (countCheckIntervalRef.current) {
        window.clearInterval(countCheckIntervalRef.current);
      }
    };
  }, []);

  // Reload when dropdown opens or filters change
  useEffect(() => {
    if (open) {
      loadNotifications(false);
    }
  }, [open, filterType, filterPriority]);

  // Keyboard shortcut: 'N' to open notifications
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.key.toLowerCase() === 'n' && !open && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open]);

  const handleMarkRead = async (notificationId: number, link?: string) => {
    try {
      const response = await AdminAPI.markNotificationRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Navigate if there's a link
        if (link) {
          navigate(link);
          setOpen(false);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await AdminAPI.deleteNotification(notificationId);
      if (response.success) {
        const deleted = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (deleted && !deleted.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast({
          title: 'Success',
          description: 'Notification deleted',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    const selectedNotifications = notifications.filter(n => n.is_read);
    if (selectedNotifications.length === 0) {
      toast({
        title: 'No notifications to delete',
        description: 'Select read notifications to delete',
        variant: 'destructive',
      });
      return;
    }

    try {
      const ids = selectedNotifications.map(n => n.id);
      const response = await AdminAPI.bulkDeleteNotifications(ids);
      if (response.success) {
        setNotifications(prev => prev.filter(n => !n.is_read));
        toast({
          title: 'Success',
          description: `${ids.length} notifications deleted`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notifications',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await AdminAPI.markAllNotificationsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast({
          title: 'Success',
          description: 'All notifications marked as read',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType !== 'all' && n.notification_type !== filterType) return false;
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
    return true;
  });

  const readCount = notifications.filter(n => n.is_read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications (Press N)">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              title="Settings"
            >
              <Settings className="h-3 w-3" />
            </Button>
            {readCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBulkDelete();
                }}
                title="Delete read notifications"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-6 px-2 text-xs"
                title="Mark all as read"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {showSettings && (
          <>
            <div className="p-3 space-y-3 border-b">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-toggle" className="text-xs flex items-center gap-2">
                  {preferences.soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  Sound
                </Label>
                <Switch
                  id="sound-toggle"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => {
                    savePreferences({ ...preferences, soundEnabled: checked });
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="toast-toggle" className="text-xs flex items-center gap-2">
                  <Bell className="h-3 w-3" />
                  Toast alerts
                </Label>
                <Switch
                  id="toast-toggle"
                  checked={preferences.toastEnabled}
                  onCheckedChange={(checked) => {
                    savePreferences({ ...preferences, toastEnabled: checked });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-2">
                  <Filter className="h-3 w-3" />
                  Filter by type
                </Label>
                <Select
                  value={filterType}
                  onValueChange={(value) => {
                    setFilterType(value);
                    savePreferences({ ...preferences, filterType: value });
                  }}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="user_registered">User Registered</SelectItem>
                    <SelectItem value="system_alert">System Alert</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Filter by priority</Label>
                <Select
                  value={filterPriority}
                  onValueChange={(value) => {
                    setFilterPriority(value);
                    savePreferences({ ...preferences, filterPriority: value });
                  }}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <ScrollArea className="h-[400px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              {(filterType !== 'all' || filterPriority !== 'all') && (
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="py-1">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.notification_type);
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      'flex flex-col items-start p-3 cursor-pointer rounded-lg mb-1 group',
                      !notification.is_read && 'bg-muted/50'
                    )}
                    onClick={() => handleMarkRead(notification.id, notification.link)}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1 min-w-0 flex items-start gap-2">
                        <IconComponent className={cn(
                          "h-4 w-4 mt-0.5 flex-shrink-0",
                          !notification.is_read && "text-primary"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!notification.is_read && (
                              <span
                                className={cn(
                                  'h-2 w-2 rounded-full flex-shrink-0',
                                  getPriorityColor(notification.priority)
                                )}
                                title={notification.priority_display}
                              />
                            )}
                            <span className={cn(
                              "text-sm font-semibold truncate",
                              !notification.is_read && "font-bold"
                            )}>
                              {notification.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type_display}
                            </Badge>
                            {notification.priority === 'urgent' || notification.priority === 'high' ? (
                              <Badge 
                                variant={notification.priority === 'urgent' ? 'destructive' : 'default'}
                                className="text-xs"
                              >
                                {notification.priority_display}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {notification.is_read ? (
                          <Check className="h-4 w-4 text-muted-foreground mt-1" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(notification.id, notification.link);
                            }}
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={(e) => handleDelete(notification.id, e)}
                          title="Delete"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
