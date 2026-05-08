import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import envConfig from './infrastructure/config/env.config';
import { HttpClientModule } from './infrastructure/http-client/http-client.module';
import { RabbitMqModule } from './infrastructure/messaging/rabbitmq.module';
import { ObservabilityModule } from './infrastructure/observability/observability.module';
import { BudgetOrmEntity } from './modules/budget/infrastructure/persistence/budget.orm-entity';
import { BudgetModule } from './modules/budget/presentation/http/budget.module';
import { PartsCatalogOrmEntity } from './modules/catalog/infrastructure/persistence/parts-catalog.orm-entity';
import { ServiceCatalogOrmEntity } from './modules/catalog/infrastructure/persistence/service-catalog.orm-entity';
import { CatalogModule } from './modules/catalog/presentation/http/catalog.module';
import { ExecutionModule } from './modules/execution/presentation/http/execution.module';
import { OrderItemOrmEntity } from './modules/order/infrastructure/persistence/order-item.orm-entity';
import { OrderOrmEntity } from './modules/order/infrastructure/persistence/order.orm-entity';
import { OrderStatusHistoryOrmEntity } from './modules/order/infrastructure/persistence/order-status-history.orm-entity';
import { OrderModule } from './modules/order/presentation/http/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [
          BudgetOrmEntity,
          PartsCatalogOrmEntity,
          ServiceCatalogOrmEntity,
          OrderItemOrmEntity,
          OrderOrmEntity,
          OrderStatusHistoryOrmEntity,
        ],
        synchronize: false,
      }),
    }),
    RabbitMqModule,
    HttpClientModule,
    ObservabilityModule,
    OrderModule,
    BudgetModule,
    CatalogModule,
    ExecutionModule,
  ],
})
export class AppModule {}

