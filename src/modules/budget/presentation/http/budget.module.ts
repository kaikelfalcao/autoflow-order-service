import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderModule } from '../../../order/presentation/http/order.module';
import { OrderItemOrmEntity } from '../../../order/infrastructure/persistence/order-item.orm-entity';
import { OrderOrmEntity } from '../../../order/infrastructure/persistence/order.orm-entity';
import { ApproveBudgetUseCase } from '../../application/use-cases/approve-budget/approve-budget.use-case';
import { GenerateBudgetUseCase } from '../../application/use-cases/generate-budget/generate-budget.use-case';
import { GetBudgetUseCase } from '../../application/use-cases/get-budget/get-budget.use-case';
import { RejectBudgetUseCase } from '../../application/use-cases/reject-budget/reject-budget.use-case';
import { BudgetOrmEntity } from '../../infrastructure/persistence/budget.orm-entity';
import { BudgetController } from './budget.controller';

@Module({
  imports: [
    OrderModule,
    TypeOrmModule.forFeature([BudgetOrmEntity, OrderOrmEntity, OrderItemOrmEntity]),
  ],
  controllers: [BudgetController],
  providers: [
    GenerateBudgetUseCase,
    GetBudgetUseCase,
    ApproveBudgetUseCase,
    RejectBudgetUseCase,
  ],
})
export class BudgetModule {}

