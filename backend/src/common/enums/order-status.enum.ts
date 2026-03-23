export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OPEN_FOR_ADDITIONS = 'open_for_additions',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendente',
  [OrderStatus.CONFIRMED]: 'Confirmado',
  [OrderStatus.PREPARING]: 'Preparando',
  [OrderStatus.READY]: 'Pronto',
  [OrderStatus.DELIVERING]: 'Entregando',
  [OrderStatus.COMPLETED]: 'Concluído',
  [OrderStatus.CANCELLED]: 'Cancelado',
  [OrderStatus.OPEN_FOR_ADDITIONS]: 'Aberto para adições',
};
