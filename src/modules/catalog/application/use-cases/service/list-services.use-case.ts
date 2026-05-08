import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceCatalogOrmEntity } from '../../../infrastructure/persistence/service-catalog.orm-entity';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @InjectRepository(ServiceCatalogOrmEntity)
    private readonly serviceCatalogRepository: Repository<ServiceCatalogOrmEntity>,
  ) {}

  async execute(includeInactive = false) {
    const services = await this.serviceCatalogRepository.find({
      where: includeInactive ? {} : { active: true },
      order: { createdAt: 'DESC' },
    });

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      basePrice: Number(service.basePrice),
      estimatedDurationMinutes: service.estimatedDurationMinutes,
      category: service.category,
      active: service.active,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));
  }
}

