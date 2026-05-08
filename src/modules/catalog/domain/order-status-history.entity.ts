import type { OrderStatus } from '../../order/domain/value-objects/order-status.vo';

export interface OrderStatusHistoryProps {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string;
  reason: string | null;
  createdAt: Date;
}