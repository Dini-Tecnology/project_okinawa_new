import { Injectable } from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { OrderStatus } from '@common/enums';

@Injectable()
export class OrderCalculatorHelper {
  /**
   * Calculate order priority based on wait time
   */
  calculatePriority(order: Order): 'normal' | 'high' | 'urgent' {
    const minutesWaiting = Math.floor(
      (Date.now() - new Date(order.created_at).getTime()) / 60000,
    );

    if (minutesWaiting > 30) return 'urgent';
    if (minutesWaiting > 15) return 'high';
    return 'normal';
  }

  /**
   * Calculate order totals
   */
  calculateTotals(
    subtotal: number,
    tipAmount: number = 0,
    taxRate: number = 0.1,
  ): { taxAmount: number; totalAmount: number } {
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount + tipAmount;
    return { taxAmount, totalAmount };
  }

  /**
   * Get status message for notifications
   */
  getStatusMessage(status: OrderStatus): string {
    const messages: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Your order has been received',
      [OrderStatus.CONFIRMED]: 'Your order has been confirmed',
      [OrderStatus.PREPARING]: 'Your order is being prepared',
      [OrderStatus.READY]: 'Your order is ready!',
      [OrderStatus.DELIVERING]: 'Your order is on the way!',
      [OrderStatus.COMPLETED]: 'Order completed. Thank you!',
      [OrderStatus.CANCELLED]: 'Order has been cancelled',
      [OrderStatus.OPEN_FOR_ADDITIONS]: 'Order is open for additions',
    };
    return messages[status] || 'Order status updated';
  }

  /**
   * Check if status is active (not completed/cancelled)
   */
  isActiveStatus(status: OrderStatus): boolean {
    return [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
    ].includes(status);
  }

  /**
   * Get order number from ID
   */
  getOrderNumber(orderId: string): string {
    return `#${orderId.slice(0, 8)}`;
  }
}
