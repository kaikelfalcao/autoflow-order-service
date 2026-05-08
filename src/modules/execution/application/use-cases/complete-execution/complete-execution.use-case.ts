import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { recordBusinessEvent } from '../../../../../infrastructure/observability/new-relic.config';
import { OrderStatusHistoryService } from '../../../../order/application/use-cases/_shared/order-status-history.service';
import { OrderEventPublisher } from '../../../../order/infrastructure/messaging/order-event-publisher';
import { OrderItemOrmEntity } from '../../../../order/infrastructure/persistence/order-item.orm-entity';
import { OrderOrmEntity } from '../../../../order/infrastructure/persistence/order.orm-entity';

@Injectable()
export class CompleteExecutionUseCase {
  constructor(
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
    @InjectRepository(OrderItemOrmEntity)
    private readonly orderItemRepository: Repository<OrderItemOrmEntity>,
    private readonly orderEventPublisher: OrderEventPublisher,
  ) {}

  async execute(orderId: string) {
    const completedOrder = await this.orderStatusHistoryService.transitionStatus({
      orderId,
      nextStatus: 'COMPLETED',
      changedBy: 'execution:mechanic',
      reason: 'Execution completed',
    });

    const awaitingPaymentOrder = await this.orderStatusHistoryService.transitionStatus({
      orderId,
      nextStatus: 'AWAITING_PAYMENT',
      changedBy: 'execution:system',
      reason: 'Payment requested',
    });

    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    const items = await this.orderItemRepository.find({ where: { orderId } });

    if (order) {
      const durationMs =
        awaitingPaymentOrder.updatedAt.getTime() - completedOrder.updatedAt.getTime();

      recordBusinessEvent('ExecutionCompleted', {
        orderId,
        durationMs,
      });

      await this.orderEventPublisher.publish({
        eventType: 'EXECUTION_COMPLETED',
        routingKey: 'order.execution.completed',
        correlationId: orderId,
        payload: {
          orderId,
          customerCpf: order.customerCpf,
          completedAt: new Date(),
        },
      });

      await this.orderEventPublisher.publish({
        eventType: 'PAYMENT_REQUESTED',
        routingKey: 'order.payment.requested',
        correlationId: orderId,
        payload: {
          orderId,
          customerCpf: order.customerCpf,
          customerName: order.customerName,
          customerEmail: null,
          totalAmount: Number(order.totalAmount),
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.subtotal),
          })),
        },
      });
    }

    return {
      id: completedOrder.id,
      previousStatus: completedOrder.status,
      status: awaitingPaymentOrder.status,
      updatedAt: awaitingPaymentOrder.updatedAt,
    };
  }
}

