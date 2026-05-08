import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PartsCatalogOrmEntity } from '../../../infrastructure/persistence/parts-catalog.orm-entity';

@Injectable()
export class ListPartsUseCase {
  constructor(
    @InjectRepository(PartsCatalogOrmEntity)
    private readonly partsCatalogRepository: Repository<PartsCatalogOrmEntity>,
  ) {}

  async execute(params: { includeInactive?: boolean; lowStockOnly?: boolean } = {}) {
    const query = this.partsCatalogRepository.createQueryBuilder('parts');

    if (!params.includeInactive) {
      query.where('parts.active = true');
    }

    if (params.lowStockOnly) {
      query.andWhere('parts.stock_quantity <= parts.min_stock');
    }

    query.orderBy('parts.created_at', 'DESC');

    const parts = await query.getMany();

    return parts.map((part) => ({
      id: part.id,
      name: part.name,
      description: part.description,
      unitPrice: Number(part.unitPrice),
      stockQuantity: part.stockQuantity,
      minStock: part.minStock,
      supplier: part.supplier,
      active: part.active,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
      lowStock: part.stockQuantity <= part.minStock,
    }));
  }
}

