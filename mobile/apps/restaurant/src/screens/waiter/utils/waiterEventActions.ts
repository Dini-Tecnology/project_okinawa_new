/**
 * Waiter Event Actions — API Action Handlers
 *
 * Action handlers for each of the 6 situational event types in the
 * Waiter Command Center live feed. Each handler calls the appropriate
 * backend API endpoint to resolve/process the event.
 *
 * These handlers are meant to be consumed by the WaiterCommandCenter
 * and WaiterActionsScreen (being built in parallel by another agent).
 *
 * @module waiter/utils/waiterEventActions
 */

import ApiService from '@/shared/services/api';
import type { SituationalEventType } from './eventHelpers';

// ============================================
// TYPES
// ============================================

export interface ResolveEventPayload {
  resolvedAction: string;
}

export interface CourtesyApprovalPayload {
  type: 'courtesy';
  tableNumber: number;
  relatedEventId: string;
  requestedBy: string;
}

export interface TableTransferPayload {
  toTableId: string;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export type NavigationFn = (screen: string, params?: Record<string, unknown>) => void;

// ============================================
// KITCHEN READY — Pickup from kitchen
// ============================================

/**
 * Handles a kitchen_ready event: marks the order as 'served'
 * indicating the waiter has picked up the dish from the kitchen.
 *
 * API: PATCH /orders/:id/status { status: 'served' }
 *
 * @param orderId - The order ID to update
 * @returns ActionResult with success status
 */
export async function handleKitchenReady(orderId: string): Promise<ActionResult> {
  try {
    await ApiService.updateOrderStatus(orderId, 'served');
    return { success: true, message: 'Order marked as served' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order status';
    return { success: false, error: message };
  }
}

// ============================================
// BAR READY — Pickup from bar
// ============================================

/**
 * Handles a bar_ready event: marks the drink order as 'served'
 * indicating the waiter has picked up the drinks from the bar.
 *
 * API: PATCH /orders/:id/status { status: 'served' }
 *
 * @param orderId - The order ID to update
 * @returns ActionResult with success status
 */
export async function handleBarReady(orderId: string): Promise<ActionResult> {
  try {
    await ApiService.updateOrderStatus(orderId, 'served');
    return { success: true, message: 'Drink order marked as served' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update drink order status';
    return { success: false, error: message };
  }
}

// ============================================
// PAYMENT NEEDED — Navigate to charge flow
// ============================================

/**
 * Handles a payment_needed event: navigates the waiter to the
 * charge flow for the specific tab/guest that needs manual billing.
 *
 * This does not call a backend API directly; instead it triggers
 * navigation to the payment screen within WaiterCommandCenter.
 *
 * @param tabId - The tab/table ID
 * @param guestId - The guest ID that needs billing
 * @param navigate - Navigation function to redirect to charge flow
 * @returns ActionResult with success status
 */
export async function handlePaymentNeeded(
  tabId: string,
  guestId: string,
  navigate?: NavigationFn,
): Promise<ActionResult> {
  try {
    if (navigate) {
      navigate('ChargeFlow', { tabId, guestId });
    }
    return { success: true, message: 'Navigated to charge flow' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to navigate to charge flow';
    return { success: false, error: message };
  }
}

// ============================================
// CUSTOMER CALL — Acknowledge call
// ============================================

/**
 * Handles a customer_call event: acknowledges the waiter call
 * so other staff know this call is being attended.
 *
 * API: PATCH /orders/waiter-calls/:id/acknowledge
 *
 * @param callId - The waiter call ID to acknowledge
 * @returns ActionResult with success status
 */
export async function handleCustomerCall(callId: string): Promise<ActionResult> {
  try {
    await ApiService.patch(`/orders/waiter-calls/${callId}/acknowledge`);
    return { success: true, message: 'Call acknowledged' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to acknowledge call';
    return { success: false, error: message };
  }
}

// ============================================
// COURTESY REQUEST — Create approval
// ============================================

/**
 * Handles a courtesy_request event: creates a pending approval
 * request for the manager to approve or deny the courtesy.
 *
 * API: POST /approvals { type: 'courtesy', ... }
 *
 * @param tabId - The table/tab ID
 * @param guestId - The guest ID receiving the courtesy
 * @param eventId - The related event ID for tracking
 * @param requestedBy - Name of the waiter requesting
 * @param tableNumber - Table number for display
 * @returns ActionResult with success status
 */
export async function handleCourtesyRequest(
  tabId: string,
  guestId: string,
  eventId?: string,
  requestedBy?: string,
  tableNumber?: number,
): Promise<ActionResult> {
  try {
    await ApiService.post('/approvals', {
      type: 'courtesy',
      tabId,
      guestId,
      relatedEventId: eventId,
      requestedBy: requestedBy || 'Waiter',
      tableNumber: tableNumber || 0,
    });
    return { success: true, message: 'Courtesy approval requested' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create courtesy request';
    return { success: false, error: message };
  }
}

// ============================================
// TABLE TRANSFER — Transfer table
// ============================================

/**
 * Handles a table_transfer event: transfers guests from one table
 * to another.
 *
 * API: PATCH /tables/:id/transfer { toTableId }
 *
 * @param tableId - The source table ID
 * @param toTableId - The destination table ID
 * @returns ActionResult with success status
 */
export async function handleTableTransfer(
  tableId: string,
  toTableId: string,
): Promise<ActionResult> {
  try {
    await ApiService.patch(`/tables/${tableId}/transfer`, { toTableId });
    return { success: true, message: 'Table transferred successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to transfer table';
    return { success: false, error: message };
  }
}

// ============================================
// RESOLVE EVENT — Generic resolution
// ============================================

/**
 * Resolves a situational feed event by calling the resolution endpoint.
 *
 * API: PATCH /orders/waiter/situational-feed/:eventId/resolve
 *
 * @param eventId - The event ID to resolve
 * @param resolvedAction - Description of the action taken
 * @returns ActionResult with success status
 */
export async function resolveWaiterEvent(
  eventId: string,
  resolvedAction: string,
): Promise<ActionResult> {
  try {
    await ApiService.patch(
      `/orders/waiter/situational-feed/${eventId}/resolve`,
      { resolvedAction },
    );
    return { success: true, message: 'Event resolved' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resolve event';
    return { success: false, error: message };
  }
}

// ============================================
// DISPATCHER — Route event to correct handler
// ============================================

/**
 * Dispatches an event to the correct handler based on its type.
 * Convenience function for routing events from the live feed.
 *
 * @param eventType - The situational event type
 * @param params - Parameters specific to the event type
 * @param navigate - Optional navigation function
 * @returns ActionResult with success status
 */
export async function dispatchEventAction(
  eventType: SituationalEventType,
  params: Record<string, string>,
  navigate?: NavigationFn,
): Promise<ActionResult> {
  switch (eventType) {
    case 'kitchen_ready':
      return handleKitchenReady(params.orderId);

    case 'bar_ready':
      return handleBarReady(params.orderId);

    case 'payment_needed':
      return handlePaymentNeeded(params.tabId, params.guestId, navigate);

    case 'customer_call':
      return handleCustomerCall(params.callId);

    case 'courtesy_request':
      return handleCourtesyRequest(
        params.tabId,
        params.guestId,
        params.eventId,
        params.requestedBy,
        params.tableNumber ? parseInt(params.tableNumber, 10) : undefined,
      );

    case 'table_transfer':
      return handleTableTransfer(params.tableId, params.toTableId);

    default:
      return { success: false, error: `Unknown event type: ${eventType}` };
  }
}
