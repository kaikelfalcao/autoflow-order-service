import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { OrderOrmEntity } from "../../../infrastructure/persistence/order.orm-entity";
import { OrderStatusHistoryOrmEntity } from "../../../infrastructure/persistence/order-status-history.orm-entity";

@Injectable()
export class GetOrderHistoryUseCase {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderStatusHistoryOrmEntity)
    private readonly orderStatusHistoryRepository: Repository<OrderStatusHistoryOrmEntity>,
  ) {}

  async execute(orderId: string) {
    const orderExists = await this.orderRepository.exists({
      where: { id: orderId },
    });
    if (!orderExists) {
      throw new NotFoundException("Order not found");
    }

    const history = await this.orderStatusHistoryRepository.find({
      where: { orderId },
      order: { createdAt: "ASC" },
    });

    return history.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      fromStatus: item.fromStatus,
      toStatus: item.toStatus,
      changedBy: item.changedBy,
      reason: item.reason,
      createdAt: item.createdAt,
    }));
  }
}
