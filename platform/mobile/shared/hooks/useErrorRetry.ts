/**
 * useErrorRetry Hook
 *
 * Wraps TanStack Query error handling to provide a consistent
 * error + retry interface for screens with data fetching.
 *
 * @module shared/hooks/useErrorRetry
 */

import { useCallback, useMemo } from 'react';
import { t } from '../i18n';

interface QueryLike {
  error: unknown;
  isError: boolean;
  isRefetching?: boolean;
  refetch: () => void | Promise<unknown>;
}

interface UseErrorRetryResult {
  /** Human-readable error message (null when no error) */
  error: string | null;
  /** Trigger a refetch / retry */
  retry: () => void;
  /** True while a retry refetch is in progress */
  isRetrying: boolean;
}

/**
 * Extract a user-friendly message from an unknown error value.
 */
function extractErrorMessage(error: unknown): string {
  if (!error) return t('errors.generic');

  if (error instanceof Error) {
    // Network / timeout errors
    if (error.message === 'Network Error' || error.message.includes('network')) {
      return t('errors.network');
    }
    return error.message;
  }

  // Axios-style error object
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as Record<string, any>;
    if (axiosError.response?.data?.message) {
      return String(axiosError.response.data.message);
    }
    if (axiosError.message) {
      return String(axiosError.message);
    }
  }

  if (typeof error === 'string') return error;

  return t('errors.generic');
}

/**
 * Provides error and retry state from one or more TanStack Query results.
 *
 * Single query usage:
 * ```ts
 * const query = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
 * const { error, retry, isRetrying } = useErrorRetry(query);
 * ```
 *
 * Multiple queries:
 * ```ts
 * const { error, retry, isRetrying } = useErrorRetry(ordersQuery, statsQuery);
 * ```
 */
export function useErrorRetry(...queries: QueryLike[]): UseErrorRetryResult {
  const firstErrorQuery = useMemo(
    () => queries.find((q) => q.isError),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queries.map((q) => q.isError).join(',')],
  );

  const error = useMemo(() => {
    if (!firstErrorQuery) return null;
    return extractErrorMessage(firstErrorQuery.error);
  }, [firstErrorQuery]);

  const isRetrying = queries.some((q) => q.isRefetching);

  const retry = useCallback(() => {
    queries.forEach((q) => {
      if (q.isError) {
        q.refetch();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries.map((q) => q.isError).join(',')]);

  return { error, retry, isRetrying };
}

export default useErrorRetry;
