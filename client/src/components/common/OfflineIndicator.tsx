import { useEffect, useState } from 'react';
import { WifiOff, Wifi, Cloud, CloudOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only show when offline or when showing online notification
  if (!showNotification && isOnline) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 ${
        isExpanded ? 'scale-100' : 'scale-100'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      title={isOnline ? 'Back Online' : 'Working Offline'}
    >
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full shadow-lg transition-all duration-300 cursor-pointer ${
          isOnline
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi size={14} />
            {isExpanded && <span className="text-[10px] font-medium pr-1">Online</span>}
          </>
        ) : (
          <>
            <WifiOff size={14} className="animate-pulse" />
            {isExpanded && <span className="text-[10px] font-medium pr-1">Offline</span>}
          </>
        )}
      </div>
    </div>
  );
};

// Offline status badge for the navbar or footer
export const OfflineStatusBadge = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        isOnline
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      }`}
      title={isOnline ? 'Online - Data syncing' : 'Offline - Using local data'}
    >
      {isOnline ? (
        <>
          <Cloud size={12} />
          <span>Online</span>
        </>
      ) : (
        <>
          <CloudOff size={12} />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;

