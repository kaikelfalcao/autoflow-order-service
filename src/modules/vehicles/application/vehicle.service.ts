import { Inject, Injectable } from '@nestjs/common';
import { VehicleRepository, VehicleFilters, VEHICLE_REPOSITORY } from '../domain/ports/vehicle.repository';
import { CustomerRepository, CUSTOMER_REPOSITORY } from '../../customers/domain/ports/customer.repository';
import { VehicleNotFoundError } from '../domain/errors/vehicle-not-found.error';
import { VehicleAlreadyExistsError } from '../domain/errors/vehicle-already-exists.error';
import { VehicleHasActiveOrdersError } from '../domain/errors/vehicle-has-active-orders.error';
import { CustomerNotFoundError } from '../../customers/domain/errors/customer-not-found.error';
import { InvalidMileageError } from '../domain/errors/invalid-mileage.error';
import { Vehicle } from '../domain/vehicle.entity';
import { Plate } from '../domain/value-objects/plate.vo';
import { AppLogger } from '../../../infrastructure/observability/logger';

export interface CreateVehicleDto {
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileageKm?: number;
}

export interface UpdateVehicleDto {
  color?: string;
  mileageKm?: number;
  brand?: string;
  model?: string;
}

export interface ListVehiclesDto {
  customerId?: string;
  active?: boolean;
  page: number;
  limit: number;
}

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: VehicleRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    private readonly logger: AppLogger,
  ) {}

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) throw new CustomerNotFoundError(dto.customerId);

    const plate = new Plate(dto.plate);
    const exists = await this.vehicleRepository.existsByPlate(plate.value);
    if (exists) throw new VehicleAlreadyExistsError(plate.value);

    const vehicle = Vehicle.create({
      customerId: dto.customerId,
      plate: plate.value,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      mileageKm: dto.mileageKm ?? 0,
    });

    await this.vehicleRepository.save(vehicle);
    this.logger.log(`Vehicle created: ${vehicle.id}`, VehicleService.name);
    return vehicle;
  }

  async findById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new VehicleNotFoundError(id);
    return vehicle;
  }

  async findByCustomerId(customerId: string, dto: ListVehiclesDto): Promise<{ data: Vehicle[]; total: number; page: number; limit: number }> {
    const limit = Math.min(dto.limit, 100);
    const filters: VehicleFilters = { customerId, active: dto.active, page: dto.page, limit };
    const { data, total } = await this.vehicleRepository.findByCustomerId(customerId, filters);
    return { data, total, page: dto.page, limit };
  }

  async findAll(dto: ListVehiclesDto): Promise<{ data: Vehicle[]; total: number; page: number; limit: number }> {
    const limit = Math.min(dto.limit, 100);
    const filters: VehicleFilters = { customerId: dto.customerId, active: dto.active, page: dto.page, limit };
    const { data, total } = await this.vehicleRepository.findAll(filters);
    return { data, total, page: dto.page, limit };
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new VehicleNotFoundError(id);

    if (dto.mileageKm !== undefined) {
      if (dto.mileageKm < vehicle.mileageKm) {
        throw new InvalidMileageError(`New mileage (${dto.mileageKm}) cannot be less than current mileage (${vehicle.mileageKm})`);
      }
      vehicle.updateMileage(dto.mileageKm);
    }
    vehicle.updateAttributes({ color: dto.color, brand: dto.brand, model: dto.model });

    await this.vehicleRepository.save(vehicle);
    this.logger.log(`Vehicle updated: ${id}`, VehicleService.name);
    return vehicle;
  }

  async deactivate(id: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) throw new VehicleNotFoundError(id);

    const hasOrders = await this.vehicleRepository.hasActiveOrders(id);
    if (hasOrders) {
      this.logger.warn(`Vehicle ${id} has active orders, cannot deactivate`, VehicleService.name);
      throw new VehicleHasActiveOrdersError(id);
    }

    vehicle.deactivate();
    await this.vehicleRepository.save(vehicle);
    this.logger.log(`Vehicle deactivated: ${id}`, VehicleService.name);
  }
}
