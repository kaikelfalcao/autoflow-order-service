import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BudgetOrmEntity } from "../../../infrastructure/persistence/budget.orm-entity";

@Injectable()
export class GetBudgetUseCase {
  constructor(
    @InjectRepository(BudgetOrmEntity)
    private readonly budgetRepository: Repository<BudgetOrmEntity>,
  ) {}

  async execute(orderId: string) {
    const budget = await this.budgetRepository.findOne({ where: { orderId } });
    if (!budget) {
      throw new NotFoundException("Budget not found");
    }

    return {
      id: budget.id,
      orderId: budget.orderId,
      totalAmount: Number(budget.totalAmount),
      discount: Number(budget.discount),
      finalAmount: Number(budget.finalAmount),
      status: budget.status,
      sentAt: budget.sentAt,
      respondedAt: budget.respondedAt,
      validUntil: budget.validUntil,
    };
  }
}
