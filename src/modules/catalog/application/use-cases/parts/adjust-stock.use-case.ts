import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PartsCatalogOrmEntity } from '../../../infrastructure/persistence/parts-catalog.orm-entity';

@Injectable()
export class AdjustStockUseCase {
  constructor(
	@InjectRepository(PartsCatalogOrmEntity)
	private readonly partsCatalogRepository: Repository<PartsCatalogOrmEntity>,
  ) {}

  async execute(id: string, delta: number) {
	const part = await this.partsCatalogRepository.findOne({ where: { id } });
	if (!part) {
	  throw new NotFoundException('Part not found');
	}

	if (!Number.isInteger(delta) || delta === 0) {
	  throw new BadRequestException('Stock delta must be a non-zero integer');
	}

	const nextStock = part.stockQuantity + delta;
	if (nextStock < 0) {
	  throw new BadRequestException('Insufficient stock');
	}

	part.stockQuantity = nextStock;
	part.updatedAt = new Date();

	const saved = await this.partsCatalogRepository.save(part);

	return {
	  id: saved.id,
	  stockQuantity: saved.stockQuantity,
	  minStock: saved.minStock,
	  lowStock: saved.stockQuantity <= saved.minStock,
	  updatedAt: saved.updatedAt,
	};
  }
}

