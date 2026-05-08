import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { ServiceCatalogOrmEntity } from '../../../infrastructure/persistence/service-catalog.orm-entity';

export interface CreateServiceInput {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  category: string;
  active?: boolean;
}

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @InjectRepository(ServiceCatalogOrmEntity)
    private readonly serviceCatalogRepository: Repository<ServiceCatalogOrmEntity>,
  ) {}

  async execute(input: CreateServiceInput) {
    const service = this.serviceCatalogRepository.create({
      id: input.id ?? randomUUID(),
      name: input.name,
      description: input.description,
      basePrice: input.basePrice.toFixed(2),
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      category: input.category,
      active: input.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.serviceCatalogRepository.save(service);

    return {
      id: saved.id,
      name: saved.name,
      active: saved.active,
    };
  }
}

