import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomerService } from '../../application/customer.service';
import { CustomerRepositoryImpl } from '../../infrastructure/persistence/customer.repository.impl';
import { CustomerTypeormEntity } from '../../infrastructure/persistence/customer.orm-entity';
import { VehicleTypeormEntity } from '../../../vehicles/infrastructure/persistence/vehicle.orm-entity';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/customer.repository';
import { ObservabilityModule } from '../../../../infrastructure/observability/observability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerTypeormEntity, VehicleTypeormEntity]),
    ObservabilityModule,
  ],
  controllers: [CustomersController],
  providers: [
    CustomerService,
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerRepositoryImpl },
  ],
  exports: [CustomerService],
})
export class CustomersModule {}
