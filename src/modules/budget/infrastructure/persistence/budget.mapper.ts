import { BudgetOrmEntity } from "./budget.orm-entity";
// Ajuste para seu domínio real:
import { Budget } from "../../domain/budget.entity";

export class BudgetMapper {
  static toDomain(orm: BudgetOrmEntity): Budget {
    return Budget.restore({
      id: orm.id,
      orderId: orm.orderId,
      totalAmount: Number(orm.totalAmount),
      discount: Number(orm.discount),
      finalAmount: Number(orm.finalAmount),
      status: orm.status,
      sentAt: orm.sentAt,
      respondedAt: orm.respondedAt,
      validUntil: orm.validUntil,
    });
  }

  static toOrm(budget: Budget): BudgetOrmEntity {
    const data = budget.toPrimitives();
    const orm = new BudgetOrmEntity();

    orm.id = data.id;
    orm.orderId = data.orderId;
    orm.totalAmount = data.totalAmount.toFixed(2);
    orm.discount = data.discount.toFixed(2);
    orm.finalAmount = data.finalAmount.toFixed(2);
    orm.status = data.status;
    orm.sentAt = data.sentAt;
    orm.respondedAt = data.respondedAt;
    orm.validUntil = data.validUntil;

    return orm;
  }
}
