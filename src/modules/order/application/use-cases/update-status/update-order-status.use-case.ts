import { Injectable } from '@nestjs/common';

import { recordBusinessEvent } from '../../../../../infrastructure/observability/new-relic.config';
import { OrderStatus } from '../../../domain/value-objects/order-status.vo';
import { OrderStatusHistoryService } from '../_shared/order-status-history.service';

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  changedBy?: string;
  reason?: string;
}

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderStatusHistoryService: OrderStatusHistoryService) {}

  async execute(input: UpdateOrderStatusInput) {
    const order = await this.orderStatusHistoryService.transitionStatus({
      orderId: input.orderId,
      nextStatus: input.status,
      changedBy: input.changedBy ?? 'api:user',
      reason: input.reason,
    });

    recordBusinessEvent('OrderStatusChanged', {
      orderId: order.id,
      toStatus: order.status,
      changedAt: order.updatedAt,
    });

    return {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    };
  }
}

