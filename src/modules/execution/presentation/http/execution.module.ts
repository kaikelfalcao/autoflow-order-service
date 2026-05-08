import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderModule } from '../../../order/presentation/http/order.module';
import { OrderItemOrmEntity } from '../../../order/infrastructure/persistence/order-item.orm-entity';
import { OrderOrmEntity } from '../../../order/infrastructure/persistence/order.orm-entity';
import { CompleteExecutionUseCase } from '../../application/use-cases/complete-execution/complete-execution.use-case';
import { GetExecutionQueueUseCase } from '../../application/use-cases/get-execution-queue/get-execution-queue.use-case';
import { UpdateExecutionStageUseCase } from '../../application/use-cases/update-execution-stage/update-execution-stage.use-case';
import { ExecutionController } from './execution.controller';

@Module({
  imports: [OrderModule, TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity])],
  controllers: [ExecutionController],
  providers: [
    GetExecutionQueueUseCase,
    UpdateExecutionStageUseCase,
    CompleteExecutionUseCase,
  ],
})
export class ExecutionModule {}

