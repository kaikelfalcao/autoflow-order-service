import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrderStatusHistoryService } from "../../application/use-cases/_shared/order-status-history.service";
import { AddOrderItemUseCase } from "../../application/use-cases/add-item/add-order-item.use-case";
import { CancelOrderUseCase } from "../../application/use-cases/cancel-order/cancel-order.use-case";
import { GetOrderHistoryUseCase } from "../../application/use-cases/get-order-history/get-order-history.use-case";
import { GetOrderUseCase } from "../../application/use-cases/get-order/get-order.use-case";
import { ListOrdersUseCase } from "../../application/use-cases/list-orders/list-orders.use-case";
import { OpenOrderUseCase } from "../../application/use-cases/open-order/open-order.use-case";
import { RemoveOrderItemUseCase } from "../../application/use-cases/remove-item/remove-order-item.use-case";
import { UpdateOrderStatusUseCase } from "../../application/use-cases/update-status/update-order-status.use-case";
import { PaymentEventConsumer } from "../../infrastructure/messaging/payment-event-consumer";
import { OrderSagaHandler } from "../../infrastructure/messaging/saga/order-saga.handler";
import { OrderItemOrmEntity } from "../../infrastructure/persistence/order-item.orm-entity";
import { OrderOrmEntity } from "../../infrastructure/persistence/order.orm-entity";
import { OrderStatusHistoryOrmEntity } from "../../infrastructure/persistence/order-status-history.orm-entity";
import { OrderController } from "./order.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderOrmEntity,
      OrderItemOrmEntity,
      OrderStatusHistoryOrmEntity,
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderStatusHistoryService,
    OpenOrderUseCase,
    UpdateOrderStatusUseCase,
    AddOrderItemUseCase,
    RemoveOrderItemUseCase,
    GetOrderUseCase,
    ListOrdersUseCase,
    GetOrderHistoryUseCase,
    CancelOrderUseCase,
    PaymentEventConsumer,
    OrderSagaHandler,
  ],
  exports: [OrderStatusHistoryService],
})
export class OrderModule {}
