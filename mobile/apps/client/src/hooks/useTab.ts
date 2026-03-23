/**
 * useTab — Hook for Pub & Bar tab (comanda) management
 *
 * Combines TanStack React Query for data fetching/caching with
 * WebSocket subscriptions for real-time updates from the tabs gateway.
 *
 * @module client/hooks/useTab
 *
 * @param tabId - The UUID of the tab to manage
 * @returns {object} Tab state and mutation functions:
 *   - tab: Current tab data (or undefined if loading)
 *   - isLoading: Whether the initial query is loading
 *   - isError: Whether the query encountered an error
 *   - error: The error object if any
 *   - addItem: Mutation to add item(s) to the tab
 *   - closeTab: Mutation to request tab closure
 *   - tabTotal: Computed total amount of the tab
 *   - itemCount: Total number of items on the tab
 *   - refetch: Manual refetch trigger
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ApiService from '@/shared/services/api';
import { queryKeys, invalidateQueries } from '@/shared/config/react-query';
import { useWebSocket } from '@/shared/hooks/useWebSocket';

// ============================================
// TYPES
// ============================================

export interface TabItem {
  id: string;
  tab_id: string;
  menu_item_id: string;
  ordered_by_user_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  discount_reason: string | null;
  total_price: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  customizations: Record<string, any> | null;
  special_instructions: string | null;
  is_round_repeat: boolean;
  prepared_by: string | null;
  prepared_at: string | null;
  created_at: string;
  updated_at: string;
  menu_item?: {
    id: string;
    name: string;
    price: number;
    category?: string;
    image_url?: string | null;
  };
  ordered_by?: {
    id: string;
    name: string;
  };
}

export interface TabMember {
  id: string;
  user_id: string;
  tab_id: string;
  role: 'host' | 'member';
  status: 'active' | 'left' | 'removed';
  name?: string;
}

export interface Tab {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  host_user_id: string;
  status: 'open' | 'closing' | 'closed' | 'cancelled';
  type: 'individual' | 'group';
  preauth_amount: number | null;
  cover_charge_credit: number;
  deposit_credit: number;
  subtotal: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  amount_paid: number;
  invite_token: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  closed_at: string | null;
  updated_at: string;
  items: TabItem[];
  members: TabMember[];
  table?: {
    id: string;
    number: string;
    label?: string;
  };
  restaurant?: {
    id: string;
    name: string;
  };
}

export interface AddTabItemPayload {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  discount_reason?: string;
  customizations?: Record<string, any>;
  special_instructions?: string;
  is_round_repeat?: boolean;
}

export interface ProcessTabPaymentPayload {
  amount: number;
  tip_amount?: number;
  payment_method: string;
  transaction_id?: string;
  payment_details?: Record<string, any>;
  item_ids?: string[];
}

export interface AddRoundPayload {
  items: AddTabItemPayload[];
}

export interface PayTabPayload {
  payment_method: 'credit_card' | 'debit' | 'pix' | 'cash';
  amount: number;
  tip_amount?: number;
  split_count?: number;
  split_type?: 'full' | 'equal' | 'custom';
}

interface TabUpdateEvent {
  type: 'item_added' | 'member_joined' | 'member_left' | 'payment_made' | 'tab_closed';
  data: any;
  timestamp: string;
}

// ============================================
// HOOK
// ============================================

export function useTab(tabId: string) {
  const queryClient = useQueryClient();

  // --- TanStack Query: fetch tab details ---
  const {
    data: tab,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Tab>({
    queryKey: queryKeys.tabs.detail(tabId),
    queryFn: () => ApiService.get(`/tabs/${tabId}`),
    enabled: !!tabId,
    staleTime: 1000 * 30, // 30 seconds — WebSocket handles real-time
    refetchOnWindowFocus: true,
  });

  // --- WebSocket: real-time updates ---
  const { connected, emit, on, off } = useWebSocket('/tabs');

  // Join the tab room when connected
  useEffect(() => {
    if (connected && tabId) {
      emit('joinTab', tabId);
    }

    return () => {
      if (connected && tabId) {
        emit('leaveTab', tabId);
      }
    };
  }, [connected, tabId, emit]);

  // Listen for tab update events
  useEffect(() => {
    if (!connected) return;

    const handleTabUpdate = (event: TabUpdateEvent) => {
      // Invalidate cache to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.tabs.detail(tabId) });

      // For tab_closed, also invalidate the "my tabs" list
      if (event.type === 'tab_closed') {
        queryClient.invalidateQueries({ queryKey: queryKeys.tabs.my });
      }
    };

    on('tabUpdate', handleTabUpdate);

    return () => {
      off('tabUpdate', handleTabUpdate);
    };
  }, [connected, tabId, on, off, queryClient]);

  // --- Mutation: add item to tab ---
  const addItemMutation = useMutation({
    mutationFn: (items: AddTabItemPayload | AddTabItemPayload[]) => {
      const payload = Array.isArray(items) ? { items } : items;
      return ApiService.post(`/tabs/${tabId}/items`, payload);
    },
    onSuccess: () => {
      invalidateQueries.afterTabMutation(tabId);
    },
  });

  // --- Mutation: add round (batch of items) ---
  const addRoundMutation = useMutation({
    mutationFn: (payload: AddRoundPayload) => {
      return ApiService.post(`/tabs/${tabId}/rounds`, payload);
    },
    onSuccess: () => {
      invalidateQueries.afterTabMutation(tabId);
    },
  });

  // --- Mutation: close tab ---
  const closeTabMutation = useMutation({
    mutationFn: () => {
      return ApiService.post(`/tabs/${tabId}/close`);
    },
    onSuccess: () => {
      invalidateQueries.afterTabMutation(tabId);
    },
  });

  // --- Mutation: pay tab ---
  const payTabMutation = useMutation({
    mutationFn: (payload: PayTabPayload) => {
      return ApiService.post(`/tabs/${tabId}/pay`, payload);
    },
    onSuccess: () => {
      invalidateQueries.afterTabMutation(tabId);
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });

  // --- Mutation: process payment ---
  const processPaymentMutation = useMutation({
    mutationFn: (payload: ProcessTabPaymentPayload) => {
      return ApiService.post(`/tabs/${tabId}/payments`, payload);
    },
    onSuccess: () => {
      invalidateQueries.afterTabMutation(tabId);
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });

  // --- Computed values ---
  const tabTotal = useMemo(() => {
    if (!tab) return 0;
    return Number(tab.total_amount) || 0;
  }, [tab]);

  const itemCount = useMemo(() => {
    if (!tab?.items) return 0;
    return tab.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [tab]);

  // --- Wrapped mutation functions ---
  const addItem = useCallback(
    (items: AddTabItemPayload | AddTabItemPayload[]) => {
      return addItemMutation.mutateAsync(items);
    },
    [addItemMutation],
  );

  const addRound = useCallback(
    (items: AddTabItemPayload[]) => {
      return addRoundMutation.mutateAsync({ items });
    },
    [addRoundMutation],
  );

  const closeTab = useCallback(() => {
    return closeTabMutation.mutateAsync();
  }, [closeTabMutation]);

  const payTab = useCallback(
    (payload: PayTabPayload) => {
      return payTabMutation.mutateAsync(payload);
    },
    [payTabMutation],
  );

  const processPayment = useCallback(
    (payload: ProcessTabPaymentPayload) => {
      return processPaymentMutation.mutateAsync(payload);
    },
    [processPaymentMutation],
  );

  return {
    tab,
    isLoading,
    isError,
    error,
    addItem,
    addRound,
    closeTab,
    payTab,
    processPayment,
    tabTotal,
    itemCount,
    refetch,
    isAddingItem: addItemMutation.isPending,
    isAddingRound: addRoundMutation.isPending,
    isClosingTab: closeTabMutation.isPending,
    isPayingTab: payTabMutation.isPending,
    isProcessingPayment: processPaymentMutation.isPending,
    wsConnected: connected,
  };
}

/**
 * Hook to fetch user's open tabs
 */
export function useMyTabs() {
  return useQuery<Tab[]>({
    queryKey: queryKeys.tabs.my,
    queryFn: () => ApiService.get('/tabs/my'),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch split options for a tab
 */
export function useTabSplitOptions(tabId: string) {
  return useQuery({
    queryKey: queryKeys.tabs.splitOptions(tabId),
    queryFn: () => ApiService.get(`/tabs/${tabId}/split-options`),
    enabled: !!tabId,
  });
}
