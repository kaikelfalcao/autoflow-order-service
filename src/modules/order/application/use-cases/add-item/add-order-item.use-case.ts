import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { OrderItemOrmEntity } from '../../../infrastructure/persistence/order-item.orm-entity';
import { OrderOrmEntity } from '../../../infrastructure/persistence/order.orm-entity';

export interface AddOrderItemInput {
  orderId: string;
  itemType: 'SERVICE' | 'PART';
  catalogItemId: string;
  name: string;
  unitPrice: number;
  quantity?: number;
}

@Injectable()
export class AddOrderItemUseCase {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepository: Repository<OrderItemOrmEntity>,
  ) {}

  async execute(input: AddOrderItemInput) {
    const order = await this.orderRepository.findOne({ where: { id: input.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const quantity = input.quantity ?? 1;
    const subtotal = input.unitPrice * quantity;

    const item = this.orderItemRepository.create({
      id: randomUUID(),
      orderId: order.id,
      itemType: input.itemType,
      catalogItemId: input.catalogItemId,
      name: input.name,
      unitPrice: input.unitPrice.toFixed(2),
      quantity,
      subtotal: subtotal.toFixed(2),
      createdAt: new Date(),
    });

    await this.orderItemRepository.save(item);

    const items = await this.orderItemRepository.find({ where: { orderId: order.id } });
    const totalAmount = items.reduce((sum, currentItem) => sum + Number(currentItem.subtotal), 0);

    order.totalAmount = totalAmount.toFixed(2);
    order.updatedAt = new Date();
    await this.orderRepository.save(order);

    return {
      itemId: item.id,
      orderId: order.id,
      totalAmount,
    };
  }
}

