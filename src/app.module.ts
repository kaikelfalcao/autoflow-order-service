import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HealthModule } from "./health/health.module";
import envConfig from "./infrastructure/config/env.config";
import { HttpClientModule } from "./infrastructure/http-client/http-client.module";
import { RabbitMqModule } from "./infrastructure/messaging/rabbitmq.module";
import { ObservabilityModule } from "./infrastructure/observability/observability.module";
import { LoggerModule } from "./shared/logger/logger.module";
import { CorrelationIdMiddleware } from "./shared/middlewares/correlation-id.middleware";
import { BudgetOrmEntity } from "./modules/budget/infrastructure/persistence/budget.orm-entity";
import { BudgetModule } from "./modules/budget/presentation/http/budget.module";
import { ExecutionModule } from "./modules/execution/presentation/http/execution.module";
import { CustomerTypeormEntity } from "./modules/customers/infrastructure/persistence/customer.orm-entity";
import { VehicleTypeormEntity } from "./modules/vehicles/infrastructure/persistence/vehicle.orm-entity";
import { CustomersModule } from "./modules/customers/presentation/http/customers.module";
import { VehiclesModule } from "./modules/vehicles/presentation/http/vehicles.module";
import { OrderItemOrmEntity } from "./modules/order/infrastructure/persistence/order-item.orm-entity";
import { OrderOrmEntity } from "./modules/order/infrastructure/persistence/order.orm-entity";
import { OrderStatusHistoryOrmEntity } from "./modules/order/infrastructure/persistence/order-status-history.orm-entity";
import { OrderModule } from "./modules/order/presentation/http/order.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    LoggerModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres" as const,
        host: configService.get<string>("database.host"),
        port: configService.get<number>("database.port", 5432),
        username: configService.get<string>("database.user"),
        password: configService.get<string>("database.password"),
        database: configService.get<string>("database.name"),
        entities: [
          BudgetOrmEntity,
          CustomerTypeormEntity,
          VehicleTypeormEntity,
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
    ExecutionModule,
    CustomersModule,
    VehiclesModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
