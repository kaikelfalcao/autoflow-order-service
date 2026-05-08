import { Money } from '@/shared/domain/value-objects/money.vo';
import { Duration } from '../../domain/value-objects/duration.vo';
// Ajuste para seu domínio real:
import { ServiceCatalog } from '../../domain/service-catalog.entity';
import { ServiceId } from '../../domain/value-objects/service-id.vo';
import { ServiceCatalogOrmEntity } from './service-catalog.orm-entity';

export class ServiceCatalogMapper {
  static toDomain(orm: ServiceCatalogOrmEntity): ServiceCatalog {
    return ServiceCatalog.restore({
      id: ServiceId.fromString(orm.id) as ServiceId,
      name: orm.name,
      description: orm.description,
      basePrice: Money.fromDecimal(Number(orm.basePrice)),
      estimatedDuration: Duration.restore(orm.estimatedDurationMinutes),
      category: orm.category,
      active: orm.active,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(entity: ServiceCatalog): ServiceCatalogOrmEntity {
    const orm = new ServiceCatalogOrmEntity();
    orm.id = entity.id().value;
    orm.name = entity.name;
    orm.description = entity.description;
    orm.basePrice = entity.basePrice.decimal.toFixed(2);
    orm.estimatedDurationMinutes = entity.estimatedDuration.minutes;
    orm.category = entity.category;
    orm.active = entity.active;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }
}
