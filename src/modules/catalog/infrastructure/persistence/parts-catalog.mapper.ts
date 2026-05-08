import { Money } from '@/shared/domain/value-objects/money.vo';
// Ajuste para seu domínio real:
import { PartCatalogId, PartsCatalog } from '../../domain/parts-catalog.entity';
import { PartsCatalogOrmEntity } from './parts-catalog.orm-entity';

export class PartsCatalogMapper {
  static toDomain(orm: PartsCatalogOrmEntity): PartsCatalog {
    return PartsCatalog.restore({
      id: PartCatalogId.fromString(orm.id) as PartCatalogId,
      name: orm.name,
      description: orm.description,
      unitPrice: Money.fromDecimal(Number(orm.unitPrice)),
      stockQuantity: orm.stockQuantity,
      minStock: orm.minStock,
      supplier: orm.supplier,
      active: orm.active,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(entity: PartsCatalog): PartsCatalogOrmEntity {
    const orm = new PartsCatalogOrmEntity();
    orm.id = entity.id().value;
    orm.name = entity.name;
    orm.description = entity.description;
    orm.unitPrice = entity.unitPrice.decimal.toFixed(2);
    orm.stockQuantity = entity.stockQuantity;
    orm.minStock = entity.minStock;
    orm.supplier = entity.supplier;
    orm.active = entity.active;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }
}
