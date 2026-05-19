import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import {
  BaseEvent,
  EventPublisherService,
} from "../../../../infrastructure/messaging/event-publisher.service";

@Injectable()
export class OrderEventPublisher {
  private readonly exchange = "order.events";

  constructor(private readonly eventPublisherService: EventPublisherService) {}

  async publish<TPayload>(params: {
    eventType:
      | "OS_CREATED"
      | "OS_STATUS_CHANGED"
      | "BUDGET_GENERATED"
      | "BUDGET_APPROVED"
      | "BUDGET_REJECTED"
      | "EXECUTION_COMPLETED"
      | "PAYMENT_REQUESTED"
      | "OS_CANCELLED";
    routingKey:
      | "order.created"
      | "order.status.changed"
      | "order.budget.generated"
      | "order.budget.approved"
      | "order.budget.rejected"
      | "order.execution.completed"
      | "order.payment.requested"
      | "order.cancelled";
    correlationId: string;
    payload: TPayload;
  }): Promise<void> {
    const event: BaseEvent<TPayload> = {
      eventId: randomUUID(),
      eventType: params.eventType,
      timestamp: new Date().toISOString(),
      source: "order-service",
      correlationId: params.correlationId,
      payload: params.payload,
    };

    await this.eventPublisherService.publish({
      exchange: this.exchange,
      routingKey: params.routingKey,
      event,
    });
  }
}
