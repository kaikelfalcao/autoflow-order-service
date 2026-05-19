import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { recordSagaCompensation } from "../../../../../shared/observability/business-events";
import { OrderStatusHistoryService } from "../../../../order/application/use-cases/_shared/order-status-history.service";
import { OrderEventPublisher } from "../../../../order/infrastructure/messaging/order-event-publisher";
import { BudgetOrmEntity } from "../../../infrastructure/persistence/budget.orm-entity";

export interface RejectBudgetInput {
  orderId: string;
  reason?: string;
}

@Injectable()
export class RejectBudgetUseCase {
  constructor(
    @InjectRepository(BudgetOrmEntity)
    private readonly budgetRepository: Repository<BudgetOrmEntity>,
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async execute(input: RejectBudgetInput) {
    const budget = await this.budgetRepository.findOne({
      where: { orderId: input.orderId },
    });
    if (!budget) {
      throw new NotFoundException("Budget not found");
    }

    budget.status = "REJECTED";
    budget.respondedAt = new Date();
    await this.budgetRepository.save(budget);

    await this.orderStatusHistoryService.transitionStatus({
      orderId: input.orderId,
      nextStatus: "REJECTED",
      changedBy: "budget:customer",
      reason: input.reason ?? "Budget rejected",
    });

    const order = await this.orderStatusHistoryService.transitionStatus({
      orderId: input.orderId,
      nextStatus: "CANCELLED",
      changedBy: "budget:system",
      reason: input.reason ?? "Order cancelled after budget rejection",
    });

    await this.orderEventPublisher.publish({
      eventType: "BUDGET_REJECTED",
      routingKey: "order.budget.rejected",
      correlationId: input.orderId,
      payload: {
        orderId: input.orderId,
        reason: input.reason ?? "Budget rejected",
        rejectedAt: budget.respondedAt,
      },
    });

    recordSagaCompensation({
      orderId: input.orderId,
      reason: input.reason ?? "Budget rejected",
      step: "BUDGET_REJECTED",
    });

    await this.orderEventPublisher.publish({
      eventType: "OS_CANCELLED",
      routingKey: "order.cancelled",
      correlationId: input.orderId,
      payload: {
        orderId: input.orderId,
        reason: input.reason ?? "Order cancelled after budget rejection",
        cancelledAt: new Date(),
      },
    });

    return {
      orderId: input.orderId,
      budgetStatus: budget.status,
      orderStatus: order.status,
      respondedAt: budget.respondedAt,
    };
  }
}
