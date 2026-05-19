import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { Repository } from "typeorm";

import {
  canTransitionStatus,
  OrderStatus,
} from "../../../domain/value-objects/order-status.vo";
import { OrderEventPublisher } from "../../../infrastructure/messaging/order-event-publisher";
import { OrderOrmEntity } from "../../../infrastructure/persistence/order.orm-entity";
import { OrderStatusHistoryOrmEntity } from "../../../infrastructure/persistence/order-status-history.orm-entity";

@Injectable()
export class OrderStatusHistoryService {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderStatusHistoryOrmEntity)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistoryOrmEntity>,
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async transitionStatus(params: {
    orderId: string;
    nextStatus: OrderStatus;
    changedBy: string;
    reason?: string | null;
  }): Promise<OrderOrmEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: params.orderId },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (!canTransitionStatus(order.status as OrderStatus, params.nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition: ${order.status} -> ${params.nextStatus}`,
      );
    }

    const previousStatus = order.status;
    order.status = params.nextStatus;
    order.updatedAt = new Date();

    await this.orderRepository.save(order);

    const history = this.orderStatusHistoryRepository.create({
      id: randomUUID(),
      orderId: order.id,
      fromStatus: previousStatus,
      toStatus: params.nextStatus,
      changedBy: params.changedBy,
      reason: params.reason ?? null,
      createdAt: new Date(),
    });

    await this.orderStatusHistoryRepository.save(history);

    await this.orderEventPublisher.publish({
      eventType: "OS_STATUS_CHANGED",
      routingKey: "order.status.changed",
      correlationId: order.id,
      payload: {
        orderId: order.id,
        customerCpf: order.customerCpf,
        previousStatus,
        newStatus: order.status,
        changedAt: order.updatedAt,
      },
    });

    return order;
  }
}
