import { useEffect, useState, useCallback } from 'react';
import { WifiOff, RefreshCcw, Cloud } from 'lucide-react';

export const OfflineIndicator = () => {
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

  const retryConnection = useCallback(() => {
    if (navigator.onLine) {
      window.location.reload();
    }
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="max-w-md w-full rounded-2xl border border-red-500/40 bg-white/95 p-6 text-center shadow-2xl dark:bg-slate-950/95">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <WifiOff className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Connection Required</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Elora operates exclusively in online mode to keep your progress, lessons, and AI services in sync.
          Please check your internet connection and reconnect to continue.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={retryConnection}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:bg-red-400"
            disabled={!navigator.onLine}
          >
            <RefreshCcw className="h-4 w-4" />
            Retry Now
          </button>
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Cloud className="h-3.5 w-3.5" />
            Waiting for internet connection…
          </span>
        </div>
      </div>
    </div>
  );
};

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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
        isOnline
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
      }`}
      title={isOnline ? 'Online mode active' : 'Offline mode is not supported'}
    >
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};

export default OfflineIndicator;

