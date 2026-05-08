import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderOrmEntity } from '../../../infrastructure/persistence/order.orm-entity';
import { toOrderItemOutput, toOrderOutput } from '../_shared/order-output.mapper';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
  ) {}

  async execute(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...toOrderOutput(order),
      items: (order.items ?? []).map(toOrderItemOutput),
    };
  }
}

