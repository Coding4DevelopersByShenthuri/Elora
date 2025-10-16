import { useState, useEffect } from 'react';
import { Cloud, CloudOff, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HybridServiceManager from '@/services/HybridServiceManager';

interface SyncStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const SyncStatusIndicator = ({ className, showDetails = true }: SyncStatusIndicatorProps) => {
  const [syncStatus, setSyncStatus] = useState({
    mode: 'hybrid' as 'offline' | 'online' | 'hybrid',
    online: false,
    pendingSessions: 0,
    autoSyncEnabled: false
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    updateStatus();
    
    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    
    // Listen to connection changes
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStatus = () => {
    try {
      const status = HybridServiceManager.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error getting sync status:', error);
    }
  };

  const handleManualSync = async () => {
    if (!syncStatus.online) {
      alert('⚠️ No internet connection. Please connect to WiFi to sync your progress.');
      return;
    }

    setIsSyncing(true);
    try {
      await HybridServiceManager.forceSyncNow();
      setLastSyncTime(new Date());
      updateStatus();
    } catch (error) {
      console.error('Error syncing:', error);
      alert('Failed to sync. Please try again later.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = () => {
    if (isSyncing) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    if (!syncStatus.online) {
      return <CloudOff className="w-5 h-5 text-gray-400" />;
    }
    
    if (syncStatus.pendingSessions > 0) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (isSyncing) {
      return 'Syncing...';
    }
    
    if (!syncStatus.online) {
      return 'Offline Mode';
    }
    
    if (syncStatus.pendingSessions > 0) {
      return `${syncStatus.pendingSessions} pending`;
    }
    
    return 'All synced';
  };

  const getStatusColor = () => {
    if (isSyncing) return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
    if (!syncStatus.online) return 'border-gray-200 bg-gray-50 dark:bg-gray-800';
    if (syncStatus.pendingSessions > 0) return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
    return 'border-green-200 bg-green-50 dark:bg-green-900/20';
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return lastSyncTime.toLocaleDateString();
  };

  if (!showDetails) {
    // Compact mode - just icon
    return (
      <button
        onClick={handleManualSync}
        disabled={!syncStatus.online || isSyncing}
        className={cn(
          "p-2 rounded-full transition-all duration-300 hover:scale-110",
          getStatusColor(),
          className
        )}
        title={getStatusText()}
      >
        {getStatusIcon()}
      </button>
    );
  }

  return (
    <div className={cn("rounded-xl border-2 p-4", getStatusColor(), className)}>
      <div className="flex items-center justify-between gap-4">
        {/* Status Info */}
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">
              {getStatusText()}
            </p>
            {syncStatus.online && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last sync: {formatLastSync()}
              </p>
            )}
            {!syncStatus.online && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your progress is saved locally
              </p>
            )}
          </div>
        </div>

        {/* Sync Button */}
        {syncStatus.online && syncStatus.pendingSessions > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="whitespace-nowrap"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        )}
      </div>

      {/* Mode Badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-semibold",
          syncStatus.mode === 'offline' && "bg-gray-200 text-gray-700",
          syncStatus.mode === 'online' && "bg-blue-200 text-blue-700",
          syncStatus.mode === 'hybrid' && "bg-purple-200 text-purple-700"
        )}>
          {syncStatus.mode === 'offline' && '📴 Offline Only'}
          {syncStatus.mode === 'online' && '🌐 Online Only'}
          {syncStatus.mode === 'hybrid' && '🔄 Hybrid Mode'}
        </span>
        
        {syncStatus.autoSyncEnabled && (
          <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-700 font-semibold">
            ⚡ Auto-sync ON
          </span>
        )}
      </div>
    </div>
  );
};

export default SyncStatusIndicator;

