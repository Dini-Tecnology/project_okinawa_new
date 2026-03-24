import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';
import ApiService from '@okinawa/shared/services/api';

interface MaintenanceState {
  isInMaintenance: boolean;
  message?: string;
  estimatedEnd?: string | null;
}

/**
 * useMaintenanceCheck — Monitors API responses for 503 maintenance status.
 *
 * Usage:
 *   const { isInMaintenance, message, estimatedEnd, clearMaintenance } = useMaintenanceCheck();
 *
 *   if (isInMaintenance) {
 *     return <MaintenanceScreen message={message} estimatedEnd={estimatedEnd} onMaintenanceOver={clearMaintenance} />;
 *   }
 *
 * The hook also sets up an axios response interceptor on the shared ApiService
 * instance to automatically detect 503 responses with `{ maintenance: true }`.
 */
export function useMaintenanceCheck() {
  const [state, setState] = useState<MaintenanceState>({
    isInMaintenance: false,
  });

  const interceptorIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Register a response interceptor that detects maintenance 503s
    interceptorIdRef.current = ApiService.addResponseInterceptor(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 503) {
          const data = error.response.data as any;
          if (data?.maintenance === true) {
            setState({
              isInMaintenance: true,
              message: data.message,
              estimatedEnd: data.estimatedEnd || null,
            });
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      if (interceptorIdRef.current !== null) {
        ApiService.removeResponseInterceptor(interceptorIdRef.current);
      }
    };
  }, []);

  const clearMaintenance = useCallback(() => {
    setState({ isInMaintenance: false });
  }, []);

  return {
    isInMaintenance: state.isInMaintenance,
    message: state.message,
    estimatedEnd: state.estimatedEnd,
    clearMaintenance,
  };
}
