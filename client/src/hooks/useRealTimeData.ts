/**
 * useRealTimeData Hook
 * 
 * React hook for subscribing to real-time data updates.
 * Automatically handles subscription/unsubscription and provides loading states.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import RealTimeDataService, { type DataType } from '@/services/RealTimeDataService';

interface UseRealTimeDataOptions {
  interval?: number; // Custom polling interval
  immediate?: boolean; // Fetch immediately on mount
  enabled?: boolean; // Enable/disable polling
  onError?: (error: Error) => void;
}

export function useRealTimeData<T = any>(
  dataType: DataType,
  options: UseRealTimeDataOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const { interval, immediate = true, enabled = true, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const subscriberIdRef = useRef<string | null>(null);

  // Callback for receiving updates
  const handleUpdate = useCallback((newData: T) => {
    setData(newData);
    setLoading(false);
    setError(null);
  }, []);

  // Refresh function
  const refresh = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newData = await RealTimeDataService.refresh(dataType, true);
      setData(newData);
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      if (onError) {
        onError(error);
      }
    }
  }, [dataType, enabled, onError]);

  // Subscribe/unsubscribe effect
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Try to get cached data first
    const cached = RealTimeDataService.getCachedData(dataType);
    if (cached !== null) {
      setData(cached);
      setLoading(false);
    }

    // Subscribe to updates
    const id = RealTimeDataService.subscribe(
      dataType,
      handleUpdate,
      { interval, immediate }
    );
    subscriberIdRef.current = id;

    // Initial fetch if immediate and no cached data
    if (immediate && cached === null) {
      refresh();
    }

    // Cleanup on unmount
    return () => {
      if (subscriberIdRef.current) {
        RealTimeDataService.unsubscribe(subscriberIdRef.current);
        subscriberIdRef.current = null;
      }
    };
  }, [dataType, interval, immediate, enabled, handleUpdate, refresh]);

  return { data, loading, error, refresh };
}

/**
 * Hook for multiple real-time data subscriptions
 */
export function useMultipleRealTimeData(
  subscriptions: Array<{ dataType: DataType; options?: UseRealTimeDataOptions }>
): Record<string, { data: any; loading: boolean; error: Error | null; refresh: () => Promise<void> }> {
  const results: Record<string, any> = {};

  subscriptions.forEach(({ dataType, options }) => {
    const hookResult = useRealTimeData(dataType, options);
    results[dataType] = hookResult;
  });

  return results;
}

