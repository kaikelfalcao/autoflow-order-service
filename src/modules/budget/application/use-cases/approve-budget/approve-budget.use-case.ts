import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RequestContextService } from "../../../../../shared/logger/request-context.service";
import { recordBusinessEvent } from "../../../../../shared/observability/business-events";
import { OrderStatusHistoryService } from "../../../../order/application/use-cases/_shared/order-status-history.service";
import { OrderEventPublisher } from "../../../../order/infrastructure/messaging/order-event-publisher";
import { BudgetOrmEntity } from "../../../infrastructure/persistence/budget.orm-entity";

@Injectable()
export class ApproveBudgetUseCase {
  constructor(
    @InjectRepository(BudgetOrmEntity)
    private readonly budgetRepository: Repository<BudgetOrmEntity>,
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
    private readonly orderEventPublisher: OrderEventPublisher,
    private readonly requestCtx: RequestContextService,
  ) {}

  async execute(orderId: string) {
    this.requestCtx.set("order_id", orderId);
    const budget = await this.budgetRepository.findOne({ where: { orderId } });
    if (!budget) {
      throw new NotFoundException("Budget not found");
    }

    budget.status = "APPROVED";
    budget.respondedAt = new Date();
    this.requestCtx.set(
      "budget_total_cents",
      Math.round(Number(budget.finalAmount) * 100),
    );
    await this.budgetRepository.save(budget);

    await this.orderStatusHistoryService.transitionStatus({
      orderId,
      nextStatus: "APPROVED",
      changedBy: "budget:customer",
      reason: "Budget approved",
    });

    const order = await this.orderStatusHistoryService.transitionStatus({
      orderId,
      nextStatus: "IN_EXECUTION",
      changedBy: "budget:system",
      reason: "Order moved to execution queue",
    });

    await this.orderEventPublisher.publish({
      eventType: "BUDGET_APPROVED",
      routingKey: "order.budget.approved",
      correlationId: orderId,
      payload: {
        orderId,
        totalAmount: Number(budget.finalAmount),
        approvedAt: budget.respondedAt,
      },
    });

    recordBusinessEvent("BudgetApproved", {
      orderId,
      totalAmount: Number(budget.finalAmount),
      finalAmount: Number(budget.finalAmount),
    });

    return {
      orderId,
      budgetStatus: budget.status,
      orderStatus: order.status,
      respondedAt: budget.respondedAt,
    };
  }
}
