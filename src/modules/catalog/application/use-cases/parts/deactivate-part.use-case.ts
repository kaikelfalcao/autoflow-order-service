import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PartsCatalogOrmEntity } from '../../../infrastructure/persistence/parts-catalog.orm-entity';

@Injectable()
export class DeactivatePartUseCase {
  constructor(
    @InjectRepository(PartsCatalogOrmEntity)
    private readonly partsCatalogRepository: Repository<PartsCatalogOrmEntity>,
  ) {}

  async execute(id: string) {
    const part = await this.partsCatalogRepository.findOne({ where: { id } });
    if (!part) {
      throw new NotFoundException('Part not found');
    }

    part.active = false;
    part.updatedAt = new Date();
    await this.partsCatalogRepository.save(part);

    return {
      id: part.id,
      active: part.active,
    };
  }
}

