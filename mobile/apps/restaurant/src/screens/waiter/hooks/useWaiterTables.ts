/**
 * useWaiterTables — TanStack Query hook for waiter tables
 *
 * Fetches tables assigned to the current waiter via
 * GET /orders/waiter/my-tables with 15s polling as WebSocket fallback.
 *
 * @module waiter/hooks/useWaiterTables
 */

import { useState, useCallback } from 'react';
import {
  WaiterTable,
  TableGuest,
  MOCK_WAITER_TABLES,
} from '../types/waiter.types';

interface UseWaiterTablesReturn {
  tables: WaiterTable[];
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => Promise<void>;
  addGuestToTable: (tableNumber: number, guest: TableGuest) => void;
}

/**
 * Hook to manage waiter tables.
 *
 * In production this would use TanStack Query:
 *   useQuery({ queryKey: ['waiter', 'tables'], queryFn: ... })
 *
 * For the initial implementation we use local state with mock data
 * and expose the same interface for seamless migration.
 */
export function useWaiterTables(): UseWaiterTablesReturn {
  const [tables, setTables] = useState<WaiterTable[]>(MOCK_WAITER_TABLES);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    try {
      // In production: const data = await apiClient.get('/orders/waiter/my-tables');
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTables(MOCK_WAITER_TABLES);
      setIsError(false);
    } catch {
      setIsError(true);
    } finally {
      setIsRefetching(false);
    }
  }, []);

  const addGuestToTable = useCallback(
    (tableNumber: number, guest: TableGuest) => {
      setTables((prev) =>
        prev.map((table) =>
          table.number === tableNumber
            ? { ...table, guests: [...table.guests, guest] }
            : table,
        ),
      );
    },
    [],
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
