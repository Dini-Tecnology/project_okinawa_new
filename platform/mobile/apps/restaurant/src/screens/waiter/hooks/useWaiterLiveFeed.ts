/**
 * useWaiterLiveFeed — WebSocket-driven live feed hook
 *
 * Connects to Socket.IO namespaces /orders and /tabs,
 * maps incoming events to LiveFeedEvent items, and exposes
 * feed state + dismiss action.
 *
 * @module waiter/hooks/useWaiterLiveFeed
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../../../services/socket';
import type {
  LiveFeedEvent,
  LiveEventType,
  UrgencyLevel,
} from '../types/waiter.types';

interface UseWaiterLiveFeedOptions {
  restaurantId?: string;
}

interface UseWaiterLiveFeedReturn {
  feedEvents: LiveFeedEvent[];
  activeFeed: LiveFeedEvent[];
  urgentCount: number;
  readyDishCount: number;
  dismissEvent: (eventId: string) => void;
  isConnected: boolean;
  reconnecting: boolean;
}

export function useWaiterLiveFeed(
  options: UseWaiterLiveFeedOptions = {},
): UseWaiterLiveFeedReturn {
  const { restaurantId } = options;

  // Start with an empty array — real events arrive via WebSocket
  const [feedEvents, setFeedEvents] = useState<LiveFeedEvent[]>([]);
  const [handledIds, setHandledIds] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const eventIdCounterRef = useRef(100);

  const addFeedEvent = useCallback(
    (partial: {
      type: LiveEventType;
      urgency: UrgencyLevel;
      table: number;
      event: string;
      detail: string;
    }) => {
      const id = `ws-${Date.now()}-${eventIdCounterRef.current++}`;
      const newEvent: LiveFeedEvent = {
        id,
        time: 'agora',
        table: partial.table,
        event: partial.event,
        detail: partial.detail,
        type: partial.type,
        urgency: partial.urgency,
        handled: false,
        timestamp: Date.now(),
      };
      // Keep at most 50 events in memory
      setFeedEvents((prev) => [newEvent, ...prev].slice(0, 50));
    },
    [],
  );

  // Connect to WebSocket and listen for events
  useEffect(() => {
    const setupSocket = async () => {
      try {
        await socketService.connect();
        setIsConnected(socketService.isConnected);
        setReconnecting(false);

        if (restaurantId) {
          socketService.joinRestaurantRoom(restaurantId);
        }
      } catch (error) {
        console.warn('WebSocket connection failed:', error);
        setIsConnected(false);
        setReconnecting(true);
      }
    };

    setupSocket();

    // Listen for new order events
    const unsubOrderNew = socketService.on('order:new', (data: any) => {
      addFeedEvent({
        type: 'order',
        urgency: 'info',
        table: data.table_number || data.table_id || 0,
        event: 'Novo pedido registrado',
        detail: `${data.items?.length || 0} item(s) via ${data.order_type || 'app'}`,
      });
    });

    // Listen for order status updates (e.g. ready from kitchen)
    const unsubOrderUpdate = socketService.on('order:update', (data: any) => {
      if (data.status === 'ready') {
        addFeedEvent({
          type: 'kitchen_ready',
          urgency: 'critical',
          table: data.table_number || data.table_id || 0,
          event: 'Prato pronto para retirar',
          detail: `Pedido #${data.order_id?.slice(0, 8) || '---'} pronto na cozinha`,
        });
      }
    });

    // Listen for waiter call notifications
    const unsubNotification = socketService.on('notification', (data: any) => {
      if (data.type === 'waiter_call') {
        addFeedEvent({
          type: 'call',
          urgency: 'high',
          table: data.data?.table_number || 0,
          event: 'Cliente chamou o garcom',
          detail: data.message || 'Cliente solicitou atendimento',
        });
      }
    });

    return () => {
      if (restaurantId) {
        socketService.leaveRestaurantRoom(restaurantId);
      }
      unsubOrderNew?.();
      unsubOrderUpdate?.();
      unsubNotification?.();
    };
  }, [restaurantId, addFeedEvent]);

  const dismissEvent = useCallback((eventId: string) => {
    setHandledIds((prev) => new Set([...prev, eventId]));
  }, []);

  const activeFeed = feedEvents
    .filter((e) => !handledIds.has(e.id))
    .sort((a, b) => b.timestamp - a.timestamp);

  const urgentCount = activeFeed.filter((e) => e.urgency !== 'info').length;

  const readyDishCount = activeFeed.filter(
    (e) => e.type === 'kitchen_ready',
  ).length;

  return {
    feedEvents,
    activeFeed,
    urgentCount,
    readyDishCount,
    dismissEvent,
    isConnected,
    reconnecting,
  };
}
