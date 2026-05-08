import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { CustomerServiceClient } from '../../../../../infrastructure/http-client/customer-service.client';
import { recordBusinessEvent } from '../../../../../infrastructure/observability/new-relic.config';
import { OrderEventPublisher } from '../../../infrastructure/messaging/order-event-publisher';
import { OrderOrmEntity } from '../../../infrastructure/persistence/order.orm-entity';

export interface OpenOrderInput {
  customerCpf: string;
  customerName: string;
  customerPhone: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  branchId?: string;
  notes?: string;
}

@Injectable()
export class OpenOrderUseCase {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    private readonly customerServiceClient: CustomerServiceClient,
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async execute(input: OpenOrderInput) {
    if (this.customerServiceClient.isEnabled()) {
      await this.customerServiceClient.getCustomerProfile(input.customerCpf);
    }

    const order = this.orderRepository.create({
      id: randomUUID(),
      customerCpf: input.customerCpf,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      vehiclePlate: input.vehiclePlate,
      vehicleBrand: input.vehicleBrand,
      vehicleModel: input.vehicleModel,
      vehicleYear: input.vehicleYear,
      branchId: input.branchId ?? null,
      status: 'RECEIVED',
      totalAmount: '0.00',
      notes: input.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.orderRepository.save(order);

    await this.orderEventPublisher.publish({
      eventType: 'OS_CREATED',
      routingKey: 'order.created',
      correlationId: saved.id,
      payload: {
        orderId: saved.id,
        customerCpf: saved.customerCpf,
        customerName: saved.customerName,
        customerPhone: saved.customerPhone,
        vehiclePlate: saved.vehiclePlate,
        vehicleModel: saved.vehicleModel,
        items: [],
        branchId: saved.branchId,
        createdAt: saved.createdAt,
      },
    });

    recordBusinessEvent('OrderCreated', {
      orderId: saved.id,
      customerCpf: saved.customerCpf,
      branchId: saved.branchId,
    });

    return {
      id: saved.id,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }
}

