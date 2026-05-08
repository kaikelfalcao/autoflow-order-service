import { Injectable } from '@nestjs/common';

import { OrderStatus } from '../../../../order/domain/value-objects/order-status.vo';
import { OrderStatusHistoryService } from '../../../../order/application/use-cases/_shared/order-status-history.service';

export interface UpdateExecutionStageInput {
  orderId: string;
  stage: OrderStatus;
  notes?: string;
}

@Injectable()
export class UpdateExecutionStageUseCase {
  constructor(private readonly orderStatusHistoryService: OrderStatusHistoryService) {}

  async execute(input: UpdateExecutionStageInput) {
    const order = await this.orderStatusHistoryService.transitionStatus({
      orderId: input.orderId,
      nextStatus: input.stage,
      changedBy: 'execution:mechanic',
      reason: input.notes,
    });

    return {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    };
  }
}

