import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PartsCatalogOrmEntity } from '../../../infrastructure/persistence/parts-catalog.orm-entity';

export interface UpdatePartInput {
  id: string;
  name?: string;
  description?: string;
  unitPrice?: number;
  minStock?: number;
  supplier?: string;
  active?: boolean;
}

@Injectable()
export class UpdatePartUseCase {
  constructor(
    @InjectRepository(PartsCatalogOrmEntity)
    private readonly partsCatalogRepository: Repository<PartsCatalogOrmEntity>,
  ) {}

  async execute(input: UpdatePartInput) {
    const part = await this.partsCatalogRepository.findOne({ where: { id: input.id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    if (input.name !== undefined) part.name = input.name;
    if (input.description !== undefined) part.description = input.description;
    if (input.unitPrice !== undefined) part.unitPrice = input.unitPrice.toFixed(2);
    if (input.minStock !== undefined) part.minStock = input.minStock;
    if (input.supplier !== undefined) part.supplier = input.supplier;
    if (input.active !== undefined) part.active = input.active;

    part.updatedAt = new Date();
    const saved = await this.partsCatalogRepository.save(part);

    return {
      id: saved.id,
      name: saved.name,
      active: saved.active,
      updatedAt: saved.updatedAt,
    };
  }
}

