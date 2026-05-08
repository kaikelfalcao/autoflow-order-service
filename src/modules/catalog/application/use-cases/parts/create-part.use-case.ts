import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { PartsCatalogOrmEntity } from '../../../infrastructure/persistence/parts-catalog.orm-entity';

export interface CreatePartInput {
  id?: string;
  name: string;
  description: string;
  unitPrice: number;
  stockQuantity?: number;
  minStock?: number;
  supplier?: string;
  active?: boolean;
}

@Injectable()
export class CreatePartUseCase {
  constructor(
    @InjectRepository(PartsCatalogOrmEntity)
    private readonly partsCatalogRepository: Repository<PartsCatalogOrmEntity>,
  ) {}

  async execute(input: CreatePartInput) {
    const part = this.partsCatalogRepository.create({
      id: input.id ?? randomUUID(),
      name: input.name,
      description: input.description,
      unitPrice: input.unitPrice.toFixed(2),
      stockQuantity: input.stockQuantity ?? 0,
      minStock: input.minStock ?? 0,
      supplier: input.supplier ?? null,
      active: input.active ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.partsCatalogRepository.save(part);

    return {
      id: saved.id,
      name: saved.name,
      active: saved.active,
    };
  }
}

