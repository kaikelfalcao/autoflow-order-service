import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdjustStockUseCase } from '../../application/use-cases/parts/adjust-stock.use-case';
import { CreatePartUseCase } from '../../application/use-cases/parts/create-part.use-case';
import { DeactivatePartUseCase } from '../../application/use-cases/parts/deactivate-part.use-case';
import { ListPartsUseCase } from '../../application/use-cases/parts/list-parts.use-case';
import { UpdatePartUseCase } from '../../application/use-cases/parts/update-part.use-case';
import { CreateServiceUseCase } from '../../application/use-cases/service/create-service.use-case';
import { DeactivateServiceUseCase } from '../../application/use-cases/service/deactivate-service.use-case';
import { ListServicesUseCase } from '../../application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/service/update-service.use-case';
import { PartsCatalogOrmEntity } from '../../infrastructure/persistence/parts-catalog.orm-entity';
import { ServiceCatalogOrmEntity } from '../../infrastructure/persistence/service-catalog.orm-entity';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCatalogOrmEntity, PartsCatalogOrmEntity])],
  controllers: [CatalogController],
  providers: [
    ListServicesUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
    DeactivateServiceUseCase,
    ListPartsUseCase,
    CreatePartUseCase,
    UpdatePartUseCase,
    DeactivatePartUseCase,
    AdjustStockUseCase,
  ],
})
export class CatalogModule {}

