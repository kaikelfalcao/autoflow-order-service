import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { OrderOrmEntity } from "../../../../order/infrastructure/persistence/order.orm-entity";
import { toOrderOutput } from "../../../../order/application/use-cases/_shared/order-output.mapper";

@Injectable()
export class GetExecutionQueueUseCase {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
  ) {}

  async execute() {
    const orders = await this.orderRepository
      .createQueryBuilder("orders")
      .where("orders.status IN (:...statuses)", {
        statuses: [
          "IN_EXECUTION",
          "AWAITING_APPROVAL",
          "DIAGNOSIS",
          "RECEIVED",
        ],
      })
      .orderBy(
        `CASE
           WHEN orders.status = 'IN_EXECUTION' THEN 1
           WHEN orders.status = 'AWAITING_APPROVAL' THEN 2
           WHEN orders.status = 'DIAGNOSIS' THEN 3
           WHEN orders.status = 'RECEIVED' THEN 4
           ELSE 5
         END`,
        "ASC",
      )
      .addOrderBy("orders.created_at", "ASC")
      .getMany();

    return orders.map(toOrderOutput);
  }
}
