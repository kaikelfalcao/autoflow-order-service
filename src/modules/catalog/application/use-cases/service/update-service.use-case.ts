import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceCatalogOrmEntity } from '../../../infrastructure/persistence/service-catalog.orm-entity';

export interface UpdateServiceInput {
  id: string;
  name?: string;
  description?: string;
  basePrice?: number;
  estimatedDurationMinutes?: number;
  category?: string;
  active?: boolean;
}

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @InjectRepository(ServiceCatalogOrmEntity)
    private readonly serviceCatalogRepository: Repository<ServiceCatalogOrmEntity>,
  ) {}

  async execute(input: UpdateServiceInput) {
    const service = await this.serviceCatalogRepository.findOne({ where: { id: input.id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (input.name !== undefined) service.name = input.name;
    if (input.description !== undefined) service.description = input.description;
    if (input.basePrice !== undefined) service.basePrice = input.basePrice.toFixed(2);
    if (input.estimatedDurationMinutes !== undefined) {
      service.estimatedDurationMinutes = input.estimatedDurationMinutes;
    }
    if (input.category !== undefined) service.category = input.category;
    if (input.active !== undefined) service.active = input.active;

    service.updatedAt = new Date();

    const saved = await this.serviceCatalogRepository.save(service);

    return {
      id: saved.id,
      name: saved.name,
      active: saved.active,
      updatedAt: saved.updatedAt,
    };
  }
}

