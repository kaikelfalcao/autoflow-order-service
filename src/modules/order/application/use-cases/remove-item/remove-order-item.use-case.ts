import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { OrderItemOrmEntity } from "../../../infrastructure/persistence/order-item.orm-entity";
import { OrderOrmEntity } from "../../../infrastructure/persistence/order.orm-entity";

@Injectable()
export class RemoveOrderItemUseCase {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepository: Repository<OrderItemOrmEntity>,
  ) {}

  async execute(orderId: string, itemId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const item = await this.orderItemRepository.findOne({
      where: { id: itemId, orderId },
    });
    if (!item) {
      throw new NotFoundException("Order item not found");
    }

    await this.orderItemRepository.delete({ id: item.id });

    const items = await this.orderItemRepository.find({
      where: { orderId: order.id },
    });
    const totalAmount = items.reduce(
      (sum, currentItem) => sum + Number(currentItem.subtotal),
      0,
    );

    order.totalAmount = totalAmount.toFixed(2);
    order.updatedAt = new Date();
    await this.orderRepository.save(order);

    return {
      orderId,
      itemId,
      totalAmount,
    };
  }
}
