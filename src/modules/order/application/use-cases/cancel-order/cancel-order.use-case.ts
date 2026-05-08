import { Injectable } from '@nestjs/common';

import { OrderEventPublisher } from '../../../infrastructure/messaging/order-event-publisher';
import { OrderStatusHistoryService } from '../_shared/order-status-history.service';

export interface CancelOrderInput {
  orderId: string;
  changedBy?: string;
  reason?: string;
}

@Injectable()
export class CancelOrderUseCase {
  constructor(
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async execute(input: CancelOrderInput) {
    const order = await this.orderStatusHistoryService.transitionStatus({
      orderId: input.orderId,
      nextStatus: 'CANCELLED',
      changedBy: input.changedBy ?? 'api:user',
      reason: input.reason ?? 'Cancelled by request',
    });

    await this.orderEventPublisher.publish({
      eventType: 'OS_CANCELLED',
      routingKey: 'order.cancelled',
      correlationId: input.orderId,
      payload: {
        orderId: input.orderId,
        reason: input.reason ?? 'Cancelled by request',
        cancelledAt: new Date(),
      },
    });

    return {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    };
  }
}

