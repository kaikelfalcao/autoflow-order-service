import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehicleService } from '../../application/vehicle.service';
import { VehicleRepositoryImpl } from '../../infrastructure/persistence/vehicle.repository.impl';
import { VehicleTypeormEntity } from '../../infrastructure/persistence/vehicle.orm-entity';
import { CustomerTypeormEntity } from '../../../customers/infrastructure/persistence/customer.orm-entity';
import { VEHICLE_REPOSITORY } from '../../domain/ports/vehicle.repository';
import { CUSTOMER_REPOSITORY } from '../../../customers/domain/ports/customer.repository';
import { CustomerRepositoryImpl } from '../../../customers/infrastructure/persistence/customer.repository.impl';
import { ObservabilityModule } from '../../../../infrastructure/observability/observability.module';
import { OrderOrmEntity } from '../../../order/infrastructure/persistence/order.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VehicleTypeormEntity, CustomerTypeormEntity, OrderOrmEntity]),
    ObservabilityModule,
  ],
  controllers: [VehiclesController],
  providers: [
    VehicleService,
    { provide: VEHICLE_REPOSITORY, useClass: VehicleRepositoryImpl },
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerRepositoryImpl },
  ],
  exports: [VehicleService, VEHICLE_REPOSITORY],
})
export class VehiclesModule {}
