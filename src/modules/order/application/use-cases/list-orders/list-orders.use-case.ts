import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { OrderOrmEntity } from "../../../infrastructure/persistence/order.orm-entity";
import { toOrderOutput } from "../_shared/order-output.mapper";

export interface ListOrdersInput {
  includeClosed?: boolean;
  status?: string;
}

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepository: Repository<OrderOrmEntity>,
  ) {}

  async execute(input: ListOrdersInput = {}) {
    const query = this.orderRepository.createQueryBuilder("orders");

    if (input.status) {
      query.where("orders.status = :status", { status: input.status });
    } else if (!input.includeClosed) {
      query.where("orders.status NOT IN (:...closedStatuses)", {
        closedStatuses: ["COMPLETED", "PAID", "DELIVERED"],
      });
    }

    query.orderBy(
      `CASE
         WHEN orders.status = 'IN_EXECUTION' THEN 1
         WHEN orders.status = 'AWAITING_APPROVAL' THEN 2
         WHEN orders.status = 'DIAGNOSIS' THEN 3
         WHEN orders.status = 'RECEIVED' THEN 4
         ELSE 5
       END`,
      "ASC",
    );

    query.addOrderBy("orders.created_at", "ASC");

    const orders = await query.getMany();

    return orders.map(toOrderOutput);
  }
}
