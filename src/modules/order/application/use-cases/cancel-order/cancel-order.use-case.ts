import { Injectable } from "@nestjs/common";

import { RequestContextService } from "../../../../../shared/logger/request-context.service";
import { recordBusinessEvent } from "../../../../../shared/observability/business-events";
import { OrderEventPublisher } from "../../../infrastructure/messaging/order-event-publisher";
import { OrderStatusHistoryService } from "../_shared/order-status-history.service";

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
    private readonly requestCtx: RequestContextService,
  ) {}

  async execute(input: CancelOrderInput) {
    this.requestCtx.set("order_id", input.orderId);
    const order = await this.orderStatusHistoryService.transitionStatus({
      orderId: input.orderId,
      nextStatus: "CANCELLED",
      changedBy: input.changedBy ?? "api:user",
      reason: input.reason ?? "Cancelled by request",
    });

    await this.orderEventPublisher.publish({
      eventType: "OS_CANCELLED",
      routingKey: "order.cancelled",
      correlationId: input.orderId,
      payload: {
        orderId: input.orderId,
        reason: input.reason ?? "Cancelled by request",
        cancelledAt: new Date(),
      },
    });

    recordBusinessEvent("OrderCancelled", {
      orderId: input.orderId,
      changedBy: input.changedBy ?? "api:user",
      reason: (input.reason ?? "Cancelled by request").slice(0, 240),
    });

    return {
      id: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    };
  }
}
