/**
 * useWaiterTables — TanStack Query hook for waiter tables
 *
 * Fetches tables assigned to the current waiter via
 * GET /orders/waiter/my-tables with 15s polling as WebSocket fallback.
 *
 * @module waiter/hooks/useWaiterTables
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '@/shared/services/api';
import type { WaiterTable, TableGuest } from '../types/waiter.types';

// ============================================
// QUERY KEYS
// ============================================

export const waiterQueryKeys = {
  tables: ['waiter', 'tables'] as const,
};

// ============================================
// RETURN TYPE
// ============================================

interface UseWaiterTablesReturn {
  tables: WaiterTable[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => Promise<void>;
  addGuestToTable: (tableNumber: number, guest: TableGuest) => void;
}

// ============================================
// HOOK
// ============================================

export function useWaiterTables(): UseWaiterTablesReturn {
  const queryClient = useQueryClient();

  // ---- Main tables query ----
  const {
    data: tables = [],
    isLoading,
    isError,
    isFetching,
    refetch: queryRefetch,
  } = useQuery<WaiterTable[]>({
    queryKey: waiterQueryKeys.tables,
    queryFn: async () => {
      const response = await ApiService.get('/orders/waiter/my-tables');
      return response.data;
    },
    staleTime: 30_000,
    refetchInterval: 15_000, // polling fallback when WebSocket is unavailable
  });

  // isRefetching = a background refetch is in progress after initial load
  const isRefetching = isFetching && !isLoading;

  // Wrap refetch to match the original Promise<void> signature
  const refetch = useCallback(async () => {
    await queryRefetch();
  }, [queryRefetch]);

  // ---- Update table status mutation ----
  const updateTableStatusMutation = useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: string }) =>
      ApiService.patch(`/tables/${tableId}/status`, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: waiterQueryKeys.tables }),
  });

  // ---- Optimistic addGuestToTable ----
  // Updates the local cache immediately; the next polling cycle will reconcile with server data.
  const addGuestToTable = useCallback(
    (tableNumber: number, guest: TableGuest) => {
      queryClient.setQueryData<WaiterTable[]>(
        waiterQueryKeys.tables,
        (prev = []) =>
          prev.map((table) =>
            table.number === tableNumber
              ? { ...table, guests: [...table.guests, guest] }
              : table,
          ),
      );
    },
    [queryClient],
  );

  return {
    tables,
    isLoading,
    isError,
    isRefetching,
    refetch,
    addGuestToTable,
  };
}
