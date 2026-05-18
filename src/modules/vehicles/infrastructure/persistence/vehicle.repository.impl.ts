import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleRepository, VehicleFilters } from '../../domain/ports/vehicle.repository';
import { Vehicle } from '../../domain/vehicle.entity';
import { VehicleTypeormEntity } from './vehicle.orm-entity';
import { VehicleMapper } from './vehicle.mapper';
import { OrderOrmEntity } from '../../../order/infrastructure/persistence/order.orm-entity';

@Injectable()
export class VehicleRepositoryImpl implements VehicleRepository {
  constructor(
    @InjectRepository(VehicleTypeormEntity)
    private readonly repo: Repository<VehicleTypeormEntity>,
    @InjectRepository(OrderOrmEntity)
    private readonly orderRepo: Repository<OrderOrmEntity>,
  ) {}

  async findById(id: string): Promise<Vehicle | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? VehicleMapper.toDomain(entity) : null;
  }

  async findByPlate(plate: string): Promise<Vehicle | null> {
    const entity = await this.repo.findOne({ where: { plate } });
    return entity ? VehicleMapper.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string, filters: VehicleFilters): Promise<{ data: Vehicle[]; total: number }> {
    const limit = Math.min(filters.limit, 100);
    const skip = (filters.page - 1) * limit;
    const where: Record<string, unknown> = { customerId };
    if (filters.active !== undefined) where.active = filters.active;
    const [entities, total] = await this.repo.findAndCount({ where, order: { createdAt: 'DESC' }, take: limit, skip });
    return { data: entities.map(VehicleMapper.toDomain), total };
  }

  async findAll(filters: VehicleFilters): Promise<{ data: Vehicle[]; total: number }> {
    const limit = Math.min(filters.limit, 100);
    const skip = (filters.page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.active !== undefined) where.active = filters.active;
    const [entities, total] = await this.repo.findAndCount({ where, order: { createdAt: 'DESC' }, take: limit, skip });
    return { data: entities.map(VehicleMapper.toDomain), total };
  }

  async save(vehicle: Vehicle): Promise<void> {
    const entity = VehicleMapper.toOrm(vehicle);
    await this.repo.save(entity);
  }

  async existsByPlate(plate: string): Promise<boolean> {
    const count = await this.repo.count({ where: { plate } });
    return count > 0;
  }

  async hasActiveOrders(vehicleId: string): Promise<boolean> {
    const vehicle = await this.repo.findOne({ where: { id: vehicleId } });
    if (!vehicle) return false;
    const terminalStatuses = ['COMPLETED', 'PAID', 'DELIVERED', 'CANCELLED', 'REJECTED'];
    const count = await this.orderRepo.createQueryBuilder('order')
      .where('order.vehiclePlate = :plate', { plate: vehicle.plate })
      .andWhere('order.status NOT IN (:...statuses)', { statuses: terminalStatuses })
      .getCount();
    return count > 0;
  }
}
