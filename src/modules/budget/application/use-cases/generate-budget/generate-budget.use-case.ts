import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { Repository } from "typeorm";

import { BudgetOrmEntity } from "../../../infrastructure/persistence/budget.orm-entity";
import { OrderItemOrmEntity } from "../../../../order/infrastructure/persistence/order-item.orm-entity";
import { OrderEventPublisher } from "../../../../order/infrastructure/messaging/order-event-publisher";
import { OrderOrmEntity } from "../../../../order/infrastructure/persistence/order.orm-entity";
import { OrderStatusHistoryService } from "../../../../order/application/use-cases/_shared/order-status-history.service";

export interface GenerateBudgetInput {
  orderId: string;
  discount?: number;
  validDays?: number;
}

@Injectable()
export class GenerateBudgetUseCase {
  constructor(
    @InjectRepository(BudgetOrmEntity)
    private readonly budgetRepository: Repository<BudgetOrmEntity>,
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepository: Repository<OrderItemOrmEntity>,
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async execute(input: GenerateBudgetInput) {
    const order = await this.orderRepository.findOne({
      where: { id: input.orderId },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const items = await this.orderItemRepository.find({
      where: { orderId: input.orderId },
    });
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    const discount = input.discount ?? 0;
    const finalAmount = Math.max(0, totalAmount - discount);

    const existingBudget = await this.budgetRepository.findOne({
      where: { orderId: input.orderId },
    });

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (input.validDays ?? 7));

    const budget = this.budgetRepository.create({
      id: existingBudget?.id ?? randomUUID(),
      orderId: input.orderId,
      totalAmount: totalAmount.toFixed(2),
      discount: discount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      status: "PENDING",
      sentAt: existingBudget?.sentAt ?? new Date(),
      respondedAt: null,
      validUntil,
    });

    const saved = await this.budgetRepository.save(budget);

    order.totalAmount = totalAmount.toFixed(2);
    order.updatedAt = new Date();
    await this.orderRepository.save(order);

    if (order.status !== "AWAITING_APPROVAL") {
      await this.orderStatusHistoryService.transitionStatus({
        orderId: order.id,
        nextStatus: "AWAITING_APPROVAL",
        changedBy: "budget:system",
        reason: "Budget generated",
      });
    }

    await this.orderEventPublisher.publish({
      eventType: "BUDGET_GENERATED",
      routingKey: "order.budget.generated",
      correlationId: order.id,
      payload: {
        orderId: order.id,
        customerCpf: order.customerCpf,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        items: items.map((item) => ({
          catalogItemId: item.catalogItemId,
          itemType: item.itemType,
          name: item.name,
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
        })),
        totalAmount,
        validUntil,
      },
    });

    return {
      id: saved.id,
      orderId: saved.orderId,
      totalAmount: Number(saved.totalAmount),
      discount: Number(saved.discount),
      finalAmount: Number(saved.finalAmount),
      status: saved.status,
      sentAt: saved.sentAt,
      respondedAt: saved.respondedAt,
      validUntil: saved.validUntil,
    };
  }
}
