import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type StartOptions = {
  /** Keep the loader visible while the app is offline until connectivity returns. */
  stickUntilOnline?: boolean;
};

type RouteLoadingContextValue = {
  isRouteLoading: boolean;
  isOffline: boolean;
  startLoading: (options?: StartOptions) => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>, options?: StartOptions) => Promise<T>;
};

const RouteLoadingContext = createContext<RouteLoadingContextValue | undefined>(undefined);

export const RouteLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [stickUntilOnline, setStickUntilOnline] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (stickUntilOnline) {
        setStickUntilOnline(false);
        setIsRouteLoading(false);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [stickUntilOnline]);

  const startLoading = useCallback((options?: StartOptions) => {
    setIsRouteLoading(true);
    if (options?.stickUntilOnline) {
      setStickUntilOnline(true);
    }
  }, []);

  const stopLoading = useCallback(() => {
    if (stickUntilOnline && isOffline) {
      return;
    }
    setIsRouteLoading(false);
    if (!isOffline) {
      setStickUntilOnline(false);
    }
  }, [isOffline, stickUntilOnline]);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, options?: StartOptions) => {
      startLoading(options);
      try {
        return await promise;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  const value = useMemo<RouteLoadingContextValue>(
    () => ({ isRouteLoading, isOffline, startLoading, stopLoading, withLoading }),
    [isRouteLoading, isOffline, startLoading, stopLoading, withLoading]
  );

  return (
    <RouteLoadingContext.Provider value={value}>
      {children}
    </RouteLoadingContext.Provider>
  );
};

export const useRouteLoading = () => {
  const context = useContext(RouteLoadingContext);
  if (!context) {
    throw new Error('useRouteLoading must be used within a RouteLoadingProvider');
  }
  return context;
};
