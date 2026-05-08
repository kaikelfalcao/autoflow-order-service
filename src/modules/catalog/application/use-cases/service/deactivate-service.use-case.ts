import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceCatalogOrmEntity } from '../../../infrastructure/persistence/service-catalog.orm-entity';

@Injectable()
export class DeactivateServiceUseCase {
  constructor(
    @InjectRepository(ServiceCatalogOrmEntity)
    private readonly serviceCatalogRepository: Repository<ServiceCatalogOrmEntity>,
  ) {}

  async execute(id: string) {
    const service = await this.serviceCatalogRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.active = false;
    service.updatedAt = new Date();
    await this.serviceCatalogRepository.save(service);

    return {
      id: service.id,
      active: service.active,
    };
  }
}

