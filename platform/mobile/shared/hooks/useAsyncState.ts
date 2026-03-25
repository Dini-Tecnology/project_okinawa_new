/**
 * useAsyncState — Reusable hook for consistent loading/error/empty state management
 *
 * Wraps TanStack Query patterns into a unified interface that every screen
 * can consume with the same API, reducing boilerplate and enforcing
 * consistent UX for loading spinners, error messages, and empty states.
 *
 * @module shared/hooks/useAsyncState
 */

import { useMemo, useCallback } from 'react';
import {
  UseQueryResult,
  UseInfiniteQueryResult,
  QueryObserverResult,
} from '@tanstack/react-query';

/**
 * Represents the unified async state returned by the hook.
 */
export interface AsyncState<T> {
  /** The resolved data (undefined while loading or on error) */
  data: T | undefined;
  /** True while the initial fetch is in progress */
  loading: boolean;
  /** True while a background refetch is in progress */
  refreshing: boolean;
  /** Error object if the query failed, null otherwise */
  error: Error | null;
  /** Convenience flag: true when data is loaded but logically "empty" */
  isEmpty: boolean;
  /** Whether the query has completed at least once successfully */
  isSuccess: boolean;
  /** Trigger a manual refetch */
  retry: () => void;
  /** Formatted error message suitable for display */
  errorMessage: string | null;
}

/**
 * Options for customizing empty-state detection.
 */
export interface UseAsyncStateOptions<T> {
  /**
   * Custom predicate to determine whether the data should be considered "empty".
   * Defaults to checking for null/undefined, empty arrays, and empty objects.
   */
  isEmptyFn?: (data: T | undefined) => boolean;
}

/**
 * Default empty check: handles arrays, objects, null, and undefined.
 */
function defaultIsEmpty<T>(data: T | undefined): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).length === 0;
  }
  return false;
}

/**
 * Extracts a display-friendly error message from an unknown error value.
 */
function extractErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

/**
 * Wraps a TanStack `useQuery` result into a standardized `AsyncState`.
 *
 * @example
 * ```tsx
 * const ordersQuery = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });
 * const { data, loading, error, isEmpty, retry, errorMessage } = useAsyncState(ordersQuery);
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={errorMessage!} onRetry={retry} />;
 * if (isEmpty) return <EmptyState title="No orders" message="Place your first order" />;
 *
 * return <OrderList orders={data!} />;
 * ```
 */
export function useAsyncState<T>(
  queryResult: UseQueryResult<T, Error> | UseInfiniteQueryResult<T, Error>,
  options?: UseAsyncStateOptions<T>,
): AsyncState<T> {
  const isEmptyFn = options?.isEmptyFn ?? defaultIsEmpty;

  const retry = useCallback(() => {
    queryResult.refetch();
  }, [queryResult]);

  const state = useMemo<AsyncState<T>>(() => {
    const loading = queryResult.isLoading;
    const refreshing = queryResult.isFetching && !queryResult.isLoading;
    const error = queryResult.error ?? null;
    const data = queryResult.data;
    const isSuccess = queryResult.isSuccess;
    const isEmpty = isSuccess && isEmptyFn(data);
    const errorMessage = extractErrorMessage(error);

    return {
      data,
      loading,
      refreshing,
      error,
      isEmpty,
      isSuccess,
      retry,
      errorMessage,
    };
  }, [
    queryResult.isLoading,
    queryResult.isFetching,
    queryResult.error,
    queryResult.data,
    queryResult.isSuccess,
    isEmptyFn,
    retry,
  ]);

  return state;
}

/**
 * Combines multiple async states into one composite state.
 * Loading if ANY query is loading. Error if ANY query errored.
 * Useful for screens that depend on multiple parallel queries.
 *
 * @example
 * ```tsx
 * const ordersState = useAsyncState(ordersQuery);
 * const tabsState = useAsyncState(tabsQuery);
 * const combined = useCombinedAsyncState([ordersState, tabsState]);
 *
 * if (combined.loading) return <LoadingSpinner />;
 * if (combined.error) return <ErrorMessage message={combined.errorMessage!} onRetry={combined.retry} />;
 * ```
 */
export function useCombinedAsyncState(
  states: AsyncState<unknown>[],
): Omit<AsyncState<unknown>, 'data' | 'isEmpty'> & {
  allLoaded: boolean;
  anyError: boolean;
} {
  return useMemo(() => {
    const loading = states.some((s) => s.loading);
    const refreshing = states.some((s) => s.refreshing);
    const firstError = states.find((s) => s.error)?.error ?? null;
    const isSuccess = states.every((s) => s.isSuccess);
    const errorMessage = extractErrorMessage(firstError);

    return {
      data: undefined,
      loading,
      refreshing,
      error: firstError,
      isSuccess,
      errorMessage,
      allLoaded: isSuccess,
      anyError: firstError !== null,
      retry: () => {
        states.forEach((s) => s.retry());
      },
    };
  }, [states]);
}

export default useAsyncState;
